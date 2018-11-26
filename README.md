# Peer-to-Peer Collaborative Editor

This repository uses the [Automerge](https://github.com/automerge/automerge) library to implement a simple command-line peer-to-peer collaborative text editor in Node.js. Automerge uses **C**onflict-Free **R**eplicated **D**ata **T**ypes (CRDTs) to build collaborative applications. Its text editing support is currently experimental, which is why we thought it would be interesting to test out.

The goal of this implementation is purely to test out the CRDT approach used in Automerge and see how it compares to the Operational Transform approach we are using in our traditional client-server [collaborative text editor](https://github.com/Dabblr/Concurrent-Document-Editor). It is *not* a fully-fledged collaborative editor, there is no user-friendly GUI, and all commands must be entered as raw JSON on the terminal.

## Running the Application

First, clone this repository and navigate to it in your terminal. Run `npm install` to install all required dependencies.  

To run a peer, open a terminal and run `peer.js` with the following command `node peer.js <your address> <peer addresses>`   
Addresses should be in the form `<IP address>:<port number>`.

For example, if we want to create three peers, all running on `localhost` with the first one using port `9000`, the second using port `9001`, and the third using port `9002`, we would open 3 terminals and enter the following commands into each one. After creating all 3 peers, each terminal should receive 2 messages (one from each of the other 2 peers) indicating that a peer joined.

```
# Peer 1
> node peer.js localhost:9000 localhost:9001 localhost:9002
```

```
# Peer 2
> node peer.js localhost:9001 localhost:9000 localhost:9002
```


```
# Peer 3
> node peer.js localhost:9002 localhost:9000 localhost:9001
```

After this point, users can begin typing commands to collaborate on the file.

## User Input
There are 4 different commands a user can input on the terminal to make changes to a file: `insert`, `delete`, `append`, and `commit`. All commands must be written using JSON format.

Note that all changes that a peer makes to a file are only applied locally until the peer decides to commit them.

### Insert
This command allows the user to insert a string at a certain index into the file. The JSON for this command requires an `operation`, `index`, and `value` field. 

For example, suppose the file is currently empty and we wish to insert the string "abc" at index 0. We would write the following command: 
```
{"operation":"insert", "index":0, "value":"abc"}
```

The program will then return the new file content:
```
File content: abc
```

### Delete
This command allows the user to delete the character at a certain index in the file. The JSON for this command requires an `operation` and `index` field.

For example, suppose the file content is currently "abc" and we wish to delete the first character 'a' at index 0. We would write the following command:
```
{"operation":"delete", "index":0}
```

The program will then return the new file content:
```
File content: bc
```

### Append
This command allows the user to append a string to the end of the file. The JSON for this command requires an `operation` and `value` field. 

For example, suppose the file content is currently "bc" and we wish to append the string "def" to it. We would write the following command:
```
{"operation":"append", "value":"def"}
```

The program will then return the new file content:
```
File content: bcdef
```

### Commit
This command allows the user to send their local file changes to all of the other peers. The JSON for this command requires just an `operation` field. 

For example, suppose we have made the changes described in the above examples and our file content is now "bcdef". To share these changes with the other peers, we would write the following command:

```
{"operation":"commit"}
```

All other peers in the network would then receive these changes and apply them on top of any local changes they have. In this case, since we started with an empty file and no other peers have made changes to it, each peer would receive the following update:
```
File content: bcdef
``` 

## Convergence
Automerge guarantees that "whenever any two documents have applied the same set of changes -- even if the changes were applied in a different order -- then those two documents are equal". 

Therefore, as long as every peer eventually commits their local changes, all peers will have applied the same set of changes to their document and consequently, they will all have the same document state. 

## Limitations
So far, a key limitation with Automerge seems to be creating the initial empty document. It's possible we may have overlooked this detail somewhere in the documentation, but it appears that if two peers both perform edits on an empty document, and then commit them, errors will arise when trying to merge the two.

As long as only one peer makes the initial change to an empty document and then commits it to all other peers, the order of edits does not seem to matter after this point and the program runs smoothly. 