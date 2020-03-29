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

function findByYear (year) {
    return new Promise((resolve, reject) => { 
        db.incomeCodes.find({year: year}).sort({ 'partition': 1, 'position': 1 }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function insert (incomeCode) {
    return new Promise((resolve, reject) => { 
        db.incomeCodes.insert(incomeCode, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function updateById (id, incomeCode) {
    return new Promise((resolve, reject) => { 
        db.incomeCodes.update({ _id: id }, incomeCode, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
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

module.exports = {
    findAll: findAll,
    findById, findById,
    findByYear: findByYear,
    insert: insert,
    updateById: updateById,
    removeById: removeById
}