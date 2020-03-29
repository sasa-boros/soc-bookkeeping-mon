const incomeCodeDao = require('../dao/incomeCodeDao')
const paymentSlipDao = require('../dao/paymentSlipDao')
const annualReportDao = require('../dao/annualReportDao')

async function getIncomeCodes (bookingYear) {
  console.log(`Getting income codes for year ${bookingYear}`)
  var incomeCodes = await incomeCodeDao.findByYear(bookingYear)
  console.log(`Returning income codes: \n${JSON.stringify(incomeCodes, null, 2)}`)
  return incomeCodes
}

async function createIncomeCode (incomeCode) {
  delete incomeCode._id
  console.log(`Creating income code: \n${JSON.stringify(incomeCode, null, 2)}`)
  await incomeCodeDao.insert(incomeCode)
  console.log('Successfully created income code')
}

async function updateIncomeCode (incomeCode) {
  console.log(`Updating income code: \n${JSON.stringify(incomeCode, null, 2)}`)
  const oldIncomeCode = await incomeCodeDao.findById(incomeCode._id)
  await incomeCodeDao.updateById(incomeCode._id, incomeCode)
  await updatePaymentSlipsAfterUpdate(oldIncomeCode, incomeCode)
  await updateAnnualReportDataAfterUpdate(oldIncomeCode, incomeCode)
  console.log('Successfully updated income code')
}

async function deleteIncomeCode (id) {
  console.log(`Deleting income code with id ${JSON.stringify(id)}`)
  const deletedIncomeCode = await incomeCodeDao.findById(id)
  await incomeCodeDao.removeById(id)
  await updatePaymentSlipsAfterDelete(deletedIncomeCode)
  await updateAnnualReportDataAfterDelete(deletedIncomeCode)
  console.log('Successfully deleted income code')
}

async function importIncomeCodesFromPreviousYear (bookingYear) {
  console.log(`Importing income codes from previous year ${bookingYear-1}`)
  var previousYearIncomeCodes = await incomeCodeDao.findByYear(bookingYear-1)
  var currentYearIncomeCodes = await incomeCodeDao.findByYear(bookingYear)

  if (currentYearIncomeCodes) {
    for (let i=0; i<currentYearIncomeCodes.length; i++) {
      await deleteIncomeCode(currentYearIncomeCodes[i]._id)
    }
  }
  if (previousYearIncomeCodes) {
    for (let i=0; i<previousYearIncomeCodes.length; i++) {
      previousYearIncomeCodes[i].year = bookingYear
      await createIncomeCode(previousYearIncomeCodes[i])
    }
  }
  console.log(`Finished importing income codes`)
}

async function updatePaymentSlipsAfterDelete (deletedIncomeCode) {
  console.log('Updating associated payment slips')
  const paymentSlips = await paymentSlipDao.findByYear(deletedIncomeCode.year)
  for (let i=0; i<paymentSlips.length; i++) {
    let paymentSlip = paymentSlips[i]
    if (!paymentSlip.incomePerCode) {
      continue
    }
    let incomePerCodeIndex = paymentSlip.incomePerCode.findIndex(ipc => {
      return ipc.incomeCode.partition == deletedIncomeCode.partition && ipc.incomeCode.position == deletedIncomeCode.position
    })
    if (incomePerCodeIndex != -1) {
      paymentSlip.isValid = false
      paymentSlip.incomePerCode[incomePerCodeIndex].isValid = false
      await paymentSlipDao.updateById(paymentSlip._id, paymentSlip, true)
      console.log(`Payment slip with id ${paymentSlip._id} is no longer valid`)
    }
  }
}

async function updateAnnualReportDataAfterDelete (deletedIncomeCode) {
  console.log('Updating associated annual report data')
  const annualReportData = await annualReportDao.findOneByYear(deletedIncomeCode.year)
  if (annualReportData && annualReportData.totalIncomePerCodePredicted) {
    let incomePerCodeIndex = annualReportData.totalIncomePerCodePredicted.findIndex(tipcp => {
      return tipcp.incomeCode.partition == deletedIncomeCode.partition && tipcp.incomeCode.position == deletedIncomeCode.position
    })
    if (incomePerCodeIndex != -1) {
      annualReportData.totalIncomePerCodePredicted.splice(incomePerCodeIndex, 1)
      if (annualReportData.totalIncomePerCodePredicted.length == 0) {
        annualReportData.totalIncomePerCodePredicted = null
      }
      await annualReportDao.updateById(annualReportData._id, annualReportData)
      console.log(`Annual report data is updated`)
    }
  }
}

async function updatePaymentSlipsAfterUpdate (oldIncomeCode, newIncomeCode) {
  console.log('Updating associated payment slips')
  const paymentSlips = await paymentSlipDao.findByYear(oldIncomeCode.year)
  for (let i=0; i<paymentSlips.length; i++) {
    let paymentSlip = paymentSlips[i]
    if (!paymentSlip.incomePerCode) {
      continue
    }
    let incomePerCodeIndex = paymentSlip.incomePerCode.findIndex(ipc => {
      return ipc.incomeCode.partition == oldIncomeCode.partition && ipc.incomeCode.position == oldIncomeCode.position
    })
    if (incomePerCodeIndex != -1) {
      paymentSlip.incomePerCode[incomePerCodeIndex].incomeCode = newIncomeCode
      await paymentSlipDao.updateById(paymentSlip._id, paymentSlip, true)
      console.log(`Payment slip with id ${paymentSlip._id} is updated`)
    }
  }
}

async function updateAnnualReportDataAfterUpdate (oldIncomeCode, newIncomeCode) {
  console.log('Updating associated annual report data')
  const annualReportData = await annualReportDao.findOneByYear(oldIncomeCode.year)
  if (annualReportData && annualReportData.totalIncomePerCodePredicted) {
    let incomePerCodeIndex = annualReportData.totalIncomePerCodePredicted.findIndex(tipcp => {
      return tipcp.incomeCode.partition == oldIncomeCode.partition && tipcp.incomeCode.position == oldIncomeCode.position
    })
    if (incomePerCodeIndex != -1) {
      annualReportData.totalIncomePerCodePredicted[incomePerCodeIndex].incomeCode = newIncomeCode
      await annualReportDao.updateById(annualReportData._id, annualReportData)
      console.log(`Annual report data is updated`)
    }
  }
}

module.exports = {
  getIncomeCodes: getIncomeCodes,
  createIncomeCode: createIncomeCode,
  updateIncomeCode: updateIncomeCode,
  deleteIncomeCode: deleteIncomeCode,
  importIncomeCodesFromPreviousYear: importIncomeCodesFromPreviousYear
}
