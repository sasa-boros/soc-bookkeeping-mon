const { ipcRenderer } = require('electron')

function getSettings () {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-settings')
    ipcRenderer.once('get-settings-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createSettings (settings) {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-settings', settings)
    ipcRenderer.once('create-settings-reply', (event, res) => {
      resolve(res)
    })
  })
}

module.exports = {
  getSettings: getSettings,
  createSettings: createSettings
}
