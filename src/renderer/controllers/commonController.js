const { ipcRenderer } = require('electron')

function getBookedYears () {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-booked-years')
    ipcRenderer.once('get-booked-years-reply', (event, res) => {
      resolve(res)
    })
  })
}

module.exports = {
  getBookedYears: getBookedYears
}
