function findAll () {
    return new Promise((resolve, reject) => { 
        db.debts.find({}).sort({ 'createdAt': -1 }).exec( (err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findByYear (year) {
    return new Promise((resolve, reject) => { 
        db.debts.find({ 'year': year }).sort({ 'createdAt': 1 }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function insert (debt) {
    debt.createdAt = Date.now()
    debt.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.debts.insert(debt, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function updateById (id, debt) {
    debt.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.debts.update({ _id: id }, debt, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
        })
    })
}

function removeById (id) {
    return new Promise((resolve, reject) => { 
        db.debts.remove({ _id: id }, {}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

function removeByIds (ids) {
    return new Promise((resolve, reject) => { 
        db.debts.remove({ _id: { $in : ids }}, {multi: true}, (err, numRemoved) => {
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