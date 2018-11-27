const automerge = require('automerge')
const jsonStream = require('duplex-json-stream')
const streamSet = require('stream-set')
const topology = require('fully-connected-topology')
const changes = require('./changes.js')

// My address/port number
var me = process.argv[2]
// The addresses/port numbers of all my peers.
var peers = process.argv.slice(3)

var swarm = topology(me, peers)
var streams = streamSet()

// The document state since the last commit.
var doc = automerge.init()

// The local document state.
var localDoc = automerge.init()

// False if the document text has not yet been initialized, true otherwise.
var docCreated = false

// Sends the changes object to all peers.
function sendToPeers(changes){
    streams.forEach(function (peer) {
        peer.write(changes)
    })
}

// Parses the user input and performs the appropriate command.
function parse(data){
    try {
        data = JSON.parse(data)
    } catch(e) {
        // Data was not in proper JSON format, ignore the command.
        console.log("Invalid JSON, try again.")
        return
    }

    if (data.operation == "commit") {
        // Get changes since last commit.
        localChanges = automerge.getChanges(doc, localDoc)
        // Apply changes to doc. 
        doc = automerge.applyChanges(doc, localChanges)
        // Send local changes to peers.
        sendToPeers(localChanges)
    } else if (data.operation == "insert" || data.operation == "delete" || data.operation == "append"){
        // Update the local document with the changes.
        localDoc = changes.changeDoc(data, localDoc, docCreated)
        docCreated = true
    }
}

// Listen for updates from peers.
swarm.on('connection', function(socket) {
    console.log('[a peer joined]')
    socket = jsonStream(socket)
    streams.add(socket)
    socket.on('data', function(data){
        localDoc = automerge.applyChanges(localDoc, data)
        docCreated = true
        console.log("File content: " + localDoc.text.join(''))
    })
})

// Listen for updates from the terminal.
process.stdin.on('data', function(data){
    parse(data.toString().trim())
    console.log("File content: " + localDoc.text.join(''))
})