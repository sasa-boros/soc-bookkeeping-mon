const savingDao = require('../dao/savingDao')

async function getSavings () {
  console.log(`Getting all savings`)
  var savings = await savingDao.findAll()
  console.log(`Returning savings: \n${JSON.stringify(savings, null, 2)}`)
  return savings
}

async function createSaving (saving) {
  delete saving._id
  console.log(`Creating saving: \n${JSON.stringify(saving, null, 2)}`)
  await savingDao.insert(saving)
  console.log('Successfully created saving')
}

async function deleteSaving (savingId) {
  console.log(`Deleting saving with id ${savingId}`)
  await savingDao.removeById(savingId)
  console.log('Successfully deleted saving')
}

async function deleteSavings (savingsIds) {
  console.log(`Deleting savings with ids ${savingsIds}`)
  await savingDao.removeManyByIds(savingsIds)
  console.log('Successfully deleted savings')
}

async function updateSaving (saving) {
  console.log(`Updating saving: \n${JSON.stringify(saving, null, 2)}`)
  await savingDao.updateById(saving._id, saving)
  console.log('Successfully updated saving')
}

module.exports = {
  getSavings: getSavings,
  createSaving: createSaving,
  deleteSaving: deleteSaving,
  deleteSavings: deleteSavings,
  updateSaving: updateSaving
}
