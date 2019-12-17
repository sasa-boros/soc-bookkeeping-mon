const paymentSlipDao = require('../dao/paymentSlipDao')
const receiptDao = require('../dao/receiptDao')
const shareDao = require('../dao/shareDao')
const savingDao = require('../dao/savingDao')
const itemDao = require('../dao/itemDao')
const debtDao = require('../dao/debtDao')

async function getBookedYears () {
    console.log('Getting all booked years')

    var paymentSlips = await paymentSlipDao.findAll()
    var receipts = await receiptDao.findAll()
    var shares = await shareDao.findAll()
    var savings = await savingDao.findAll()
    var items = await itemDao.findAll()
    var debts = await debtDao.findAll()

    var yearsSet = new Set()
    if (paymentSlips) {
        paymentSlips.forEach(paymentSlip => {
            yearsSet.add(paymentSlip.date.getFullYear())
        })
    }
    if (receipts) {
        receipts.forEach(receipt => {
            yearsSet.add(receipt.date.getFullYear())
        })
    }
    if (shares) {
        shares.forEach(share => {
            yearsSet.add(share.year)
        })
    }
    if (savings) {
        savings.forEach(saving => {
            yearsSet.add(saving.year)
        })
    }

    if (items) {
        items.forEach(item => {
            yearsSet.add(item.year)
        })
    }
    
    if (debts) {
        debts.forEach(debt => {
            yearsSet.add(debt.year)
        })
    }

    var years = Array.from(yearsSet).sort((a, b) => b - a)

    console.log(`Returning booked years: \n${JSON.stringify(years, null, 2)}`)
    return years
}

module.exports = {
    getBookedYears: getBookedYears
}