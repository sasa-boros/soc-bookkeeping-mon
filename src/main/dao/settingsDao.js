function findOne () {
    return new Promise((resolve, reject) => { 
        db.settings.findOne({}, (err, doc) => {
            if (err) {
                reject(err)
            }
            resolve(doc)
        })
    })
}

function insert (doc) {
    return new Promise((resolve, reject) => { 
        db.settings.insert(doc, (err, newDoc) => {
            if (err) {
                reject(err)
            }
            resolve(newDoc)
        })
    })
}

function removeAll () {
    return new Promise((resolve, reject) => { 
        db.settings.remove({}, {multi: true}, (err, numRemoved) => {
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