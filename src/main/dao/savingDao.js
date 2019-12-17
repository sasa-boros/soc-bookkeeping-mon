function findAll () {
    return new Promise((resolve, reject) => { 
        db.savings.find({}).sort({ 'createdAt': -1 }).exec( (err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findAllForYear (year) {
    return new Promise((resolve, reject) => { 
        db.savings.find({ 'year': year }).sort({ 'createdAt': 1 }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function insert (doc) {
    doc.createdAt = Date.now()
    doc.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.savings.insert(doc, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function removeById (id) {
    return new Promise((resolve, reject) => { 
        db.savings.remove({ _id: id }, {}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

function removeManyByIds (ids) {
    return new Promise((resolve, reject) => { 
        db.savings.remove({ _id: { $in : ids }}, {multi: true}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

function updateById (id, doc) {
    doc.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.savings.update({ _id: id }, doc, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
        })
    })
}

module.exports = {
    findAll: findAll,
    findAllForYear: findAllForYear,
    insert: insert,
    removeById: removeById,
    removeManyByIds: removeManyByIds,
    updateById: updateById
}