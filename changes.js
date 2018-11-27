const automerge = require('automerge')

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