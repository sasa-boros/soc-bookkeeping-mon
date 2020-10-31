const { ipcRenderer } = require('electron')

function getAnnualReport (bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-annual-report', bookingYear)
    ipcRenderer.once('get-annual-report-reply', (event, res) => {
      resolve(res)
    })
  })
}

function getAnnualReportData (bookingYear) {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-annual-report-data', bookingYear)
    ipcRenderer.once('get-annual-report-data-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createAnnualReportData (annualReportData) {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-annual-report-data', annualReportData)
    ipcRenderer.once('create-annual-report-data-reply', (event, res) => {
      resolve(res)
    })
  })
}

function getAnnualReportPages (annualReport) {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-annual-report-pages', annualReport)
    ipcRenderer.once('get-annual-report-pages-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createAnnualReportPdf () {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-annual-report-pdf')
    ipcRenderer.once('create-annual-report-pdf-reply', (event, res) => {
      resolve(res)
    })
  })
}

module.exports = {
  getAnnualReport: getAnnualReport,
  getAnnualReportData: getAnnualReportData,
  createAnnualReportData: createAnnualReportData,
  getAnnualReportPages: getAnnualReportPages,
  createAnnualReportPdf: createAnnualReportPdf
}
