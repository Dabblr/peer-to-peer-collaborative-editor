const expect = require('chai').expect;
const automerge = require('automerge')
const changes = require('../changes.js')

describe('changes.changeDoc()', function() {
    it('should initialize a new text document if created = false', function() {
        // Initial document.
        var doc = automerge.init()
        str = "hello"

        // Change to apply on document.
        change = {}
        created = false

        doc = changes.changeDoc(change, doc, created)
        expect(doc.text).to.not.be.an('undefined')
    })

    it('should correctly insert at the start into an empty document', function() {
        // Initial document.
        var doc = automerge.init()

        // Change to apply on document.
        str = "hello"
        change = {
            "operation":"insert",
            "index":0,
            "value":str
        }
        created = false

        doc = changes.changeDoc(change, doc, created)
        expect(doc.text.join('')).to.be.equal(str)
    })

    it('should correctly insert into the middle of a document', function() {
        // Create initial document.
        str = "hello everyone"
        var doc = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str.length; x++){
                doc.text.insertAt(x, str.charAt(x))
            }
        })

        // Change to apply on document.
        index = 6
        insertStr = "there "
        change = {
            "operation":"insert",
            "index":index,
            "value":insertStr
        }
        created = true

        expectedText = str.substring(0, index) + insertStr + str.substring(index)
        
        doc = changes.changeDoc(change, doc, created)
        expect(doc.text.join('')).to.be.equal(expectedText)
    })

    it('should correctly insert at the end of a document', function() {
        // Create initial document.
        str = "hello there"
        var doc = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str.length; x++){
                doc.text.insertAt(x, str.charAt(x))
            }
        })

        // Change to apply on document.
        index = 11
        insertStr = " everyone"
        change = {
            "operation":"insert",
            "index":index,
            "value":insertStr
        }
        created = true

        expectedText = str + insertStr

        doc = changes.changeDoc(change, doc, created)
        expect(doc.text.join('')).to.be.equal(expectedText)
    })

    it('should correctly append to an empty document', function() {
        // Initial document.
        var doc = automerge.init()

        // Change to apply on document.
        str = "hello"
        change = {
            "operation":"append",
            "value":str
        }
        created = false

        doc = changes.changeDoc(change, doc, created)
        expect(doc.text.join('')).to.be.equal(str)
    })

    it('should correctly append to a non-empty document', function() {
        // Initial document.
        str = "hello there"
        var doc = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str.length; x++){
                doc.text.insertAt(x, str.charAt(x))
            }
        })

        // Change to apply on document.
        insertStr = " everyone"
        change = {
            "operation":"append",
            "value":insertStr
        }
        created = true

        expectedText = str + insertStr

        doc = changes.changeDoc(change, doc, created)
        expect(doc.text.join('')).to.be.equal(expectedText)
    })

    it('should correctly delete from the start of a document', function() {
        // Initial document.
        str = "hello"
        var doc = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str.length; x++){
                doc.text.insertAt(x, str.charAt(x))
            }
        })

        // Change to apply on document.
        index = 0
        change = {
            "operation":"delete",
            "index":index
        }
        created = true

        expectedText = str.substring(1)

        doc = changes.changeDoc(change, doc, created)
        expect(doc.text.join('')).to.be.equal(expectedText)
    })

    it('should correctly delete from the middle of a document', function() {
        // Initial document.
        str = "hello"
        var doc = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str.length; x++){
                doc.text.insertAt(x, str.charAt(x))
            }
        })

        // Change to apply on document.
        index = 2
        change = {
            "operation":"delete",
            "index":index
        }
        created = true

        expectedText = str.substring(0, index) + str.substring(index+1)

        doc = changes.changeDoc(change, doc, created)
        expect(doc.text.join('')).to.be.be.equal(expectedText)
    })

    it('should correctly delete at the end of a document', function() {
        // Initial document.
        str = "hello"
        var doc = automerge.change(automerge.init(), doc => {
            doc.text = new automerge.Text()
            for (let x = 0; x < str.length; x++){
                doc.text.insertAt(x, str.charAt(x))
            }
        })

        // Change to apply on document.
        index = 4
        change = {
            "operation":"delete",
            "index":index
        }
        created = true

        expectedText = str.substring(0, str.length-1)
        
        doc = changes.changeDoc(change, doc, created)
        expect(doc.text.join('')).to.be.equal(expectedText)
    })
})