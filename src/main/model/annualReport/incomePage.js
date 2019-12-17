const Big = require('big.js')

class IncomePage {
  constructor() {
    this.ordinal = null
    this.paymentSlips = []
    this.totalIncomePerCode = []
    this.totalIncome = Big(0.0)
    this.transferFromPreviousMonth = Big(0.0)
    this.total = Big(0.0)
  }
}

module.exports = {
  IncomePage: IncomePage
}
