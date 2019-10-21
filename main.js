// Modules to control application life and create native browser window
const { globalShortcut, app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron')
const fileHelper = require('./FileHelper/fileElctronHelper');
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

class DesktopApp {
  constructor() {
    this.app = app;
    this.ipcMain = ipcMain;
    this.setUpApp();
    this.setUpAllListener();
  }
  
  createWindow () {
      win = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
          nodeIntegration: true,
          preload: path.join(__dirname, 'preload.js')
        },
      })
      globalShortcut.register('f5', function() {
        console.log('f5 is pressed')
        win.reload()
      })
      globalShortcut.register('CommandOrControl+R', function() {
        console.log('CommandOrControl+R is pressed')
        win.reload()
      })
      win.loadFile('index.html')
    
      win.webContents.openDevTools()
    
      win.on('closed', () => {
        win = null
      })
    }
    
    setUpApp(){
      this.app.on('ready', this.createWindow)

      this.app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          this.app.quit()
        }
      })
      
      this.app.on('activate', () => {
        if (win === null) {
          this.createWindow()
        }
      })
    }

    setUpFolderCheckListener(){
      this.ipcMain.on('folder-check', (event, path) => {
        let isFlutterProject = fileHelper.checkFlutterPrj(path);
        event.sender.send('checked-folder', isFlutterProject);
      })
    }

    setUpSmellListener(){
      this.ipcMain.on('smell', (event, _) => {
        event.sender.send('asynchronous-reply', {});
      })
    }

    setUpMetricListener(){
      ipcMain.on('metric', (event, data) => {
        event.sender.send('end-process', {});
      }) 
    }

    setUpAllListener() {
      this.setUpMetricListener();
      this.setUpSmellListener();
      this.setUpFolderCheckListener();
    }
}

module.exports = DesktopApp;