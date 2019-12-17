function findOne () {
    return new Promise((resolve, reject) => { 
        db.defaultPaymentSlips.findOne({}, (err, doc) => {
            if (err) {
                reject(err)
            }
            resolve(doc)
        })
    })
}

function insert (doc) {
    return new Promise((resolve, reject) => { 
        db.defaultPaymentSlips.insert(doc, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function removeAll () {
    return new Promise((resolve, reject) => { 
        db.defaultPaymentSlips.remove({}, {multi: true}, (err, numRemoved) => {
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