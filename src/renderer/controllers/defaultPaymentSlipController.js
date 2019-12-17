const { ipcRenderer } = require('electron')

function getDefaultPaymentSlip () {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-default-payment-slip')
    ipcRenderer.once('get-default-payment-slip-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createDefaultPaymentSlip (defaultPaymentSlip) {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-default-payment-slip', defaultPaymentSlip)
    ipcRenderer.once('create-default-payment-slip-reply', (event, res) => {
      resolve(res)
    })
  })
}

module.exports = {
  getDefaultPaymentSlip: getDefaultPaymentSlip,
  createDefaultPaymentSlip: createDefaultPaymentSlip
}
