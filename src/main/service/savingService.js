const savingDao = require('../dao/savingDao')

async function getSavings (bookingYear) {
  console.log(`Getting savings for year ${bookingYear}`)
  var savings = await savingDao.findByYear(bookingYear)
  console.log(`Returning savings: \n${JSON.stringify(savings, null, 2)}`)
  return savings
}

async function createSaving (saving) {
  delete saving._id
  console.log(`Creating saving: \n${JSON.stringify(saving, null, 2)}`)
  await savingDao.insert(saving)
  console.log('Successfully created saving')
}

async function updateSaving (saving) {
  console.log(`Updating saving: \n${JSON.stringify(saving, null, 2)}`)
  await savingDao.updateById(saving._id, saving)
  console.log('Successfully updated saving')
}

async function deleteSaving (id) {
  console.log(`Deleting saving with id ${id}`)
  await savingDao.removeById(id)
  console.log('Successfully deleted saving')
}

async function deleteSavings (ids) {
  console.log(`Deleting savings with ids ${ids}`)
  await savingDao.removeByIds(ids)
  console.log('Successfully deleted savings')
}

module.exports = {
  getSavings: getSavings,
  createSaving: createSaving,
  updateSaving: updateSaving,
  deleteSaving: deleteSaving,
  deleteSavings: deleteSavings
}
