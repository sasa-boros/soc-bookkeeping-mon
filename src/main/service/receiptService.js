const receiptDao = require('../dao/receiptDao')
const { app } = require('electron')
const fs = require('fs')
const path = require('path')

const { PDFDocument } = require('pdf-lib')

async function checkReceiptsValidity (bookingYear) {
  console.log(`Checking if receipts for year ${bookingYear} are valid`)
  const receipts = await receiptDao.findByYear(bookingYear)
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

async function getReceipts (bookingYear) {
  console.log(`Getting receipts for year ${bookingYear}`)
  var receipts = await receiptDao.findByYear(bookingYear)
  console.log(`Returning receipts: \n${JSON.stringify(receipts, null, 2)}`)
  return receipts
}

async function createReceipt (receipt) {
  delete receipt._id
  receipt.date = new Date(receipt.date)
  console.log(`Creating receipt: \n${JSON.stringify(receipt, null, 2)}`)
  receipt.isValid = true
  await receiptDao.insert(receipt)
  await assignAnnualReportValues(receipt.date.getFullYear())
  console.log('Successfully created receipt')
}

async function updateReceipt (receipt) {
  console.log(`Updating receipt: \n${JSON.stringify(receipt, null, 2)}`)
  receipt.isValid = true
  receipt.date = new Date(receipt.date)
  await receiptDao.updateById(receipt._id, receipt)
  await assignAnnualReportValues(receipt.date.getFullYear())
  console.log('Successfully updated receipt')
}

async function deleteReceipt (id, bookingYear) {
  console.log(`Deleting receipt with id ${id}`)
  await receiptDao.removeById(id)
  await assignAnnualReportValues(bookingYear)
  console.log('Successfully deleted receipt')
}

async function deleteReceipts (ids, bookingYear) {
  console.log(`Deleting receipts with ids ${ids}`)
  await receiptDao.removeByIds(ids)
  await assignAnnualReportValues(bookingYear)
  console.log('Successfully deleted receipts')
}

async function assignAnnualReportValues (bookingYear) {
  let receipts = await receiptDao.findByYearSortByDateAsc(bookingYear)
  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i]
    const month = receipt.date.getMonth()
    receipt.ordinal = i + 1
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
  checkReceiptsValidity: checkReceiptsValidity,
  getReceipts: getReceipts,
  createReceipt: createReceipt,
  deleteReceipt: deleteReceipt,
  deleteReceipts: deleteReceipts,
  updateReceipt: updateReceipt,
  createReceiptPdf: createReceiptPdf
}
