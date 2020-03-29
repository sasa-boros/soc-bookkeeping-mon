const shareDao = require('../dao/shareDao')

async function getShares (bookingYear) {
  console.log(`Getting shares for year ${bookingYear}`)
  var shares = await shareDao.findByYear(bookingYear)
  console.log(`Returning shares: \n${JSON.stringify(shares, null, 2)}`)
  return shares
}

async function createShare (share) {
  delete share._id
  console.log(`Creating share: \n${JSON.stringify(share, null, 2)}`)
  await shareDao.insert(share)
  console.log('Successfully created share')
}

async function updateShare (share) {
  console.log(`Updating share: \n${JSON.stringify(share, null, 2)}`)
  await shareDao.updateById(share._id, share)
  console.log('Successfully updated share')
}

async function deleteShare (id) {
  console.log(`Deleting share with id ${id}`)
  await shareDao.removeById(id)
  console.log('Successfully deleted share')
}

async function deleteShares (ids) {
  console.log(`Deleting shares with ids ${ids}`)
  await shareDao.removeByIds(ids)
  console.log('Successfully deleted shares')
}

module.exports = {
  getShares: getShares,
  createShare: createShare,
  updateShare: updateShare,
  deleteShare: deleteShare,
  deleteShares: deleteShares
}
