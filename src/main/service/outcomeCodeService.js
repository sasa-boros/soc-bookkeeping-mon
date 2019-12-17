const outcomeCodeDao = require('../dao/outcomeCodeDao')
const receiptDao = require('../dao/receiptDao')
const annualReportDao = require('../dao/annualReportDao')

async function getOutcomeCodes () {
  console.log('Getting all outcome codes')
  var outcomeCodes = await outcomeCodeDao.findAll()
  console.log(`Returning outcome codes: \n${JSON.stringify(outcomeCodes, null, 2)}`)
  return outcomeCodes
}

async function createOutcomeCode (outcomeCode) {
  delete outcomeCode._id
  console.log(`Creating outcome code: \n${JSON.stringify(outcomeCode, null, 2)}`)
  await outcomeCodeDao.insert(outcomeCode)
  console.log('Successfully created outcome code')
}

async function deleteOutcomeCode (outcomeCodeId) {
  console.log(`Deleting outcome code with id ${JSON.stringify(outcomeCodeId)}`)
  const deletedOutcomeCode = await outcomeCodeDao.findById(outcomeCodeId)
  await outcomeCodeDao.removeById(outcomeCodeId)
  await updateDbAfterDelete(deletedOutcomeCode)
  console.log('Successfully deleted outcome code')
}

async function updateOutcomeCode (outcomeCode) {
  console.log(`Updating outcome code: \n${JSON.stringify(outcomeCode, null, 2)}`)
  const oldOutcomeCode = await outcomeCodeDao.findById(outcomeCode._id)
  await outcomeCodeDao.updateById(outcomeCode._id, outcomeCode)
  await updateDbAfterUpdate(oldOutcomeCode, outcomeCode)
  console.log('Successfully updated outcome code')
}

async function updateDbAfterDelete (deletedOutcomeCode) {
  console.log('Making associated receipts invalid and updating annual report data')
  const receipts = await receiptDao.findAll()
  for (let i=0; i<receipts.length; i++) {
    let receipt = receipts[i]
    if (!receipt.outcomePerCode) {
      continue
    }
    let outcomePerCodeIndex = receipt.outcomePerCode.findIndex(outcomePerCode => {
      return outcomePerCode.outcomeCode.partition == deletedOutcomeCode.partition && outcomePerCode.outcomeCode.position == deletedOutcomeCode.position
    })
    if (outcomePerCodeIndex != -1) {
      receipt.isValid = false
      receipt.outcomePerCode.splice(outcomePerCodeIndex, 1)
      if (receipt.outcomePerCode.length == 0) {
        receipt.outcomePerCode = null
      }
      await receiptDao.updateById(receipt._id, receipt, true)
      console.log(`Receipt with id ${receipt._id} is no longer valid`)
    }
  }
  const annualReportsData = await annualReportDao.findAll()
  for (let i=0; i<annualReportsData.length; i++) {
    let annualReportData = annualReportsData[i]
    if (!annualReportData.totalOutcomePerCodeAllowed) {
      continue
    }
    let outcomePerCodeIndex = annualReportData.totalOutcomePerCodeAllowed.findIndex(topca => {
      return topca.outcomeCode.partition == deletedOutcomeCode.partition && topca.outcomeCode.position == deletedOutcomeCode.position
    })
    if (outcomePerCodeIndex != -1) {
      annualReportData.totalOutcomePerCodeAllowed.splice(outcomePerCodeIndex, 1)
      if (annualReportData.totalOutcomePerCodeAllowed.length == 0) {
        annualReportData.totalOutcomePerCodeAllowed = null
      }
      await annualReportDao.updateById(annualReportData._id, annualReportData)
      console.log(`Annual report data with id ${annualReportData._id} is updated`)
    }
  }
}

async function updateDbAfterUpdate (oldOutcomeCode, newOutcomeCode) {
  console.log('Updating associated receipts and annual report data')
  const receipts = await receiptDao.findAll()
  for (let i=0; i<receipts.length; i++) {
    let receipt = receipts[i]
    if (!receipt.outcomePerCode) {
      continue
    }
    let outcomePerCodeIndex = receipt.outcomePerCode.findIndex(outcomePerCode => {
      return outcomePerCode.outcomeCode.partition == oldOutcomeCode.partition && outcomePerCode.outcomeCode.position == oldOutcomeCode.position
    })
    if (outcomePerCodeIndex != -1) {
      receipt.outcomePerCode[outcomePerCodeIndex].outcomeCode = newOutcomeCode
      await receiptDao.updateById(receipt._id, receipt, true)
      console.log(`Receipt with id ${receipt._id} is updated`)
    }
  }
  const annualReportsData = await annualReportDao.findAll()
  for (let i=0; i<annualReportsData.length; i++) {
    let annualReportData = annualReportsData[i]
    if (!annualReportData.totalOutcomePerCodeAllowed) {
      continue
    }
    let outcomePerCodeIndex = annualReportData.totalOutcomePerCodeAllowed.findIndex(topca => {
      return topca.outcomeCode.partition == oldOutcomeCode.partition && topca.outcomeCode.position == oldOutcomeCode.position
    })
    if (outcomePerCodeIndex != -1) {
      annualReportData.totalOutcomePerCodeAllowed[outcomePerCodeIndex].outcomeCode = newOutcomeCode
      await annualReportDao.updateById(annualReportData._id, annualReportData)
      console.log(`Annual report data with id ${annualReportData._id} is updated`)
    }
  }
}

module.exports = {
  getOutcomeCodes: getOutcomeCodes,
  createOutcomeCode: createOutcomeCode,
  deleteOutcomeCode: deleteOutcomeCode,
  updateOutcomeCode: updateOutcomeCode
}
