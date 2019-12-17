const receiptDao = require('../dao/receiptDao')
const { app } = require('electron')
const fs = require('fs')
const path = require('path')

const { PDFDocument } = require('pdf-lib')

async function areReceiptsValid () {
  console.log('Checking if all receipts are valid')
  const receipts = await receiptDao.findAll()
  var result = true
  for (let i=0; i < receipts.length; i++) {
    if (!receipts[i].isValid) {
      result = false
      break
    }
  }
  console.log(`Returning valid receipts check result: \n${JSON.stringify(result, null, 2)}`)
  return result
}

async function getReceipts () {
  console.log(`Getting all receipts`)
  var receipts = await receiptDao.findAll()
  console.log(`Returning receipts: \n${JSON.stringify(receipts, null, 2)}`)
  return receipts
}

async function createReceipt (receipt) {
  delete receipt._id
  receipt.date = new Date(receipt.date)
  console.log(`Creating receipt: \n${JSON.stringify(receipt, null, 2)}`)
  receipt.isValid = true
  await receiptDao.insert(receipt)
  await assignAnnualReportValues()
  console.log('Successfully created receipt')
}

async function deleteReceipt (receiptId) {
  console.log(`Deleting receipt with id ${receiptId}`)
  await receiptDao.removeById(receiptId)
  await assignAnnualReportValues()
  console.log('Successfully deleted receipt')
}

async function deleteReceipts (receiptsIds) {
  console.log(`Deleting receipts with ids ${receiptsIds}`)
  await receiptDao.removeManyByIds(receiptsIds)
  await assignAnnualReportValues()
  console.log('Successfully deleted receipts')
}

async function updateReceipt (receipt) {
  console.log(`Updating receipt: \n${JSON.stringify(receipt, null, 2)}`)
  receipt.isValid = true
  receipt.date = new Date(receipt.date)
  await receiptDao.updateById(receipt._id, receipt)
  await assignAnnualReportValues()
  console.log('Successfully updated receipt')
}

async function assignAnnualReportValues () {
  let receipts = await receiptDao.findAllSortByDateAsc()
  var perYearOrdinal = {}
  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i]
    const year = receipt.date.getYear()
    const month = receipt.date.getMonth()
    if(perYearOrdinal[year]) {
      perYearOrdinal[year] += 1
    } else {
      perYearOrdinal[year] = 1
    }
    if (receipt.ordinal == perYearOrdinal[year] && receipt.annualReportPage ==  (month + 1)) {
      continue
    }
    receipt.ordinal = perYearOrdinal[year]
    receipt.annualReportPage = month + 1
    await receiptDao.updateById(receipt._id, receipt, true)
  }
}

async function createReceiptPdf (webContents) {
  webContents.printToPDF(pdfSettings(), async function(err, data) {
    if (err) {
      throw new Error('Failed creating receipt pdf')
    }
    try {
      const pdfDoc = await PDFDocument.load(data)
      const page = pdfDoc.getPages()[0]
      page.setSize(page.getWidth(), page.getHeight()/2)
      page.translateContent(0, -page.getHeight())
      const pdfBytes = await pdfDoc.save()
      fs.writeFileSync(path.join(app.getPath('userData'), '/receipt.pdf'), pdfBytes);
    } catch (err){
      throw new Error('Failed creating receipt pdf')
    }
  })
}

function pdfSettings () {
  var settings = {
      landscape: false,
      marginsType: 0,
      printBackground: false,
      printSelectionOnly: false,
      pageSize: "A4",
  };
  return settings;
}

module.exports = {
  areReceiptsValid: areReceiptsValid,
  getReceipts: getReceipts,
  createReceipt: createReceipt,
  deleteReceipt: deleteReceipt,
  deleteReceipts: deleteReceipts,
  updateReceipt: updateReceipt,
  createReceiptPdf: createReceiptPdf
}
