const fs = require('fs');
const path = require('path');
const jwt = require("jsonwebtoken");

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

    
    const file = utils.openDB();
    if (!file) 
        return res.status(400).send({ 'success': false });
    
    //  look through users for duplicates
    if (utils.findUser(file['users'], newUser.username) >= 0) {
        console.log('Duplicate User!')
        return res.status(400).send({ 'success': false });
    }
    
    //  add new user
    file['users'].push(newUser);

    if (!utils.updateDB(file)) 
        return res.status(500).send({ 'success': false })
    

    res.status(201).send({ 'success': true });
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

exports.loginUser = (req, res) => {
    //  check if fields are complete
    if (!req.body.username || !req.body.password) {
        return res.status(400).send({
            'success': false,
            'message': 'Missing Required Fields'
        })
    }

    //  open the DB to look for the user
    const file = utils.openDB();
    if (!file) 
        return res.status(404).send({ 'success': false, 'message': 'Failed to Open DB' });
    
    const foundUser = utils.findUser(file['users'], req.body.username);

    if (foundUser < 0)
        return res.status(404).send({ 'success': false, 'message': 'User not Found' });
    
    //  verify if password in body matches the password in the DB
    if (file['users'][foundUser].password != req.body.password)
        return res.status(404).send({ 'success': false, 'message': 'Wrong password' });
    
    //  sign a token for login
    const token = jwt.sign(req.body.username, "SECRET_KEY");
    file['users'][foundUser]['token'] = token;

    if (!utils.updateDB(file)) 
        return res.status(500).send({ 'success': false })

    res.status(200).send({
        'success': true,
        'token': token
    });
}

exports.logoutUser = (req, res) => {
    let token = req.header('Authorization');
    
    //  check if there is Authorization provided
    if (!token)
        return res.status(400).send({
            'success': false,
            'message': 'Missing Required Fields' 
         });
    //  cut the Bearer string before authorization token
    else token = token.slice(7)

    //  check if authorization token is valid
    if (utils.verifyToken(token, true)) 
        res.status(200).send({ 'success': true })
    else 
        res.status(401).send({
            'success': false,
            'message': 'Invalid Token Provided' 
         });
}