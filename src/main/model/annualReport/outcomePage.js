const Big = require('big.js')

class OutcomePage {
  constructor() {
    this.ordinal = null
    this.receipts = []
    this.totalOutcomePerCode = []
    this.totalOutcome = Big(0.0)
    this.transferToNextMonth = Big(0.0)
    this.total = Big(0.0)
  }
}

module.exports = {
  OutcomePage: OutcomePage
}
