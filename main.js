const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 数据存储路径：用户文档目录下的 FocusFlow 文件夹
const DATA_DIR = path.join(os.homedir(), 'Documents', 'FocusFlow');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// 确保目录存在
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

ensureDir(DATA_DIR);
ensureDir(BACKUP_DIR);

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'FocusFlow - 待办与便签',
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        show: false, // 先隐藏，加载完成后再显示
        titleBarStyle: 'default'
    });

    mainWindow.loadFile('index.html');

    // 开发工具（打包前注释掉）
    // mainWindow.webContents.openDevTools();

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 读取数据
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const content = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(content);
        }
    } catch (e) {
        console.error('读取数据失败:', e);
    }
    return { todos: [], notes: [] };
}

// 保存数据（主文件）
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error('保存数据失败:', e);
        return false;
    }
}

// 自动备份（每次修改都生成时间戳备份）
function createBackup(data) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(BACKUP_DIR, `backup_${timestamp}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf-8');

        // 只保留最近 50 个备份，删除旧的
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('backup_'))
            .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime }))
            .sort((a, b) => b.time - a.time);

        if (backups.length > 50) {
            backups.slice(50).forEach(b => {
                fs.unlinkSync(path.join(BACKUP_DIR, b.name));
            });
        }

        return backupFile;
    } catch (e) {
        console.error('备份失败:', e);
        return null;
    }
}

// IPC 通信处理
ipcMain.handle('app:loadData', () => {
    return loadData();
});

ipcMain.handle('app:saveData', (event, data) => {
    const success = saveData(data);
    if (success) {
        createBackup(data);
    }
    return { success, path: DATA_FILE };
});

ipcMain.handle('app:exportData', async (event, data) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: '导出备份',
        defaultPath: path.join(os.homedir(), 'Desktop', `FocusFlow_备份_${new Date().toISOString().slice(0,10)}.json`),
        filters: [{ name: 'JSON 文件', extensions: ['json'] }]
    });

    if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return { success: true, path: filePath };
    }
    return { success: false };
});

ipcMain.handle('app:importData', async () => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: '导入备份',
        filters: [{ name: 'JSON 文件', extensions: ['json'] }],
        properties: ['openFile']
    });

    if (filePaths && filePaths.length > 0) {
        try {
            const content = fs.readFileSync(filePaths[0], 'utf-8');
            const data = JSON.parse(content);
            if (data.todos && data.notes) {
                saveData(data);
                createBackup(data);
                return { success: true, data };
            }
            return { success: false, error: '文件格式不正确' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
    return { success: false };
});

ipcMain.handle('app:getDataPath', () => {
    return DATA_DIR;
});

ipcMain.handle('app:openBackupFolder', () => {
    shell.openPath(BACKUP_DIR);
});

// 应用生命周期
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
