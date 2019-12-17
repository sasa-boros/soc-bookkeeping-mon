const { assert } = require('chai')
const mock = require('mock-require')
const jest = require('./node_modules/jest-mock')

// data
const incomeCode1 = { partition: '1', position: '1', description: 'I/1' }
const incomeCode2 = { partition: '1', position: '2', description: 'I/2' }
const incomeCode3 = { partition: '3', position: '2', description: 'III/2' }
const incomeCode4 = { partition: '4', position: '3', description: 'IV/3' }
const outcomeCode1 = { partition: '1', position: '1', description: 'I/1', isTaxed: true }
const outcomeCode2 = { partition: '1', position: '2', description: 'I/2', isTaxed: true }
const outcomeCode3 = { partition: '3', position: '2', description: 'III/2', isTaxed: true }
const outcomeCode4 = { partition: '4', position: '3', description: 'IV/3', isTaxed: true }
const paymentSlip1 = { ordinal: 1, annualReportPage: 1, date: new Date(2019, 0, 1), income: 200, incomeAsText: 'dvesta dinara', town: 'Novi Sad', reason: 'zato', payed: 'oni', incomePerCode: [{ incomeCode: incomeCode1, amount: 200 }] }
const paymentSlip2 = { ordinal: 2, annualReportPage: 1, date: new Date(2019, 0, 31), income: 100, incomeAsText: 'sto dinara', town: 'Beograd', reason: 'zato', payed: 'oni', incomePerCode: [{ incomeCode: incomeCode2, amount: 100 }] }
const paymentSlip3 = { ordinal: 3, annualReportPage: 2, date: new Date(2019, 1, 10), income: 150, incomeAsText: 'sto pedeset dinara', town: 'Begec', reason: 'zato', payed: 'oni', incomePerCode: [{ incomeCode: incomeCode2, amount: 100 }, { incomeCode: incomeCode3, amount: 50 }] }
const paymentSlip4 = { ordinal: 4, annualReportPage: 2, date: new Date(2019, 1, 20), income: 150, incomeAsText: 'sto pedeset dinara', town: 'Begec', reason: 'zato', payed: 'oni', incomePerCode: [{ incomeCode: incomeCode3, amount: 100 }, { incomeCode: incomeCode4, amount: 50 }] }
const receipt1 = { ordinal: 1, annualReportPage: 1, date: new Date(2019, 0, 1), outcome: 100, outcomeAsText: 'sto dinara', town: 'Futog', reason: 'zato', received: 'ja', outcomePerCode: [{ outcomeCode: outcomeCode1, amount: 100 }] }
const receipt2 = { ordinal: 2, annualReportPage: 1, date: new Date(2019, 0, 31), outcome: 50, outcomeAsText: 'pedeset dinara', town: 'Sanmarinovci', reason: 'zato', received: 'ja', outcomePerCode: [{ outcomeCode: outcomeCode2, amount: 50 }] }
const receipt3 = { ordinal: 3, annualReportPage: 2, date: new Date(2019, 1, 10), outcome: 50, outcomeAsText: 'pedeset dinara', town: 'Cortanovci', reason: 'zato', received: 'ja', outcomePerCode: [{ outcomeCode: outcomeCode2, amount: 25 }, { outcomeCode: outcomeCode3, amount: 25 }] }
const receipt4 = { ordinal: 4, annualReportPage: 2, date: new Date(2019, 1, 20), outcome: 50, outcomeAsText: 'pedeset dinara', town: 'Cortanovci', reason: 'zato', received: 'ja', outcomePerCode: [{ outcomeCode: outcomeCode3, amount: 25 }, { outcomeCode: outcomeCode4, amount: 25 }] }

mock('../../../../src/main/service/entityService', {
  getEntitiesByDate: jest.fn()
    .mockReturnValueOnce([paymentSlip1, paymentSlip2])
    .mockReturnValueOnce([receipt1, receipt2])
    .mockReturnValueOnce([paymentSlip3, paymentSlip4])
    .mockReturnValueOnce([receipt3, receipt4])
})

const annualReportService = require('../../../../src/main/service/annualReportService')

