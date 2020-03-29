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

function findOneByYear (year) {
    return new Promise((resolve, reject) => { 
        db.annualReports.findOne({year: year}, (err, doc) => {
            if (err) {
                reject(err)
            }
            resolve(doc)
        })
    })
}

function insert (annualReport) {
    return new Promise((resolve, reject) => { 
        db.annualReports.insert(annualReport, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function updateById (id, annualReport) {
    return new Promise((resolve, reject) => { 
        db.annualReports.update({ _id: id }, annualReport, (err, numReplaced) => {
            if (err) {
                reject(err)
            }
            resolve(numReplaced)
        })
    })
}

function removeByYear (year) {
    return new Promise((resolve, reject) => { 
        db.annualReports.remove({year: year}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

module.exports = {
    findAll: findAll,
    findOneByYear: findOneByYear,
    insert: insert,
    updateById: updateById,
    removeByYear: removeByYear
}