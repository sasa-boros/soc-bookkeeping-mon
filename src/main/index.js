// Using chrome cache to speed up app
require('v8-compile-cache')

const settingsService = require('./service/settingsService')

const { app, BrowserWindow } = require('electron')
const contextMenu = require('electron-context-menu');
const path = require('path')

// Connecting to neDB
settingsService.loadDbs()

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
} 

// Loading store
require('../renderer/store')
// Loading ipc main router
require('./ipcRouter')

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

async function createWindow () {
  const settings = await settingsService.getSettings()
  mainWindow = new BrowserWindow({
    show: false,
    backgroundColor: 'white'
  })
  mainWindow.maximize()
  mainWindow.loadURL(winURL)
  
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.setZoomFactor(settings && settings.zoomLevel ? settings.zoomLevel : 1.2)
    mainWindow.show()
  })
}

contextMenu({
  prepend: (defaultActions, params) => [
  ],
  showLookUpSelection: false,
  showCopyImage: false,
  showCopyImageAddress: false,
  showSaveImage: false,
  showSaveImageAs: false,
  showInspectElement: false,
  showServices: false,
  labels: {
    cut: 'Исеци',
		copy: 'Копирај',
    paste: 'Налепи'
  },
  shouldShowMenu: (event, params) => {
    return params.mediaType !== 'image' && (!params.linkURL || params.linkURL == '')
  }
});


app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater }= require(''electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
