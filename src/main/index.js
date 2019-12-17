// Using chrome cache to speed up app
require('v8-compile-cache');

const { app, BrowserWindow } = require('electron')
const Datastore = require('nedb')
const path = require('path')
const config = require('./config')

// Connecting to neDB
var db = {}
db.annualReportCommons = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.annualReportCommons), autoload: true})
db.annualReports = new Datastore({ filename:  path.join(app.getPath('userData'), config.db.collections.annualReports), autoload: true})
db.paymentSlips = new Datastore({ filename:  path.join(app.getPath('userData'), config.db.collections.paymentSlips), autoload: true})
db.defaultPaymentSlips = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.defaultPaymentSlips), autoload: true})
db.receipts = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.receipts), autoload: true})
db.defaultReceipts = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.defaultReceipts), autoload: true})
db.shares = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.shares), autoload: true})
db.savings = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.savings), autoload: true})
db.items = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.items), autoload: true})
db.debts = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.debts), autoload: true})
db.incomeCodes = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.incomeCodes), autoload: true})
db.outcomeCodes = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.outcomeCodes), autoload: true})
db.settings = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.settings), autoload: true})
global.db = db

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

const settingsService = require('./service/settingsService')

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

async function createWindow () {
  /**
   * Initial window options
   */
  const settings = await settingsService.getSettings()
  mainWindow = new BrowserWindow({
    huseContentSize: true,
    backgroundColor: 'white',
    webPreferences: {
      zoomFactor: settings && settings.zoomLevel ? settings.zoomLevel : 1.3
    }
  })
  mainWindow.maximize()
  mainWindow.loadURL(winURL)
  
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

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
