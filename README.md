# FocusFlow 桌面应用

## 项目简介
FocusFlow 是一个基于 Electron 的桌面待办清单与便签应用，支持 Windows 和 macOS 安装。

## 功能特性
- ✅ 可勾选的待办清单，带进度统计
- 📝 可编辑的彩色便签
- 💾 每次修改自动保存到本地文件
- 📁 每次修改自动生成时间戳备份（保留最近50份）
- 📤 手动导出/导入 JSON 备份
- 🌙 深色/浅色模式切换

## 数据存储位置
- Windows: `C:\Users\你的用户名\Documents\FocusFlow\`
- macOS: `~/Documents/FocusFlow/`

## 打包安装教程

### 前提条件
1. 安装 [Node.js](https://nodejs.org/) (推荐 LTS 版本)
2. 安装 Git（可选）

### 步骤

#### 1. 安装依赖
```bash
# 进入项目目录
cd FocusFlow-App

# 安装依赖
npm install
```

#### 2. 开发运行（测试用）
```bash
npm start
```

#### 3. 打包成安装程序

**Windows 安装包 (.exe):**
```bash
npm run build:win
```
打包完成后在 `dist` 文件夹中会生成：
- `FocusFlow Setup 1.0.0.exe` - 安装程序（双击安装）
- `FocusFlow-1.0.0-win.zip` - 绿色版压缩包

**macOS 安装包 (.dmg):**
```bash
npm run build:mac
```
打包完成后在 `dist` 文件夹中会生成：
- `FocusFlow-1.0.0.dmg` - 磁盘映像安装包

**同时打包所有平台:**
```bash
npm run build
```

### 安装后使用
1. 双击生成的 `.exe` 或 `.dmg` 文件
2. 按向导完成安装（可自定义安装路径）
3. 桌面会生成快捷方式，双击即可运行
4. 所有数据自动保存在 `文档/FocusFlow` 文件夹中

## 项目文件说明
```
FocusFlow-App/
├── package.json      # 项目配置
├── main.js           # 主进程（窗口管理、文件读写）
├── preload.js        # 安全桥接
├── index.html        # 应用界面
├── assets/           # 图标资源
└── README.md         # 本文件
```

## 技术栈
- Electron 30 - 桌面应用框架
- electron-builder - 打包工具
- 纯 HTML/CSS/JS 前端

## 注意事项
- 首次运行时会自动创建数据目录
- 备份文件保留最近 50 个，旧备份会自动清理
- 卸载软件不会删除数据文件，如需彻底删除请手动删除 `Documents/FocusFlow` 文件夹
