const { ipcRenderer } = require('electron')

function getItems (bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-items', bookingYear)
    ipcRenderer.once('get-items-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createItem (item) {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-item', item)
    ipcRenderer.once('create-item-reply', (event, res) => {
      resolve(res)
    })
  })
}
function updateItem (item) {
  return new Promise(function (resolve) {
    ipcRenderer.send('update-item', item)
    ipcRenderer.once('update-item-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deleteItem (itemId) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-item', itemId)
    ipcRenderer.once('delete-item-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deleteItems (itemsIds) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-items', itemsIds)
    ipcRenderer.once('delete-items-reply', (event, res) => {
      resolve(res)
    })
  })
}

module.exports = {
  getItems: getItems,
  createItem: createItem,
  updateItem: updateItem,
  deleteItem: deleteItem,
  deleteItems: deleteItems
}
