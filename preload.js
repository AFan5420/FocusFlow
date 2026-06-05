const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // 数据操作
    loadData: () => ipcRenderer.invoke('app:loadData'),
    saveData: (data) => ipcRenderer.invoke('app:saveData', data),
    exportData: (data) => ipcRenderer.invoke('app:exportData', data),
    importData: () => ipcRenderer.invoke('app:importData'),

    // 路径和文件夹
    getDataPath: () => ipcRenderer.invoke('app:getDataPath'),
    openBackupFolder: () => ipcRenderer.invoke('app:openBackupFolder')
});
