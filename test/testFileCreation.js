const expect = require('chai').expect;
const automerge = require('automerge')

describe('file creation', function() {
    // This test case passes, but the one below it with two separate document initializations does not.
    it('should return merged changes when a document is created and its changes are applied to another document', function() {
        // The original document that both sides have.
        var originalDoc = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
        })
        originalChanges = automerge.getChanges(automerge.init(), originalDoc)

        // Changes made by doc1.
        str1 = "hello"
        var doc1 = automerge.change(originalDoc, doc => {
            str = "hello"
            for (let x = 0; x < str1.length; x++){
                doc.text.insertAt(x, str1.charAt(x))
            }
        })
        doc1Changes = automerge.getChanges(originalDoc, doc1)

        // Sync doc2 up with originalDoc.
        var doc2 = automerge.init()
        doc2 = automerge.applyChanges(doc2, originalChanges)

        // Changes made by doc2.
        str2 = "hello"
        newDoc2 = automerge.change(doc2, doc => {
            for (let x = 0; x < str2.length; x++){
                doc.text.insertAt(x, str2.charAt(x))
            }
        }) 
        doc2Changes = automerge.getChanges(doc2, newDoc2)

        // Apply doc1 changes to doc2.
        newDoc2 = automerge.applyChanges(newDoc2, doc1Changes)

        // Apply doc2 changes to doc1.
        doc1 = automerge.applyChanges(doc1, doc2Changes)

        // Verify that the file content is the same for both peers.
        expect(newDoc2.text.join('')).to.be.equal(doc1.text.join(''))

        // Verify that the file content is the concatenation of str1+str2 or str2+str1.
        expect(doc1.text.join('')).to.be.oneOf([str1+str2, str2+str1])
    })

    // This test does not pass due to the limitations mentioned in README.md
    it ('should return merged changes when two documents are created and their changes are exchanged', function() {
        // Create document 1.
        var str1 = "hello"
        doc1 = automerge.change(automerge.init(), 'initialize document', doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str1.length; x++){
                doc.text.insertAt(x, str1.charAt(x))
            }
        })

        // Get all changes made to document 1 since the start.
        changesDoc1 = automerge.getChanges(automerge.init(), doc1)

        // Create document 2.
        var str2 = "hi"
        doc2 = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str2.length; x++){
                doc.text.insertAt(x, str2.charAt(x))
            }
        })

        // Get all changes made to document 2 since the start.
        changesDoc2 = automerge.getChanges(automerge.init(), doc2)

        // Merge document 2 changes into document 1.
        finalDoc1 = automerge.applyChanges(doc1, changesDoc2)

        // Merge document 1 changes into document 2.
        finalDoc2 = automerge.applyChanges(doc2, changesDoc1)

        // This passes.
        expect(finalDoc1.text.join('')).to.be.equal(finalDoc2.text.join(''))

        // This does not pass, either "hi" or "hello" gets overwritten instead of the two changes being concatenated.
        expect(finalDoc1.text.join('')).to.be.oneOf([str1+str2, str2+str1])
    })
})