const { ipcRenderer } = require('electron')

function getIncomeCodes () {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-income-codes')
    ipcRenderer.once('get-income-codes-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createIncomeCode (incomeCode) {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-income-code', incomeCode)
    ipcRenderer.once('create-income-code-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deleteIncomeCode (incomeCodeId) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-income-code', incomeCodeId)
    ipcRenderer.once('delete-income-code-reply', (event, res) => {
      resolve(res)
    })
  })
}

function updateIncomeCode (incomeCode) {
  return new Promise(function (resolve) {
    ipcRenderer.send('update-income-code', incomeCode)
    ipcRenderer.once('update-income-code-reply', (event, res) => {
      resolve(res)
    })
  })
}

module.exports = {
  getIncomeCodes: getIncomeCodes,
  createIncomeCode: createIncomeCode,
  updateIncomeCode: updateIncomeCode,
  deleteIncomeCode: deleteIncomeCode
}
