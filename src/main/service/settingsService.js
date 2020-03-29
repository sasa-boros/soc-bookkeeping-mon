const settingsDao = require('../dao/settingsDao')
const { app } = require('electron')
const path = require('path')
const zipper = require('zip-local');
const config = require('../config')

const Datastore = require('nedb')

async function getSettings () {
    console.log('Getting settings')
    var settings = await settingsDao.findOne()
    console.log(`Returning settings: \n${JSON.stringify(settings, null, 2)}`)
    return settings
}

async function createSettings (settings) {
    console.log(`Creating settings: \n${JSON.stringify(settings, null, 2)}`)
    await settingsDao.removeAll()
    await settingsDao.insert(settings)
    console.log('Successfully created settings')
}

async function exportBackup () {
    console.log('Exporting backup')
    zipper.sync.zip(path.join(app.getPath('userData'), config.db.path)).compress().save(path.join(app.getPath('userData'), 'backup.zip'));
    console.log('Successfully exported backup')
}

async function importBackup (bakPath) {
    console.log('Importing backup')
    zipper.sync.unzip(bakPath).save(path.join(app.getPath('userData'), config.db.path))
    await loadDbs()
    console.log('Successfully imported backup')
}

async function loadDbs() {
    console.log('Loading dbs')
    var db = {}
    db.annualReportCommons = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.annualReportCommons), autoload: true})
    db.annualReports = new Datastore({ filename:  path.join(app.getPath('userData'), config.db.collections.annualReports), autoload: true})
    db.paymentSlips = new Datastore({ filename:  path.join(app.getPath('userData'), config.db.collections.paymentSlips), autoload: true})
    db.receipts = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.receipts), autoload: true})
    db.shares = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.shares), autoload: true})
    db.savings = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.savings), autoload: true})
    db.items = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.items), autoload: true})
    db.debts = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.debts), autoload: true})
    db.incomeCodes = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.incomeCodes), autoload: true})
    db.outcomeCodes = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.outcomeCodes), autoload: true})
    db.settings = new Datastore({ filename: path.join(app.getPath('userData'), config.db.collections.settings), autoload: true})
    global.db = db
    console.log('Successfully loaded dbs')
}

module.exports = {
    getSettings: getSettings,
    createSettings: createSettings,
    exportBackup: exportBackup,
    importBackup: importBackup,
    loadDbs: loadDbs
}