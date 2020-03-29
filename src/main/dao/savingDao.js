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

function findByYear (year) {
    return new Promise((resolve, reject) => { 
        db.savings.find({ 'year': year }).sort({ 'createdAt': 1 }).exec((err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function insert (saving) {
    saving.createdAt = Date.now()
    saving.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.savings.insert(saving, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function updateById (id, saving) {
    saving.updatedAt = Date.now()
    return new Promise((resolve, reject) => { 
        db.savings.update({ _id: id }, saving, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
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

function removeByIds (ids) {
    return new Promise((resolve, reject) => { 
        db.savings.remove({ _id: { $in : ids }}, {multi: true}, (err, numRemoved) => {
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