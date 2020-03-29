const { ipcRenderer } = require('electron')

function getDebts (bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-debts', bookingYear)
    ipcRenderer.once('get-debts-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createDebt (debt) {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-debt', debt)
    ipcRenderer.once('create-debt-reply', (event, res) => {
      resolve(res)
    })
  })
}
function updateDebt (debt) {
  return new Promise(function (resolve) {
    ipcRenderer.send('update-debt', debt)
    ipcRenderer.once('update-debt-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deleteDebt (debtId) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-debt', debtId)
    ipcRenderer.once('delete-debt-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deleteDebts (debtsIds) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-debts', debtsIds)
    ipcRenderer.once('delete-debts-reply', (event, res) => {
      resolve(res)
    })
  })
}

module.exports = {
  getDebts: getDebts,
  createDebt: createDebt,
  updateDebt: updateDebt,
  deleteDebt: deleteDebt,
  deleteDebts: deleteDebts
}
