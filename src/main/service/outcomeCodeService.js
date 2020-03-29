const outcomeCodeDao = require('../dao/outcomeCodeDao')
const receiptDao = require('../dao/receiptDao')
const annualReportDao = require('../dao/annualReportDao')

async function getOutcomeCodes (bookingYear) {
  console.log(`Getting outcome codes for year ${bookingYear}`)
  var outcomeCodes = await outcomeCodeDao.findByYear(bookingYear)
  if (outcomeCodes) {
    const taxOutcomeCode = outcomeCodes.find(el => el.tax)
    if (!taxOutcomeCode) {
      await outcomeCodeDao.insert({partition: 3, position: 1, description: 'ЦТ 4%', year: bookingYear, tax: true})
      outcomeCodes = await outcomeCodeDao.findByYear(bookingYear)
    }
  } else {
    await outcomeCodeDao.insert({partition: 3, position: 1, description: 'ЦТ 4%', year: bookingYear, tax: true})
    outcomeCodes = await outcomeCodeDao.findByYear(bookingYear)
  }
  console.log(`Returning outcome codes: \n${JSON.stringify(outcomeCodes, null, 2)}`)
  return outcomeCodes
}

async function createOutcomeCode (outcomeCode) {
  delete outcomeCode._id
  console.log(`Creating outcome code: \n${JSON.stringify(outcomeCode, null, 2)}`)
  await outcomeCodeDao.insert(outcomeCode)
  console.log('Successfully created outcome code')
}

async function deleteOutcomeCode (id) {
  console.log(`Deleting outcome code with id ${JSON.stringify(id)}`)
  const deletedOutcomeCode = await outcomeCodeDao.findById(id)
  await outcomeCodeDao.removeById(id)
  await updateReceiptsAfterDelete(deletedOutcomeCode)
  await updateAnnualReportDataAfterDelete(deletedOutcomeCode)
  console.log('Successfully deleted outcome code')
}

async function updateOutcomeCode (outcomeCode) {
  console.log(`Updating outcome code: \n${JSON.stringify(outcomeCode, null, 2)}`)
  const oldOutcomeCode = await outcomeCodeDao.findById(outcomeCode._id)
  await outcomeCodeDao.updateById(outcomeCode._id, outcomeCode)
  await updateReceiptsAfterUpdate(oldOutcomeCode, outcomeCode)
  await updateAnnualReportDataAfterUpdate(oldOutcomeCode, outcomeCode)
  console.log('Successfully updated outcome code')
}

async function importOutcomeCodesFromPreviousYear (bookingYear) {
  console.log(`Importing outcome codes from previous year ${bookingYear-1}`)
  var previousYearOutcomeCodes = await outcomeCodeDao.findByYear(bookingYear-1)
  var currentYearOutcomeCodes = await outcomeCodeDao.findByYear(bookingYear)

  if (currentYearOutcomeCodes) {
    for (let i=0; i<currentYearOutcomeCodes.length; i++) {
      await deleteOutcomeCode(currentYearOutcomeCodes[i]._id)
    }
  }
  if (previousYearOutcomeCodes) {
    for (let i=0; i<previousYearOutcomeCodes.length; i++) {
      previousYearOutcomeCodes[i].year = bookingYear
      await createOutcomeCode(previousYearOutcomeCodes[i])
    }
  }
  console.log(`Finished importing outcome codes`)
}

async function updateReceiptsAfterDelete (deletedOutcomeCode) {
  console.log('Updating associated receipts')
  const receipts = await receiptDao.findByYear(deletedOutcomeCode.year)
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
      receipt.outcomePerCode[outcomePerCodeIndex].isValid = false
      await receiptDao.updateById(receipt._id, receipt, true)
      console.log(`Receipt with id ${receipt._id} is no longer valid`)
    }
  }
}

async function updateAnnualReportDataAfterDelete (deletedOutcomeCode) {
  console.log('Updating associated annual report data')
  const annualReportData = await annualReportDao.findOneByYear(deletedOutcomeCode.year)
  if (annualReportData && annualReportData.totalOutcomePerCodeAllowed) {
    let outcomePerCodeIndex = annualReportData.totalOutcomePerCodeAllowed.findIndex(topca => {
      return topca.outcomeCode.partition == deletedOutcomeCode.partition && topca.outcomeCode.position == deletedOutcomeCode.position
    })
    if (outcomePerCodeIndex != -1) {
      annualReportData.totalOutcomePerCodeAllowed.splice(outcomePerCodeIndex, 1)
      if (annualReportData.totalOutcomePerCodeAllowed.length == 0) {
        annualReportData.totalOutcomePerCodeAllowed = null
      }
      await annualReportDao.updateById(annualReportData._id, annualReportData)
      console.log(`Annual report data is updated`)
    }
  }
}

async function updateReceiptsAfterUpdate (oldOutcomeCode, newOutcomeCode) {
  console.log('Updating associated receipts')
  const receipts = await receiptDao.findByYear(newOutcomeCode.year)
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
}

async function updateAnnualReportDataAfterUpdate (oldOutcomeCode, newOutcomeCode) {
  console.log('Updating associated annual report data')
  const annualReportData = await annualReportDao.findOneByYear(newOutcomeCode.year)
  if (annualReportData && annualReportData.totalOutcomePerCodeAllowed) {
    let outcomePerCodeIndex = annualReportData.totalOutcomePerCodeAllowed.findIndex(topca => {
      return topca.outcomeCode.partition == oldOutcomeCode.partition && topca.outcomeCode.position == oldOutcomeCode.position
    })
    if (outcomePerCodeIndex != -1) {
      annualReportData.totalOutcomePerCodeAllowed[outcomePerCodeIndex].outcomeCode = newOutcomeCode
      await annualReportDao.updateById(annualReportData._id, annualReportData)
      console.log(`Annual report data is updated`)
    }
  }
}

module.exports = {
  getOutcomeCodes: getOutcomeCodes,
  createOutcomeCode: createOutcomeCode,
  updateOutcomeCode: updateOutcomeCode,
  deleteOutcomeCode: deleteOutcomeCode,
  importOutcomeCodesFromPreviousYear: importOutcomeCodesFromPreviousYear
}
