function findAll () {
    return new Promise((resolve, reject) => { 
        db.incomeCodes.find({}).sort({ 'partition': 1, 'position': 1 }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findById (id) {
    return new Promise((resolve, reject) => { 
        db.incomeCodes.findOne({_id: id}, (err, doc) => {
            if (err) {
                reject(err)
            }
            resolve(doc)
        })
    })
}

function insert (doc) {
    return new Promise((resolve, reject) => { 
        db.incomeCodes.insert(doc, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function removeById (id) {
    return new Promise((resolve, reject) => { 
        db.incomeCodes.remove({ _id: id }, {}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

function updateById (id, doc) {
    return new Promise((resolve, reject) => { 
        db.incomeCodes.update({ _id: id }, doc, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
        })
    })
}

module.exports = {
    findAll: findAll,
    findById, findById,
    insert: insert,
    removeById: removeById,
    updateById: updateById
}