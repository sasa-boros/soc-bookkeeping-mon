function findAll () {
    return new Promise((resolve, reject) => { 
        db.receipts.find({}).sort({ 'createdAt': -1 }).exec( (err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findByYear (year) {
    return new Promise((resolve, reject) => { 
        db.receipts.find({year: year}).sort({ 'createdAt': -1 }).exec( (err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findByYearSortByDateAsc (year) {
    return new Promise((resolve, reject) => { 
        db.receipts.find({year: year}).sort({ 'date': 1, 'createdAt': 1 }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findBetweenDatesSortByOrdinalAsc (startDate, endDate) {
    return new Promise((resolve, reject) => { 
        db.receipts.find({ 'date': { '$gte': startDate, '$lt': endDate } }).sort({ 'ordinal': 1}).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function insert (receipt) {
    receipt.createdAt = Date.now()
    receipt.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.receipts.insert(receipt, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function updateById (id, receipt, notTimestamped) {
    if (!notTimestamped) {
        receipt.updatedAt = Date.now()
    }
    return new Promise((resolve, reject) => { 
        db.receipts.update({ _id: id }, receipt, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
        })
    })
}

function removeById (id) {
    return new Promise((resolve, reject) => { 
        db.receipts.remove({ _id: id }, {}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

function removeByIds (ids) {
    return new Promise((resolve, reject) => { 
        db.receipts.remove({ _id: { $in : ids }}, {multi: true}, (err, numRemoved) => {
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
    findByYearSortByDateAsc: findByYearSortByDateAsc,
    findBetweenDatesSortByOrdinalAsc: findBetweenDatesSortByOrdinalAsc,
    insert: insert,
    updateById: updateById,
    removeById: removeById,
    removeByIds: removeByIds
}