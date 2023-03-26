const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
require('@electron/remote/main').initialize()

const global = require('../global');
global.homedir = require('os').homedir();
global.args = process.argv;

console.log(process.argv)

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  })

  
  mainWindow.loadFile('./html/index.html')
  //mainWindow.webContents.openDevTools()
  require("@electron/remote/main").enable(mainWindow.webContents);

  global.version = app.getVersion()

  mainWindow.on('blur', () => {
    mainWindow.close();
    app.quit()
  });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });

})

app.on('window-all-closed', function () {
  //if (process.platform !== 'darwin')

  try{
    app.quit()
  } catch(Error){

  }

});

