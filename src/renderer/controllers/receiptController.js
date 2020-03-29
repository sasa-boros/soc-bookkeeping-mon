const { ipcRenderer } = require('electron')

function checkReceiptsValidity (bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('check-receipts-validity', bookingYear)
    ipcRenderer.once('check-receipts-validity-reply', (event, res) => {
      resolve(res)
    })
  })
}

function getReceipts (bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-receipts', bookingYear)
    ipcRenderer.once('get-receipts-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createReceipt (receipt) {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-receipt', receipt)
    ipcRenderer.once('create-receipt-reply', (event, res) => {
      resolve(res)
    })
  })
}

function updateReceipt (receipt) {
  return new Promise(function (resolve) {
    ipcRenderer.send('update-receipt', receipt)
    ipcRenderer.once('update-receipt-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deleteReceipt (id, bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-receipt', id, bookingYear)
    ipcRenderer.once('delete-receipt-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deleteReceipts (ids, bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-receipts', ids, bookingYear)
    ipcRenderer.once('delete-receipts-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createReceiptPdf () {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-receipt-pdf')
    ipcRenderer.once('create-receipt-pdf-reply', (event, res) => {
      resolve(res)
    })
  })
}

module.exports = {
  checkReceiptsValidity: checkReceiptsValidity,
  getReceipts: getReceipts,
  createReceipt: createReceipt,
  updateReceipt: updateReceipt,
  deleteReceipt: deleteReceipt,
  deleteReceipts: deleteReceipts,
  createReceiptPdf: createReceiptPdf
}
