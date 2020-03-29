const itemDao = require('../dao/itemDao')

async function getItems (bookingYear) {
  console.log(`Getting items for year ${bookingYear}`)
  var items = await itemDao.findByYear(bookingYear)
  console.log(`Returning items: \n${JSON.stringify(items, null, 2)}`)
  return items
}

async function createItem (item) {
  delete item._id
  console.log(`Creating item: \n${JSON.stringify(item, null, 2)}`)
  await itemDao.insert(item)
  console.log('Successfully created item')
}

async function updateItem (item) {
  console.log(`Updating item: \n${JSON.stringify(item, null, 2)}`)
  await itemDao.updateById(item._id, item)
  console.log('Successfully updated item')
}

async function deleteItem (id) {
  console.log(`Deleting item with id ${id}`)
  await itemDao.removeById(id)
  console.log('Successfully deleted item')
}

async function deleteItems (ids) {
  console.log(`Deleting items with ids ${ids}`)
  await itemDao.removeByIds(ids)
  console.log('Successfully deleted items')
}

module.exports = {
  getItems: getItems,
  createItem: createItem,
  updateItem: updateItem,
  deleteItem: deleteItem,
  deleteItems: deleteItems
}
