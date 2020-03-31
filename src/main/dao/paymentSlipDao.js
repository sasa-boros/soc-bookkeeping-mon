function findAll (createdAtSortDirection) {
    if (!createdAtSortDirection) {
        createdAtSortDirection = -1
    } 
    return new Promise((resolve, reject) => { 
        db.paymentSlips.find({}).sort({ 'createdAt': createdAtSortDirection }).exec((err, docs) => {
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
        db.paymentSlips.find({year: year}).sort({ 'createdAt': createdAtSortDirection }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findByYearSortByDateAsc (year) {
    return new Promise((resolve, reject) => { 
        db.paymentSlips.find({year: year}).sort({ 'date': 1, 'createdAt': 1 }).exec((err, docs) => {
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

function insert (paymentSlip) {
    paymentSlip.createdAt = Date.now()
    paymentSlip.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.paymentSlips.insert(paymentSlip, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function updateById (id, paymentSlip, notTimestamped) {
    if (!notTimestamped) {
        paymentSlip.updatedAt = Date.now()
    }
    return new Promise((resolve, reject) => { 
        db.paymentSlips.update({ _id: id }, paymentSlip, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
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

function removeByIds (ids) {
    return new Promise((resolve, reject) => { 
        db.paymentSlips.remove({ _id: { $in : ids }}, {multi: true}, (err, numRemoved) => {
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