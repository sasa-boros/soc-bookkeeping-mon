const Big = require('big.js')

class TotalIncomePage {
  constructor() {
    this.totalIncomePerCode = []
    this.totalIncomePerCodePredicted = []
    this.totalIncomePredicted = Big(0.0)
    this.totalIncome = Big(0.0)
  }
}

module.exports = {
  TotalIncomePage: TotalIncomePage
}
