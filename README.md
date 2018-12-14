# Peer-to-Peer Collaborative Editor

This application uses the [Automerge](https://github.com/automerge/automerge) library to implement a simple command-line peer-to-peer collaborative text editor in Node.js. Automerge uses **C**onflict-Free **R**eplicated **D**ata **T**ypes (CRDTs) to build collaborative applications. Its text editing support is currently experimental, which is why we thought it would be interesting to test out.

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
So far, a key limitation with Automerge seems to be creating the initial empty document. It's possible we may have overlooked this detail somewhere in the documentation, but it appears that if two peers both perform edits on an empty document that they each initialized, and then commit them, changes will get overwritten when trying to merge the two.

However, as long as only one peer makes the initial change to an empty document and then commits it to all other peers, the order of edits does not seem to matter after this point and the program runs smoothly. 

A test that demonstrates this limitation is presented in the `test` folder, see the following section for more details.

## Tests
Tests are contained in the `test` folder and are written using `mocha`. The tests verify correctness of some parts of Automerge as well as functions written in this repository.

### Running the Tests
To run the tests, use the following command: `npm test`  
It will run the entire test suite and indicate which tests failed and which passed. Note that one of the tests in `file creation` should fail due to the limitations described earlier.

### Automerge
The `applyChanges()` function of Automerge is tested in `testApplyChanges.js`. This function takes an existing document and applies a set of changes to it.   
The results of these tests indicate that Automerge is able to correctly apply changes from other peers on top of empty documents and documents where local changes have been made that the sending peer did not have. It also verifies that changes applied in either order (either peer -> local or local -> peer) result in the same document.

### Converting User JSON to Document Changes
The `changeDoc()` function in `changes.js` is tested in `testChangeDoc.js`. This function takes a JSON oject from the user that is either an insert, append, or delete operation and applies it to a document. It also initializes the document with text if it has not yet been initialized.   
The results of these tests indicate that `changeDoc()` is able to correctly insert and append on both an empty and non-empty document. It also verifies that `changeDoc()` is able to correctly delete from a non-empty document. In the case of an empty document, the tests also show that the function initializes the document with text.

### Limitations
The tests in `testFileCreation.js` explore the limitation mentioned earlier. In the first test, we create our first document which is initialized with text. This change is then applied to a second document. We then add the word "hello" to the first document and add "hi" to the second document. The changes made to the first document are then applied to the second document and vice versa. After merging, we can see that both documents agree on the same file content and contain either "hellohi" or "hihello".

In the second test, we try to do the same thing but with two separately created documents. We create the first document, initialize it with text, and add the word "hello" to it. We also create a second document, initialize it with text, and add the word "hi" to it. All the changes made in the first document are then applied to the second document and vice versa. After merging, both documents agree on a value but it is not the concatenation of their two strings, instead it is either just "hello" or "hi". 

Only the changes from one of the two documents remains after merging. This appears to contradict the Automerge documentation which states that "If two users concurrently insert at the same position, Automerge will arbitrarily place one of the insertions first and the other second, while ensuring that the final order is the same on all nodes." It remains unclear why this happens only when the two documents are separately initialized.
