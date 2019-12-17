const Big = require('big.js')

class TotalOutcomePage {
  constructor() {
    this.totalOutcomePerCode = []
    this.totalOutcomePerCodeAllowed = []
    this.totalOutcomeAllowed = Big(0.0)
    this.totalOutcome = Big(0.0)
    this.netIncome = Big(0.0)
    this.transferFromPreviousYear = Big(0.0) 
    this.transferToNextYear = Big(0.0)
  }
}

module.exports = {
  TotalOutcomePage: TotalOutcomePage
}
