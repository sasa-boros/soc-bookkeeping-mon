const { ipcRenderer } = require('electron')

function getSavings () {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-savings')
    ipcRenderer.once('get-savings-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createSaving (saving) {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-saving', saving)
    ipcRenderer.once('create-saving-reply', (event, res) => {
      resolve(res)
    })
  })
}
function updateSaving (saving) {
  return new Promise(function (resolve) {
    ipcRenderer.send('update-saving', saving)
    ipcRenderer.once('update-saving-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deleteSaving (savingId) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-saving', savingId)
    ipcRenderer.once('delete-saving-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deleteSavings (savingsIds) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-savings', savingsIds)
    ipcRenderer.once('delete-savings-reply', (event, res) => {
      resolve(res)
    })
  })
}

module.exports = {
  getSavings: getSavings,
  createSaving: createSaving,
  updateSaving: updateSaving,
  deleteSaving: deleteSaving,
  deleteSavings: deleteSavings
}
