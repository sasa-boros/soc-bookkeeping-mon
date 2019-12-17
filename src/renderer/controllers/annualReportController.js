const { ipcRenderer } = require('electron')

function getAnnualReport (year) {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-annual-report', year)
    ipcRenderer.once('get-annual-report-reply', (event, res) => {
      resolve(res)
    })
  })
}

function getAnnualReportData (year) {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-annual-report-data', year)
    ipcRenderer.once('get-annual-report-data-reply', (event, res) => {
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

function getAnnualReportCommonData () {
  return new Promise(function (resolve) {
    ipcRenderer.send('get-annual-report-common-data')
    ipcRenderer.once('get-annual-report-common-data-reply', (event, res) => {
      resolve(res)
    })
  })
}

function createAnnualReportCommonData (common) {
  return new Promise(function (resolve) {
    ipcRenderer.send('create-annual-report-common-data', common)
    ipcRenderer.once('create-annual-report-common-data-reply', (event, res) => {
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
  getAnnualReportCommonData: getAnnualReportCommonData,
  getAnnualReportData: getAnnualReportData,
  createAnnualReportCommonData: createAnnualReportCommonData,
  createAnnualReportData: createAnnualReportData,
  getAnnualReportPages: getAnnualReportPages,
  createAnnualReportPdf: createAnnualReportPdf
}
