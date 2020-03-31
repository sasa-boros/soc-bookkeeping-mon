function findAll (createdAtSortDirection) {
    if (!createdAtSortDirection) {
        createdAtSortDirection = -1
    } 
    return new Promise((resolve, reject) => { 
        db.shares.find({}).sort({ 'createdAt': createdAtSortDirection }).exec( (err, docs) => {
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
        db.shares.find({ 'year': year }).sort({ 'createdAt': createdAtSortDirection }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function insert (share) {
    share.createdAt = Date.now()
    share.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.shares.insert(share, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function updateById (id, share) {
    share.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.shares.update({ _id: id }, share, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
        })
    })
}

function removeById (id) {
    return new Promise((resolve, reject) => { 
        db.shares.remove({ _id: id }, {}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

function removeByIds (ids) {
    return new Promise((resolve, reject) => { 
        db.shares.remove({ _id: { $in : ids }}, {multi: true}, (err, numRemoved) => {
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