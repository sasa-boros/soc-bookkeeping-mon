const incomeCodeDao = require('../dao/incomeCodeDao')
const paymentSlipDao = require('../dao/paymentSlipDao')
const annualReportDao = require('../dao/annualReportDao')

async function getIncomeCodes () {
  console.log('Getting all income codes')
  var incomeCodes = await incomeCodeDao.findAll()
  console.log(`Returning income codes: \n${JSON.stringify(incomeCodes, null, 2)}`)
  return incomeCodes
}

async function createIncomeCode (incomeCode) {
  delete incomeCode._id
  console.log(`Creating income code: \n${JSON.stringify(incomeCode, null, 2)}`)
  await incomeCodeDao.insert(incomeCode)
  console.log('Successfully created income code')
}

async function deleteIncomeCode (incomeCodeId) {
  console.log(`Deleting income code with id ${JSON.stringify(incomeCodeId)}`)
  const deletedIncomeCode = await incomeCodeDao.findById(incomeCodeId)
  await incomeCodeDao.removeById(incomeCodeId)
  await updateDbAfterDelete(deletedIncomeCode)
  console.log('Successfully deleted income code')
}

async function updateIncomeCode (incomeCode) {
  console.log(`Updating income code: \n${JSON.stringify(incomeCode, null, 2)}`)
  const oldIncomeCode = await incomeCodeDao.findById(incomeCode._id)
  await incomeCodeDao.updateById(incomeCode._id, incomeCode)
  await updateDbAfterUpdate(oldIncomeCode, incomeCode)
  console.log('Successfully updated income code')
}

async function updateDbAfterDelete (deletedIncomeCode) {
  console.log('Making associated payment slips invalid and updating annual report data')
  const paymentSlips = await paymentSlipDao.findAll()
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
      //paymentSlip.incomePerCode.splice(incomePerCodeIndex, 1)
      paymentSlip.incomePerCode[incomePerCodeIndex].isValid = false
      //if (paymentSlip.incomePerCode.length == 0) {
      //  paymentSlip.incomePerCode = null
      //}
      await paymentSlipDao.updateById(paymentSlip._id, paymentSlip, true)
      console.log(`Payment slip with id ${paymentSlip._id} is no longer valid`)
    }
  }
  const annualReportsData = await annualReportDao.findAll()
  for (let i=0; i<annualReportsData.length; i++) {
    let annualReportData = annualReportsData[i]
    if (!annualReportData.totalIncomePerCodePredicted) {
      continue
    }
    let incomePerCodeIndex = annualReportData.totalIncomePerCodePredicted.findIndex(tipcp => {
      return tipcp.incomeCode.partition == deletedIncomeCode.partition && tipcp.incomeCode.position == deletedIncomeCode.position
    })
    if (incomePerCodeIndex != -1) {
      annualReportData.totalIncomePerCodePredicted.splice(incomePerCodeIndex, 1)
      if (annualReportData.totalIncomePerCodePredicted.length == 0) {
        annualReportData.totalIncomePerCodePredicted = null
      }
      await annualReportDao.updateById(annualReportData._id, annualReportData)
      console.log(`Annual report data with id ${annualReportData._id} is updated`)
    }
  }
}

async function updateDbAfterUpdate (oldIncomeCode, newIncomeCode) {
  console.log('Updating associated payment slips and annual report data')
  const paymentSlips = await paymentSlipDao.findAll()
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
  const annualReportsData = await annualReportDao.findAll()
  for (let i=0; i<annualReportsData.length; i++) {
    let annualReportData = annualReportsData[i]
    if (!annualReportData.totalIncomePerCodePredicted) {
      continue
    }
    let incomePerCodeIndex = annualReportData.totalIncomePerCodePredicted.findIndex(tipcp => {
      return tipcp.incomeCode.partition == oldIncomeCode.partition && tipcp.incomeCode.position == oldIncomeCode.position
    })
    if (incomePerCodeIndex != -1) {
      annualReportData.totalIncomePerCodePredicted[incomePerCodeIndex].incomeCode = newIncomeCode
      await annualReportDao.updateById(annualReportData._id, annualReportData)
      console.log(`Annual report data with id ${annualReportData._id} is updated`)
    }
  }
}

module.exports = {
  getIncomeCodes: getIncomeCodes,
  createIncomeCode: createIncomeCode,
  deleteIncomeCode: deleteIncomeCode,
  updateIncomeCode: updateIncomeCode
}
