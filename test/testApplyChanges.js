const expect = require('chai').expect;
const automerge = require('automerge')

describe('automerge.applyChanges()', function() {
    it ('should return an unchanged doc when changes is empty', function() {
        // The original document. 
        var str = "hello"
        var originalDoc = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str.length; x++){
                doc.text.insertAt(x, str.charAt(x))
            }
        })

        var originalText = originalDoc.text.join('')

        // Create an empty set of changes.
        var emptyChanges = []

        originalDoc = automerge.applyChanges(originalDoc, emptyChanges)
        
        var newText = originalDoc.text.join('')
        expect(originalText).to.be.equal(newText)
    })

    it ('should return a doc with the same file content as the peer when applied on an empty doc', function (){
        var str = "hello"

        // The peer's document.
        var peerDoc = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str.length; x++){
                doc.text.insertAt(x, str.charAt(x))
            }
        })

        var peerFileContent = peerDoc.text.join('')

        // Changes sent by the peer. 
        var peerChanges = automerge.getChanges(automerge.init(), peerDoc)

        // My empty document.
        var myDoc = automerge.init()
        
        myDoc = automerge.applyChanges(myDoc, peerChanges)
        myFileContent = myDoc.text.join('')

        // Expect the content to be the same in both documents.
        expect(peerFileContent).to.be.equal(myFileContent)
    })

    it('should not apply duplicate deletions', function() {
        // The original document that both peers have.
        var str = "hello"
        var originalDoc = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str.length; x++){
                doc.text.insertAt(x, str.charAt(x))
            }
        })

        // Deletion made by me.
        var myDoc = automerge.change(originalDoc, doc => {
            doc.text.deleteAt(1)
        }) 

        myFileContent = myDoc.text.join('')

        // Deletion made by peer (duplicate of mine).
        var peerDoc = automerge.change(originalDoc, doc => {
            doc.text.deleteAt(1)
        })

        // Changes sent by the peer.
        var peerChanges = automerge.getChanges(originalDoc, peerDoc)

        myDoc = automerge.applyChanges(myDoc, peerChanges)
        myNewFileContent = myDoc.text.join('')

        expect(myFileContent).to.be.equal(myNewFileContent)
    })

    it('should merge peer changes on top of local changes with same result as merging local changes on top of peer changes', function() {
        // The original document that both peers have.
        var str = "hello"
        var originalDoc = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str.length; x++){
                doc.text.insertAt(x, str.charAt(x))
            }
        })
        originalChanges = automerge.getChanges(automerge.init(), originalDoc)

        // Changes made by peer.
        var peerDoc = automerge.change(originalDoc, doc => {
            str = " everyone"
            for (let x = 0; x < str.length; x++){
                doc.text.push(str.charAt(x))
            }
        })
        peerChanges = automerge.getChanges(originalDoc, peerDoc)

        // Sync up myDoc with originalChanges.
        var myDoc = automerge.init()
        myDoc = automerge.applyChanges(myDoc, originalChanges)

        // Make changes on my side.
        myNewDoc = automerge.change(myDoc, doc => {
            doc.text.deleteAt(0)
            doc.text.insertAt(0, 'H')
            str = " there"
            for (let x = 0; x < str.length; x++){
                doc.text.push(str.charAt(x))
            }
        }) 
        myChanges = automerge.getChanges(originalDoc, myNewDoc)

        // Apply peer changes to my document.
        myNewDoc = automerge.applyChanges(myNewDoc, peerChanges)

        // Apply my changes to peer document.
        peerDoc = automerge.applyChanges(peerDoc, myChanges)

        // Verify that the file content is the same for both peers.
        expect(myNewDoc.text.join('')).to.be.equal(peerDoc.text.join(''))
    })
})