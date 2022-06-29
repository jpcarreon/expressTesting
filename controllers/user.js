const fs = require('fs');
const path = require('path');

const userDB = path.join(__dirname, '..', 'data', 'user.json');
const utils = require('./utils');

// controllers

/**
 * [GET]
 *  - Finds a user
 */
exports.findUser = (req,res) => {
    var id = req.query.username;
    
    function userFinder(currUser){  // compares primary key values
        if(currUser.username == id){
            return currUser;
        }
    }

    // read DB content
    fs.readFile(userDB, 'utf8', (err, data) => {

        if (err) {
            console.log(err);
            return res.status(400).send({ 'success': false });
        }
        
        // parse db to array of objects
        var file = JSON.parse(data);

        // check match
        var foundUser = file['users'].find(userFinder);

        if(foundUser == null){
            return res.send({ 'success': false });
        }

        return res.status(200).send({ 'success': true, 'data': foundUser});

    });
}

/**
 * [POST]
 *  - Creates a user
 */
exports.createUser = (req, res) => {
    const newUser = {
        username: req.body.username,
        password: req.body.password
    }

    //  read user db
    fs.readFile(userDB, 'utf8', (err, data) => {
        //  failed to read file
        if (err) {
            console.log(err);
            return res.status(400).send({ 'success': false });
        }
        
        //  parse db and add a new user
        var file = JSON.parse(data);

        for (let i = 0; i < file['users'].length; i++) {
            if (file['users'][i].username == newUser.username) {
                console.log('Duplicate User!')
                return res.status(400).send({ 'success': false });
            }
        }

        file['users'].push(newUser);

        //  write changes to db with \t indentation
        fs.writeFile(userDB, JSON.stringify(file, null, '   '), 'utf8', (err) => {
            //  failed to write to file
            if (err) {
                console.log(err);
                return res.status(500).send({ 'success': false });
            }

            res.status(201).send({ 'success': true });
        })
    });
}

/**
 * [PUT]
 * - Updates a user's password
 */
exports.updateUser = (req, res) => {
    var id = req.query.username;
    var newData = req.body.newData;

    function userFinder(currUser){
        if(currUser.username == id){
            return currUser;
        }
    }

    fs.readFile(userDB, 'utf8', (err, data) => {

        if (err) {
            console.log(err);
            return res.status(400).send({ 'success': false });
        }
        
        var file = JSON.parse(data);
        var foundUser = file['users'].find(userFinder);

        if(foundUser == null){
            return res.send({ 'success': false });
        }

        // replace content
        var index = file['users'].indexOf(foundUser);
        file['users'][index].password = newData;

        // save changes
        fs.writeFile(userDB, JSON.stringify(file, null, '   '), 'utf8', (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ 'success': false });
            }
            return res.status(201).send({ 'success': true });
        });
        
    });
}