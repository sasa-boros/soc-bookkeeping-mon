const Big = require('big.js')

class SharesPage {
  constructor() {
    this.shares = []
    this.savings = []
    this.totalNominalValue = Big(0.0)
    this.shareValueDepreciatedDuringYear = Big(0.0)
    this.nominalValueOnYearEnd = Big(0.0)
    this.totalSavingAmountAtYearStart = Big(0.0)
    this.totalSavingAmountDeposited = Big(0.0)
    this.totalSavingAmountPlusDeposited = Big(0.0)
    this.totalSavingAmountWithdrawn = Big(0.0)
    this.savingAmountOnYearEnd = Big(0.0)
  }
}

module.exports = {
  SharesPage: SharesPage
}
