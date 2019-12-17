const settingsDao = require('../dao/settingsDao')

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

module.exports = {
    getSettings: getSettings,
    createSettings: createSettings
}