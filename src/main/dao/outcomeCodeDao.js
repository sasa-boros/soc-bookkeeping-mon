function findAll () {
    return new Promise((resolve, reject) => { 
        db.outcomeCodes.find({}).sort({ 'partition': 1, 'position': 1 }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findById (id) {
    return new Promise((resolve, reject) => { 
        db.outcomeCodes.findOne({_id: id}, (err, doc) => {
            if (err) {
                reject(err)
            }
            resolve(doc)
        })
    })
}

function findByYear (year) {
    return new Promise((resolve, reject) => { 
        db.outcomeCodes.find({year: year}).sort({ 'partition': 1, 'position': 1 }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function insert (outcomeCode) {
    return new Promise((resolve, reject) => { 
        db.outcomeCodes.insert(outcomeCode, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function updateById (id, outcomeCode) {
    return new Promise((resolve, reject) => { 
        db.outcomeCodes.update({ _id: id }, outcomeCode, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
        })
    })
}

function removeById (id) {
    return new Promise((resolve, reject) => { 
        db.outcomeCodes.remove({ _id: id }, {}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

module.exports = {
    findAll: findAll,
    findById: findById,
    findByYear: findByYear,
    insert: insert,
    updateById: updateById,
    removeById: removeById
}