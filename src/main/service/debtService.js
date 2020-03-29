const debtDao = require('../dao/debtDao')

async function getDebts (bookingYear) {
  console.log(`Getting debts for year ${bookingYear}`)
  var debts = await debtDao.findByYear(bookingYear)
  console.log(`Returning debts: \n${JSON.stringify(debts, null, 2)}`)
  return debts
}

async function createDebt (debt) {
  delete debt._id
  console.log(`Creating debt: \n${JSON.stringify(debt, null, 2)}`)
  await debtDao.insert(debt)
  console.log('Successfully created debt')
}

async function updateDebt (debt) {
  console.log(`Updating debt: \n${JSON.stringify(debt, null, 2)}`)
  await debtDao.updateById(debt._id, debt)
  console.log('Successfully updated debt')
}

async function deleteDebt (id) {
  console.log(`Deleting debt with id ${id}`)
  await debtDao.removeById(id)
  console.log('Successfully deleted debt')
}

async function deleteDebts (ids) {
  console.log(`Deleting debts with ids ${ids}`)
  await debtDao.removeByIds(ids)
  console.log('Successfully deleted debts')
}

module.exports = {
  getDebts: getDebts,
  createDebt: createDebt,
  updateDebt: updateDebt,
  deleteDebt: deleteDebt,
  deleteDebts: deleteDebts
}
