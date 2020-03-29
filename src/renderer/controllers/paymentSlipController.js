const { ipcRenderer } = require('electron')

function checkPaymentSlipsValidity (bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('check-payment-slips-validity', bookingYear)
    ipcRenderer.once('check-payment-slips-validity-reply', (event, res) => {
      resolve(res)
    })
  })
}

function getPaymentSlips (bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-payment-slips', bookingYear)
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

function deletePaymentSlip (id, bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-payment-slip', id, bookingYear)
    ipcRenderer.once('delete-payment-slip-reply', (event, res) => {
      resolve(res)
    })
  })
}

function deletePaymentSlips (ids, bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('delete-payment-slips', ids, bookingYear)
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
  checkPaymentSlipsValidity: checkPaymentSlipsValidity,
  getPaymentSlips: getPaymentSlips,
  createPaymentSlip: createPaymentSlip,
  deletePaymentSlip: deletePaymentSlip,
  deletePaymentSlips: deletePaymentSlips,
  updatePaymentSlip: updatePaymentSlip,
  createPaymentSlipPdf: createPaymentSlipPdf
}
