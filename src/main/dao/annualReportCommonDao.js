function findOne () {
    return new Promise((resolve, reject) => { 
        db.annualReportCommons.findOne({}, (err, doc) => {
            if (err) {
                reject(err)
            }
            resolve(doc)
        })
    })
}

function insert (annualReportCommon) {
    return new Promise((resolve, reject) => { 
        db.annualReportCommons.insert(annualReportCommon, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function removeAll () {
    return new Promise((resolve, reject) => { 
        db.annualReportCommons.remove({}, {multi: true}, (err, numRemoved) => {
            if (err) {
                reject(err)
            }
            resolve(numRemoved)
        })
    })
}

module.exports = {
    findOne: findOne,
    insert: insert,
    removeAll: removeAll
}