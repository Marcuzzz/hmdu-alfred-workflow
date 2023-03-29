const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
require('@electron/remote/main').initialize()
const { getEventList, getCalendarlist } = require('../tools/calendar');
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
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  })

  
  mainWindow.loadFile('./html/index.html')
  mainWindow.webContents.openDevTools()
  require("@electron/remote/main").enable(mainWindow.webContents);

  global.version = app.getVersion()

  // mainWindow.on('blur', () => {
  //   mainWindow.close();
  //   app.quit()
  // });

  ipcMain.on('get-event-list', async (event, calendarId) => {
    try {
      const myitems = await getEventList(calendarId);
      // Send the event list back to the renderer process
      console.log('calendarId from main',calendarId)
      event.sender.send('event-list-updated', myitems);
    } catch (err) {

      console.log('calendarId from main',err)
      // Handle errors
    }
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


