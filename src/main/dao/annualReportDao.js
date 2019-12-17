function findAll () {
    return new Promise((resolve, reject) => { 
        db.annualReports.find({}, (err, docs) => {
            if (err) {
                reject(err)
            }
            resolve(docs)
        })
    })
}

function findOneForYear (year) {
    return new Promise((resolve, reject) => { 
        db.annualReports.findOne({year: year}, (err, doc) => {
            if (err) {
                reject(err)
            }
            resolve(doc)
        })
    })
}

function insert (doc) {
    return new Promise((resolve, reject) => { 
        db.annualReports.insert(doc, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function removeOneForYear (year) {
    return new Promise((resolve, reject) => { 
        db.annualReports.remove({year: year}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

function updateById (id, doc) {
    return new Promise((resolve, reject) => { 
        db.annualReports.update({ _id: id }, doc, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
        })
    })
}

module.exports = {
    findAll: findAll,
    findOneForYear: findOneForYear,
    insert: insert,
    removeOneForYear: removeOneForYear,
    updateById: updateById
}