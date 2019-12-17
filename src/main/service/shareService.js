const shareDao = require('../dao/shareDao')

async function getShares () {
  console.log(`Getting all shares`)
  var shares = await shareDao.findAll()
  console.log(`Returning shares: \n${JSON.stringify(shares, null, 2)}`)
  return shares
}

async function createShare (share) {
  delete share._id
  console.log(`Creating share: \n${JSON.stringify(share, null, 2)}`)
  await shareDao.insert(share)
  console.log('Successfully created share')
}

async function deleteShare (shareId) {
  console.log(`Deleting share with id ${shareId}`)
  await shareDao.removeById(shareId)
  console.log('Successfully deleted share')
}

async function deleteShares (sharesIds) {
  console.log(`Deleting shares with ids ${sharesIds}`)
  await shareDao.removeManyByIds(sharesIds)
  console.log('Successfully deleted shares')
}

async function updateShare (share) {
  console.log(`Updating share: \n${JSON.stringify(share, null, 2)}`)
  await shareDao.updateById(share._id, share)
  console.log('Successfully updated share')
}

module.exports = {
  getShares: getShares,
  createShare: createShare,
  deleteShare: deleteShare,
  deleteShares: deleteShares,
  updateShare: updateShare
}