describe('Annual report service', () => {
  it('getAnnualReport should return valid annual report', async function () {
    const annualReport = await annualReportService.getAnnualReport(2019)
    assert.equal(annualReport.year, 2019)
    assert.lengthOf(annualReport.pages, 12)
    for (let i = 0; i < annualReport.pages.length; i++) {
      assert.equal(annualReport.pages[i].ordinal, i + 1)
      if (i === 0) {
        assert.lengthOf(annualReport.pages[i].paymentSlips, 2)
        assert.equal(annualReport.pages[i].paymentSlips[0], paymentSlip1)
        assert.equal(annualReport.pages[i].paymentSlips[1], paymentSlip2)
        assert.lengthOf(annualReport.pages[i].receipts, 2)
        assert.equal(annualReport.pages[i].receipts[0], receipt1)
        assert.equal(annualReport.pages[i].receipts[1], receipt2)
        assert.lengthOf(annualReport.pages[i].totalIncomePerCode, 2)
        assert.equal(annualReport.pages[i].totalIncomePerCode[0].incomeCode, incomeCode1)
        assert.equal(annualReport.pages[i].totalIncomePerCode[0].amount, 200)
        assert.equal(annualReport.pages[i].totalIncomePerCode[1].incomeCode, incomeCode2)
        assert.equal(annualReport.pages[i].totalIncomePerCode[1].amount, 100)
        assert.lengthOf(annualReport.pages[i].totalOutcomePerCode, 2)
        assert.equal(annualReport.pages[i].totalOutcomePerCode[0].outcomeCode, outcomeCode1)
        assert.equal(annualReport.pages[i].totalOutcomePerCode[0].amount, 100)
        assert.equal(annualReport.pages[i].totalOutcomePerCode[1].outcomeCode, outcomeCode2)
        assert.equal(annualReport.pages[i].totalOutcomePerCode[1].amount, 50)
        assert.equal(annualReport.pages[i].totalIncome, 300)
        assert.equal(annualReport.pages[i].totalOutcome, 150)
        assert.equal(annualReport.pages[i].transferFromPreviousMonth, 0)
        assert.equal(annualReport.pages[i].transferToNextMonth, 150)
        assert.equal(annualReport.pages[i].total, 300)
      } else if (i === 1) {
        assert.lengthOf(annualReport.pages[i].paymentSlips, 2)
        assert.equal(annualReport.pages[i].paymentSlips[0], paymentSlip3)
        assert.equal(annualReport.pages[i].paymentSlips[1], paymentSlip4)
        assert.lengthOf(annualReport.pages[i].receipts, 2)
        assert.equal(annualReport.pages[i].receipts[0], receipt3)
        assert.equal(annualReport.pages[i].receipts[1], receipt4)
        assert.lengthOf(annualReport.pages[i].totalIncomePerCode, 3)
        assert.equal(annualReport.pages[i].totalIncomePerCode[0].incomeCode, incomeCode2)
        assert.equal(annualReport.pages[i].totalIncomePerCode[0].amount, 100)
        assert.equal(annualReport.pages[i].totalIncomePerCode[1].incomeCode, incomeCode3)
        assert.equal(annualReport.pages[i].totalIncomePerCode[1].amount, 150)
        assert.equal(annualReport.pages[i].totalIncomePerCode[2].incomeCode, incomeCode4)
        assert.equal(annualReport.pages[i].totalIncomePerCode[2].amount, 50)
        assert.lengthOf(annualReport.pages[i].totalOutcomePerCode, 3)
        assert.equal(annualReport.pages[i].totalOutcomePerCode[0].outcomeCode, outcomeCode2)
        assert.equal(annualReport.pages[i].totalOutcomePerCode[0].amount, 25)
        assert.equal(annualReport.pages[i].totalOutcomePerCode[1].outcomeCode, outcomeCode3)
        assert.equal(annualReport.pages[i].totalOutcomePerCode[1].amount, 50)
        assert.equal(annualReport.pages[i].totalOutcomePerCode[2].outcomeCode, outcomeCode4)
        assert.equal(annualReport.pages[i].totalOutcomePerCode[2].amount, 25)
        assert.equal(annualReport.pages[i].totalIncome, 300)
        assert.equal(annualReport.pages[i].totalOutcome, 100)
        assert.equal(annualReport.pages[i].transferFromPreviousMonth, 150)
        assert.equal(annualReport.pages[i].transferToNextMonth, 350)
        assert.equal(annualReport.pages[i].total, 450)
      } else {
        assert.lengthOf(annualReport.pages[i].paymentSlips, 0)
        assert.lengthOf(annualReport.pages[i].receipts, 0)
        assert.lengthOf(annualReport.pages[i].totalIncomePerCode, 0)
        assert.lengthOf(annualReport.pages[i].totalOutcomePerCode, 0)
        assert.equal(annualReport.pages[i].totalIncome, 0)
        assert.equal(annualReport.pages[i].totalOutcome, 0)
        assert.equal(annualReport.pages[i].transferFromPreviousMonth, 350)
        assert.equal(annualReport.pages[i].transferToNextMonth, 350)
        assert.equal(annualReport.pages[i].total, 350)
      }
    }
    assert.lengthOf(annualReport.totalIncomePerCode, 4)
    assert.equal(annualReport.totalIncomePerCode[0].incomeCode, incomeCode1)
    assert.equal(annualReport.totalIncomePerCode[0].amount, 200)
    assert.equal(annualReport.totalIncomePerCode[1].incomeCode, incomeCode2)
    assert.equal(annualReport.totalIncomePerCode[1].amount, 200)
    assert.equal(annualReport.totalIncomePerCode[2].incomeCode, incomeCode3)
    assert.equal(annualReport.totalIncomePerCode[2].amount, 150)
    assert.equal(annualReport.totalIncomePerCode[3].incomeCode, incomeCode4)
    assert.equal(annualReport.totalIncomePerCode[3].amount, 50)
    assert.lengthOf(annualReport.totalOutcomePerCode, 4)
    assert.equal(annualReport.totalOutcomePerCode[0].outcomeCode, outcomeCode1)
    assert.equal(annualReport.totalOutcomePerCode[0].amount, 100)
    assert.equal(annualReport.totalOutcomePerCode[1].outcomeCode, outcomeCode2)
    assert.equal(annualReport.totalOutcomePerCode[1].amount, 75)
    assert.equal(annualReport.totalOutcomePerCode[2].outcomeCode, outcomeCode3)
    assert.equal(annualReport.totalOutcomePerCode[2].amount, 50)
    assert.equal(annualReport.totalOutcomePerCode[3].outcomeCode, outcomeCode4)
    assert.equal(annualReport.totalOutcomePerCode[3].amount, 25)
    assert.equal(annualReport.totalIncome, 600)
    assert.equal(annualReport.totalOutcome, 250)
    assert.equal(annualReport.total, 350)
  })
})
