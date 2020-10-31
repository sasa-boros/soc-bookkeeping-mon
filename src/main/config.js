const dbPath = '/bookkeeping_db'

const config = {
  db: {
    path: dbPath,
    collections: {
      annualReports: `${dbPath}/annualReports`,
      paymentSlips: `${dbPath}/paymentSlips`,
      receipts: `${dbPath}/receipts`,
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
