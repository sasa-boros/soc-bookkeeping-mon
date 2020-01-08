const dbPath = '/bookkeeping_db'

const config = {
  db: {
    path: dbPath,
    collections: {
      annualReportCommons: `${dbPath}/annualReportCommons`,
      annualReports: `${dbPath}/annualReports`,
      paymentSlips: `${dbPath}/paymentSlips`,
      defaultPaymentSlips: `${dbPath}/defaultPaymentSlips`,
      receipts: `${dbPath}/receipts`,
      defaultReceipts: `${dbPath}/defaultReceipts`,
      shares: `${dbPath}/shares`,
      savings: `${dbPath}/savings`,
      items: `${dbPath}/items`,
      debts: `${dbPath}/debts`,
      incomeCodes: `${dbPath}/incomeCodes`,
      outcomeCodes: `${dbPath}/outcomeCodes`,
      settings: `${dbPath}/settings`
    }
  }
}

module.exports = config
