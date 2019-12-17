function findAll () {
    return new Promise((resolve, reject) => { 
        db.paymentSlips.find({}).sort({ 'createdAt': -1 }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findAllSortByDateAsc () {
    return new Promise((resolve, reject) => { 
        db.paymentSlips.find({}).sort({ 'date': 1, 'createdAt': 1 }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findBetweenDatesSortByOrdinalAsc (startDate, endDate) {
    return new Promise((resolve, reject) => { 
        db.paymentSlips.find({ 'date': { '$gte': startDate, '$lt': endDate } }).sort({ 'ordinal': 1}).exec((err, docs) => {
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
        db.paymentSlips.insert(doc, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function removeById (id) {
    return new Promise((resolve, reject) => { 
        db.paymentSlips.remove({ _id: id }, {}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

function removeManyByIds (ids) {
    return new Promise((resolve, reject) => { 
        db.paymentSlips.remove({ _id: { $in : ids }}, {multi: true}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

function updateById (id, doc, notTimestamped) {
    if (!notTimestamped) {
        doc.updatedAt = Date.now()
    }
    return new Promise((resolve, reject) => { 
        db.paymentSlips.update({ _id: id }, doc, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
        })
    })
}

module.exports = {
    findAll: findAll,
    findAllSortByDateAsc: findAllSortByDateAsc,
    findBetweenDatesSortByOrdinalAsc: findBetweenDatesSortByOrdinalAsc,
    insert: insert,
    removeById: removeById,
    removeManyByIds: removeManyByIds,
    updateById: updateById
}