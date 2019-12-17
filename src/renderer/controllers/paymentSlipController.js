const { ipcRenderer } = require('electron')

function arePaymentSlipsValid () {
  return new Promise(function (resolve) {
    ipcRenderer.send('are-payment-slips-valid')
    ipcRenderer.once('are-payment-slips-valid-reply', (event, res) => {
      resolve(res)
    })
  })
}

function getPaymentSlips () {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-payment-slips')
    ipcRenderer.once('get-payment-slips-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createPaymentSlip (paymentSlip) {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-payment-slip', paymentSlip)
    ipcRenderer.once('create-payment-slip-reply', (event, res) => {
      resolve(res)
    })
  })
}
function updatePaymentSlip (paymentSlip) {
  return new Promise(function (resolve) {
    ipcRenderer.send('update-payment-slip', paymentSlip)
    ipcRenderer.once('update-payment-slip-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deletePaymentSlip (paymentSlipId) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-payment-slip', paymentSlipId)
    ipcRenderer.once('delete-payment-slip-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deletePaymentSlips (paymentSlipsIds) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-payment-slips', paymentSlipsIds)
    ipcRenderer.once('delete-payment-slips-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createPaymentSlipPdf () {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-payment-slip-pdf')
    ipcRenderer.once('create-payment-slip-pdf-reply', (event, res) => {
      resolve(res)
    })
  })
}

module.exports = {
  arePaymentSlipsValid: arePaymentSlipsValid,
  getPaymentSlips: getPaymentSlips,
  createPaymentSlip: createPaymentSlip,
  deletePaymentSlip: deletePaymentSlip,
  deletePaymentSlips: deletePaymentSlips,
  updatePaymentSlip: updatePaymentSlip,
  createPaymentSlipPdf: createPaymentSlipPdf
}
