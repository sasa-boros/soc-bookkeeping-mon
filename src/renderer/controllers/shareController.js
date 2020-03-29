const { ipcRenderer } = require('electron')

function getShares (bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-shares', bookingYear)
    ipcRenderer.once('get-shares-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createShare (share) {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-share', share)
    ipcRenderer.once('create-share-reply', (event, res) => {
      resolve(res)
    })
  })
}
function updateShare (share) {
  return new Promise(function (resolve) {
    ipcRenderer.send('update-share', share)
    ipcRenderer.once('update-share-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deleteShare (shareId) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-share', shareId)
    ipcRenderer.once('delete-share-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deleteShares (sharesIds) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-shares', sharesIds)
    ipcRenderer.once('delete-shares-reply', (event, res) => {
      resolve(res)
    })
  })
}

module.exports = {
  getShares: getShares,
  createShare: createShare,
  updateShare: updateShare,
  deleteShare: deleteShare,
  deleteShares: deleteShares
}
