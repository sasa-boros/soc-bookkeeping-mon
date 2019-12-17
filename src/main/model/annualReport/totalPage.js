const Big = require('big.js')

class TotalPage {
  constructor() {
    this.items = []
    this.debts = []
    this.realEstateLandValue = Big(0.0)
    this.realEstateBuildingsValue = Big(0.0)
    this.totalItemValue = Big(0.0)
    this.totalPropertyValue = Big(0.0)
    this.totalDebt = Big(0.0)
    this.propertyValue = Big(0.0)
  }
}

module.exports = {
  TotalPage: TotalPage
}
