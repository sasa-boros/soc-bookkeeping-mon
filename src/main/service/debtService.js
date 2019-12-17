const debtDao = require('../dao/debtDao')

async function getDebts () {
  console.log(`Getting all debts`)
  var debts = await debtDao.findAll()
  console.log(`Returning debts: \n${JSON.stringify(debts, null, 2)}`)
  return debts
}

async function createDebt (debt) {
  delete debt._id
  console.log(`Creating debt: \n${JSON.stringify(debt, null, 2)}`)
  await debtDao.insert(debt)
  console.log('Successfully created debt')
}

async function deleteDebt (debtId) {
  console.log(`Deleting debt with id ${debtId}`)
  await debtDao.removeById(debtId)
  console.log('Successfully deleted debt')
}

async function deleteDebts (debtsIds) {
  console.log(`Deleting debts with ids ${debtsIds}`)
  await debtDao.removeManyByIds(debtsIds)
  console.log('Successfully deleted debts')
}

async function updateDebt (debt) {
  console.log(`Updating debt: \n${JSON.stringify(debt, null, 2)}`)
  await debtDao.updateById(debt._id, debt)
  console.log('Successfully updated debt')
}

module.exports = {
  getDebts: getDebts,
  createDebt: createDebt,
  deleteDebt: deleteDebt,
  deleteDebts: deleteDebts,
  updateDebt: updateDebt
}
