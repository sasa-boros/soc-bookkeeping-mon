const paymentSlipDao = require('../dao/paymentSlipDao')
const { app } = require('electron')
const fs = require('fs')
const path = require('path')

const { PDFDocument } = require('pdf-lib')

async function checkPaymentSlipsValidity (bookingYear) {
  console.log(`Checking if payment slips for year ${bookingYear} are valid`)
  const paymentSlips = await paymentSlipDao.findByYear(bookingYear)
  var result = true
  for (let i=0; i < paymentSlips.length; i++) {
    if (!paymentSlips[i].isValid) {
      result = false
      break
    }
  }
  console.log(`Returning valid payment slips check result: \n${JSON.stringify(result, null, 2)}`)
  return result
}

async function getPaymentSlips (bookingYear) {
  console.log(`Getting payment slips for year ${bookingYear}`)
  var paymentSlips = await paymentSlipDao.findByYear(bookingYear)
  console.log(`Returning payment slips: \n${JSON.stringify(paymentSlips, null, 2)}`)
  return paymentSlips
}

async function createPaymentSlip (paymentSlip) {
  delete paymentSlip._id
  paymentSlip.date = new Date(paymentSlip.date)
  console.log(`Creating payment slip: \n${JSON.stringify(paymentSlip, null, 2)}`)
  paymentSlip.isValid = true
  await paymentSlipDao.insert(paymentSlip)
  await assignAnnualReportValues(paymentSlip.date.getFullYear())
  console.log('Successfully created payment slip')
}

async function updatePaymentSlip (paymentSlip) {
  console.log(`Updating payment slip: \n${JSON.stringify(paymentSlip, null, 2)}`)
  paymentSlip.isValid = true
  paymentSlip.date = new Date(paymentSlip.date)
  await paymentSlipDao.updateById(paymentSlip._id, paymentSlip)
  await assignAnnualReportValues(paymentSlip.date.getFullYear())
  console.log('Successfully updated payment slip')
}

async function deletePaymentSlip (id, bookingYear) {
  console.log(`Deleting payment slip with id ${id}`)
  await paymentSlipDao.removeById(id)
  await assignAnnualReportValues(bookingYear)
  console.log('Successfully deleted payment slip')
}

async function deletePaymentSlips (ids, bookingYear) {
  console.log(`Deleting payment slips with ids ${ids}`)
  await paymentSlipDao.removeByIds(ids)
  await assignAnnualReportValues(bookingYear)
  console.log('Successfully deleted payment slips')
}

async function assignAnnualReportValues (bookingYear) {
  let paymentSlips = await paymentSlipDao.findByYearSortByDateAsc(bookingYear)
  for (let i = 0; i < paymentSlips.length; i++) {
    const paymentSlip = paymentSlips[i]
    paymentSlip.ordinal = i + 1
    paymentSlip.annualReportPage = paymentSlip.date.getMonth() + 1
    await paymentSlipDao.updateById(paymentSlip._id, paymentSlip, true)
  }
}

async function createPaymentSlipPdf (webContents) {
  webContents.printToPDF(pdfSettings(), async function(err, data) {
    if (err) {
      throw new Error('Failed creating payment slip pdf')
    }
    try {
      const pdfDoc = await PDFDocument.load(data)
      const page = pdfDoc.getPages()[0]
      page.setSize(page.getWidth(), page.getHeight()/2)
      page.translateContent(0, -page.getHeight())
      const pdfBytes = await pdfDoc.save()
      fs.writeFileSync(path.join(app.getPath('userData'), '/payment-slip.pdf'), pdfBytes);
    } catch(err) {
      throw new Error('Failed creating payment slip pdf')
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
  checkPaymentSlipsValidity: checkPaymentSlipsValidity,
  getPaymentSlips: getPaymentSlips,
  createPaymentSlip: createPaymentSlip,
  deletePaymentSlip: deletePaymentSlip,
  deletePaymentSlips: deletePaymentSlips,
  updatePaymentSlip: updatePaymentSlip,
  createPaymentSlipPdf: createPaymentSlipPdf
}
