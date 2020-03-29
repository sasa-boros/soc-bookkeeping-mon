const Big = require('big.js')

class AnnualReport {
  constructor() {
    this.year = null
    this.churchMunicipality = null
    this.churchTown = null
    this.incomeCodes = []
    this.outcomeCodes = []
    this.incomePages = []
    this.outcomePages = []
    this.totalIncomePage = null
    this.totalOutcomePage = null
    this.sharesPage = null
    this.totalPage = null
    this.warnings = []
  }
}

module.exports = {
  AnnualReport: AnnualReport
}
