// Modules to control application life and create native browser window
const { globalShortcut, app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron')
const fileHelper = require('./FileHelper/fileElectronHelper');
const metricHelper = require('./metrics');
const path = require('path')

const metricsMap = {
  mood: (dartFilePaths) => metricHelper.calculateMOODMetrics(dartFilePaths),
  ck: (dartFilePaths) => metricHelper.calculateCKMetrics(dartFilePaths),
  trd: (dartFilePaths) => metricHelper.calculateTraditionalMetrics(dartFilePaths),
  all: (dartFilePaths) => {
    return {...this.mood(dartFilePaths), ...this.ck(dartFilePaths), ...this.trd(dartFilePaths)}
  }
}

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

    checkFlutterProject(path){
      let splitedPath = path.split("\\"), isFlutterProject = fileHelper.checkFlutterPrj(path);
      isFlutterProject.projectName = splitedPath[splitedPath.length-1];
      return isFlutterProject;
    }    

    setUpFolderCheckListener(){
      this.ipcMain.on('folder-check', (event, options) => {
        if (options.multipleProject) {
          let flutterProjects = [], folderPaths = fileHelper.getDirectories(options.path);
          //console.log(folderPaths);
          for (let index = 0; index < folderPaths.length; index++) {
            const path = folderPaths[index];
            //console.log("Path: " + path);
            let isFlutterProject =  this.checkFlutterProject(path)
            if(isFlutterProject.isFlutterProject){
              flutterProjects.push(isFlutterProject);
            }
          }
          event.sender.send('checked-folders', {flutterProjects: flutterProjects});      
        }
        else{
          let isFlutterProject = this.checkFlutterProject(options.path);
          event.sender.send('checked-folder', isFlutterProject);
        }
      })
    }

    setUpSmellListener(){
      this.ipcMain.on('smell', (event, _) => {
        event.sender.send('asynchronous-reply', {});
      })
    }

    setUpMetricListener(){
      ipcMain.on('metric', (event, data) => {
        let res;
        if(data.hasOneProject){
          console.log("\n\n\n\n\n\nSingle\n\n\n");
          
          res = metricsMap[data.metricType](data.dartFilePaths);
          event.sender.send('project-metrics', [{...res, projectName:data.projectName}]);
        }
        else{
          console.log("\n\n\n\n\n\njfsl;fjf\n\n\n");
          //console.log(data.projects);
          
          res = [];
          for (let index = 0; index < data.projects.length; index++) {
            console.log("Project " + index + ":");
            console.log(data.projects[index]);
            const resOneProject = metricsMap[data.metricType](data.projects[index].dartFiles.map(file => file.path));
            res.push({...resOneProject, projectName:data.projects[index].projectName})
          }
          //res = metricsMap[data.metricType](data.dartFilePaths);
          event.sender.send('mult-projects-metrics', res);
        }
      }) 
    }

    setUpAllListener() {
      this.setUpMetricListener();
      this.setUpSmellListener();
      this.setUpFolderCheckListener();
    }
}

module.exports = DesktopApp;