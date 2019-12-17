const itemDao = require('../dao/itemDao')

async function getItems () {
  console.log(`Getting all items`)
  var items = await itemDao.findAll()
  console.log(`Returning items: \n${JSON.stringify(items, null, 2)}`)
  return items
}

async function createItem (item) {
  delete item._id
  console.log(`Creating item: \n${JSON.stringify(item, null, 2)}`)
  await itemDao.insert(item)
  console.log('Successfully created item')
}

async function deleteItem (itemId) {
  console.log(`Deleting item with id ${itemId}`)
  await itemDao.removeById(itemId)
  console.log('Successfully deleted item')
}

async function deleteItems (itemsIds) {
  console.log(`Deleting items with ids ${itemsIds}`)
  await itemDao.removeManyByIds(itemsIds)
  console.log('Successfully deleted items')
}

async function updateItem (item) {
  console.log(`Updating item: \n${JSON.stringify(item, null, 2)}`)
  await itemDao.updateById(item._id, item)
  console.log('Successfully updated item')
}

module.exports = {
  getItems: getItems,
  createItem: createItem,
  deleteItem: deleteItem,
  deleteItems: deleteItems,
  updateItem: updateItem
}
