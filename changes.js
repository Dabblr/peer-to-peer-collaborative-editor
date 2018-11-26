const automerge = require('automerge')

// Applies the changes from a peer to the given document and returns the new document.
exports.applyChangesFromPeer = function(changes, doc) {
    return automerge.applyChanges(doc, changes)
};

// Updates the given document with the changes from the user.
exports.changeDoc = function(data, document, created){
    return automerge.change(document, doc =>{
        if (created == false) {
            doc.text = new automerge.Text()
        }
        if (data.operation == "insert") {
            index = data.index
            str = data.value
            for (let i = 0; i < str.length; i++){
                doc.text.insertAt(i+index, str.charAt(i))
            }
        } 
        else if (data.operation == "append"){
            str = data.value
            for (let i = 0; i < str.length; i++){
                doc.text.push(str.charAt(i))
            }
        }
        else if (data.operation == "delete") {
            index = data.index
            doc.text.deleteAt(index)
        }
    })
};

// Returns all changes that have been made on the new doc since the old doc.
exports.getChanges = function(oldDoc, newDoc){
    return automerge.getChanges(oldDoc, newDoc)
};