function findAll (createdAtSortDirection) {
    if (!createdAtSortDirection) {
        createdAtSortDirection = -1
    } 
    return new Promise((resolve, reject) => { 
        db.items.find({}).sort({ 'createdAt': createdAtSortDirection }).exec( (err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findByYear (year, createdAtSortDirection) {
    if (!createdAtSortDirection) {
        createdAtSortDirection = -1
    } 
    return new Promise((resolve, reject) => { 
        db.items.find({ 'year': year }).sort({ 'createdAt': createdAtSortDirection }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function insert (item) {
    item.createdAt = Date.now()
    item.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.items.insert(item, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function updateById (id, item) {
    item.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.items.update({ _id: id }, item, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
        })
    })
}

function removeById (id) {
    return new Promise((resolve, reject) => { 
        db.items.remove({ _id: id }, {}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

function removeByIds (ids) {
    return new Promise((resolve, reject) => { 
        db.items.remove({ _id: { $in : ids }}, {multi: true}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

module.exports = {
    findAll: findAll,
    findByYear: findByYear,
    insert: insert,
    updateById: updateById,
    removeById: removeById,
    removeByIds: removeByIds
}