const { ipcMain } = require('electron')
const annualReportService = require('./service/annualReportService')
const incomeCodeService = require('./service/incomeCodeService')
const outcomeCodeService = require('./service/outcomeCodeService')
const paymentSlipService = require('./service/paymentSlipService')
const receiptService = require('./service/receiptService')
const shareService = require('./service/shareService')
const savingService = require('./service/savingService')
const itemService = require('./service/itemService')
const debtService = require('./service/debtService')
const settingsService = require('./service/settingsService')

ipcMain.on('get-income-codes', async (event, bookingYear) => {
  try {
    reply(event, 'get-income-codes-reply', await incomeCodeService.getIncomeCodes(bookingYear))
  } catch (err) {
    replyError(event, 'get-income-codes-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-income-code', async (event, incomeCode) => {
  try {
    reply(event, 'create-income-code-reply', await incomeCodeService.createIncomeCode(incomeCode))
  } catch (err) {
    replyError(event, 'create-income-code-reply', err.message ? err.message : err)
  }
})

ipcMain.on('update-income-code', async (event, incomeCode) => {
  try {
    reply(event, 'update-income-code-reply', await incomeCodeService.updateIncomeCode(incomeCode))
  } catch (err) {
    replyError(event, 'update-income-code-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-income-code', async (event, incomeCodeId) => {
  try {
    reply(event, 'delete-income-code-reply', await incomeCodeService.deleteIncomeCode(incomeCodeId))
  } catch (err) {
    replyError(event, 'delete-income-code-reply', err.message ? err.message : err)
  }
})

ipcMain.on('import-income-codes', async (event, bookingYear) => {
  try {
    reply(event, 'import-income-codes-reply', await incomeCodeService.importIncomeCodesFromPreviousYear(bookingYear))
  } catch (err) {
    replyError(event, 'import-income-codes-reply', err.message ? err.message : err)
  }
})

ipcMain.on('get-outcome-codes', async (event, bookingYear) => {
  try {
    reply(event, 'get-outcome-codes-reply', await outcomeCodeService.getOutcomeCodes(bookingYear))
  } catch (err) {
    replyError(event, 'get-outcome-codes-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-outcome-code', async (event, outcomeCode) => {
  try {
    reply(event, 'create-outcome-code-reply', await outcomeCodeService.createOutcomeCode(outcomeCode))
  } catch (err) {
    replyError(event, 'create-outcome-code-reply', err.message ? err.message : err)
  }
})

ipcMain.on('update-outcome-code', async (event, outcomeCode) => {
  try {
    reply(event, 'update-outcome-code-reply', await outcomeCodeService.updateOutcomeCode(outcomeCode))
  } catch (err) {
    replyError(event, 'update-outcome-code-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-outcome-code', async (event, outcomeCodeId) => {
  try {
    reply(event, 'delete-outcome-code-reply', await outcomeCodeService.deleteOutcomeCode(outcomeCodeId))
  } catch (err) {
    replyError(event, 'delete-outcome-code-reply', err.message ? err.message : err)
  }
})

ipcMain.on('import-outcome-codes', async (event, bookingYear) => {
  try {
    reply(event, 'import-outcome-codes-reply', await outcomeCodeService.importOutcomeCodesFromPreviousYear(bookingYear))
  } catch (err) {
    replyError(event, 'import-outcome-codes-reply', err.message ? err.message : err)
  }
})

ipcMain.on('check-payment-slips-validity', async (event, bookingYear) => {
  try {
    reply(event, 'check-payment-slips-validity-reply', await paymentSlipService.checkPaymentSlipsValidity(bookingYear))
  } catch (err) {
    replyError(event, 'check-payment-slips-validity-reply', err.message ? err.message : err)
  }
})

ipcMain.on('get-payment-slips', async (event, bookingYear) => {
  try {
    reply(event, 'get-payment-slips-reply', await paymentSlipService.getPaymentSlips(bookingYear))
  } catch (err) {
    replyError(event, 'get-payment-slips-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-payment-slip', async (event, paymentSlip) => {
  try {
    reply(event, 'create-payment-slip-reply', await paymentSlipService.createPaymentSlip(paymentSlip))
  } catch (err) {
    replyError(event, 'create-payment-slip-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-payment-slip', async (event, paymentSlipId, bookingYear) => {
  try {
    reply(event, 'delete-payment-slip-reply', await paymentSlipService.deletePaymentSlip(paymentSlipId, bookingYear))
  } catch (err) {
    replyError(event, 'delete-payment-slip-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-payment-slips', async (event, paymentSlipsIds, bookingYear) => {
  try {
    reply(event, 'delete-payment-slips-reply', await paymentSlipService.deletePaymentSlips(paymentSlipsIds, bookingYear))
  } catch (err) {
    replyError(event, 'delete-payment-slips-reply', err.message ? err.message : err)
  }
})

ipcMain.on('update-payment-slip', async (event, paymentSlip) => {
  try {
    reply(event, 'update-payment-slip-reply', await paymentSlipService.updatePaymentSlip(paymentSlip))
  } catch (err) {
    replyError(event, 'update-payment-slip-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-payment-slip-pdf', async (event) => {
  try {
    reply(event, 'create-payment-slip-pdf-reply', await paymentSlipService.createPaymentSlipPdf(event.sender.webContents))
  } catch (err) {
    replyError(event, 'create-payment-slip-pdf-reply', err.message ? err.message : err)
  }
})

ipcMain.on('check-receipts-validity', async (event, bookingYear) => {
  try {
    reply(event, 'check-receipts-validity-reply', await receiptService.checkReceiptsValidity(bookingYear))
  } catch (err) {
    replyError(event, 'check-receipts-validity-reply', err.message ? err.message : err)
  }
})

ipcMain.on('get-receipts', async (event, bookingYear) => {
  try {
    reply(event, 'get-receipts-reply', await receiptService.getReceipts(bookingYear))
  } catch (err) {
    replyError(event, 'get-receipts-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-receipt', async (event, receipt) => {
  try {
    reply(event, 'create-receipt-reply', await receiptService.createReceipt(receipt))
  } catch (err) {
    replyError(event, 'create-receipt-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-receipt', async (event, receiptId, bookingYear) => {
  try {
    reply(event, 'delete-receipt-reply', await receiptService.deleteReceipt(receiptId, bookingYear))
  } catch (err) {
    replyError(event, 'delete-receipt-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-receipts', async (event, receiptsIds, bookingYear) => {
  try {
    reply(event, 'delete-receipts-reply', await receiptService.deleteReceipts(receiptsIds, bookingYear))
  } catch (err) {
    replyError(event, 'delete-receipts-reply', err.message ? err.message : err)
  }
})

ipcMain.on('update-receipt', async (event, receipt) => {
  try {
    reply(event, 'update-receipt-reply', await receiptService.updateReceipt(receipt))
  } catch (err) {
    replyError(event, 'update-receipt-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-receipt-pdf', async (event) => {
  try {
    reply(event, 'create-receipt-pdf-reply', await receiptService.createReceiptPdf(event.sender.webContents))
  } catch (err) {
    replyError(event, 'create-receipt-pdf-reply', err.message ? err.message : err)
  }
})

ipcMain.on('get-shares', async (event, bookingYear) => {
  try {
    reply(event, 'get-shares-reply', await shareService.getShares(bookingYear))
  } catch (err) {
    replyError(event, 'get-shares-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-share', async (event, share) => {
  try {
    reply(event, 'create-share-reply', await shareService.createShare(share))
  } catch (err) {
    replyError(event, 'create-share-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-share', async (event, shareId) => {
  try {
    reply(event, 'delete-share-reply', await shareService.deleteShare(shareId))
  } catch (err) {
    replyError(event, 'delete-share-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-shares', async (event, sharesIds) => {
  try {
    reply(event, 'delete-shares-reply', await shareService.deleteShares(sharesIds))
  } catch (err) {
    replyError(event, 'delete-shares-reply', err.message ? err.message : err)
  }
})

ipcMain.on('update-share', async (event, share) => {
  try {
    reply(event, 'update-share-reply', await shareService.updateShare(share))
  } catch (err) {
    replyError(event, 'update-share-reply', err.message ? err.message : err)
  }
})

ipcMain.on('get-savings', async (event, bookingYear) => {
  try {
    reply(event, 'get-savings-reply', await savingService.getSavings(bookingYear))
  } catch (err) {
    replyError(event, 'get-savings-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-saving', async (event, saving) => {
  try {
    reply(event, 'create-saving-reply', await savingService.createSaving(saving))
  } catch (err) {
    replyError(event, 'create-saving-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-saving', async (event, savingId) => {
  try {
    reply(event, 'delete-saving-reply', await savingService.deleteSaving(savingId))
  } catch (err) {
    replyError(event, 'delete-saving-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-savings', async (event, savingsIds) => {
  try {
    reply(event, 'delete-savings-reply', await savingService.deleteSavings(savingsIds))
  } catch (err) {
    replyError(event, 'delete-savings-reply', err.message ? err.message : err)
  }
})

ipcMain.on('update-saving', async (event, saving) => {
  try {
    reply(event, 'update-saving-reply', await savingService.updateSaving(saving))
  } catch (err) {
    replyError(event, 'update-saving-reply', err.message ? err.message : err)
  }
})

ipcMain.on('get-items', async (event, bookingYear) => {
  try {
    reply(event, 'get-items-reply', await itemService.getItems(bookingYear))
  } catch (err) {
    replyError(event, 'get-items-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-item', async (event, item) => {
  try {
    reply(event, 'create-item-reply', await itemService.createItem(item))
  } catch (err) {
    replyError(event, 'create-item-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-item', async (event, itemId) => {
  try {
    reply(event, 'delete-item-reply', await itemService.deleteItem(itemId))
  } catch (err) {
    replyError(event, 'delete-item-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-items', async (event, itemsIds) => {
  try {
    reply(event, 'delete-items-reply', await itemService.deleteItems(itemsIds))
  } catch (err) {
    replyError(event, 'delete-items-reply', err.message ? err.message : err)
  }
})

ipcMain.on('update-item', async (event, item) => {
  try {
    reply(event, 'update-item-reply', await itemService.updateItem(item))
  } catch (err) {
    replyError(event, 'update-item-reply', err.message ? err.message : err)
  }
})

ipcMain.on('get-debts', async (event, bookingYear) => {
  try {
    reply(event, 'get-debts-reply', await debtService.getDebts(bookingYear))
  } catch (err) {
    replyError(event, 'get-debts-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-debt', async (event, debt) => {
  try {
    reply(event, 'create-debt-reply', await debtService.createDebt(debt))
  } catch (err) {
    replyError(event, 'create-debt-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-debt', async (event, debtId) => {
  try {
    reply(event, 'delete-debt-reply', await debtService.deleteDebt(debtId))
  } catch (err) {
    replyError(event, 'delete-debt-reply', err.message ? err.message : err)
  }
})

ipcMain.on('delete-debts', async (event, debtsIds) => {
  try {
    reply(event, 'delete-debts-reply', await debtService.deleteDebts(debtsIds))
  } catch (err) {
    replyError(event, 'delete-debts-reply', err.message ? err.message : err)
  }
})

ipcMain.on('update-debt', async (event, debt) => {
  try {
    reply(event, 'update-debt-reply', await debtService.updateDebt(debt))
  } catch (err) {
    replyError(event, 'update-debt-reply', err.message ? err.message : err)
  }
})

ipcMain.on('get-annual-report', async (event, bookingYear) => {
  try {
    reply(event, 'get-annual-report-reply', await annualReportService.getAnnualReport(bookingYear))
  } catch (err) {
    replyError(event, 'get-annual-report-reply', err.message ? err.message : err)
  }
})

ipcMain.on('get-annual-report-data', async (event, year) => {
  try {
    reply(event, 'get-annual-report-data-reply', await annualReportService.getAnnualReportData(year))
  } catch (err) {
    replyError(event, 'get-annual-report-data-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-annual-report-data', async (event, annualReportData) => {
  try {
    reply(event, 'create-annual-report-data-reply', await annualReportService.createAnnualReportData(annualReportData))
  } catch (err) {
    replyError(event, 'create-annual-report-data-reply', err.message ? err.message : err)
  }
})

ipcMain.on('get-annual-report-pages', async (event, annualReport) => {
  try {
    reply(event, 'get-annual-report-pages-reply', await annualReportService.getAnnualReportPages(annualReport))
  } catch (err) {
    replyError(event, 'get-annual-report-pages-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-annual-report-pdf', async (event) => {
  try {
    reply(event, 'create-annual-report-pdf-reply', await annualReportService.createAnnualReportPdf(event.sender.webContents))
  } catch (err) {
    replyError(event, 'create-annual-report-pdf-reply', err.message ? err.message : err)
  }
})

ipcMain.on('get-settings', async (event) => {
  try {
    reply(event, 'get-settings-reply', await settingsService.getSettings())
  } catch (err) {
    replyError(event, 'get-settings-reply', err.message ? err.message : err)
  }
})

ipcMain.on('create-settings', async (event, settings) => {
  try {
    reply(event, 'create-settings-reply', await settingsService.createSettings(settings))
  } catch (err) {
    replyError(event, 'create-settings-reply', err.message ? err.message : err)
  }
})

ipcMain.on('export-backup', async (event) => {
  try {
    reply(event, 'export-backup-reply', await settingsService.exportBackup())
  } catch (err) {
    replyError(event, 'export-backup-reply', err.message ? err.message : err)
  }
})

ipcMain.on('import-backup', async (event, path) => {
  try {
    reply(event, 'import-backup-reply', await settingsService.importBackup(path))
  } catch (err) {
    replyError(event, 'import-backup-reply', err.message ? err.message : err)
  }
})

function reply (event, target, data) {
  event.sender.send(target, { data: data })
}

function replyError (event, target, err) {
  console.error(err)
  event.sender.send(target, { err: err })
}
