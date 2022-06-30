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
    
    // read DB content
    const file = utils.openDB();
    if (!file) 
        return res.status(404).send({ 'success': false, 'message': 'Database error' });

    // retrieve user index based on given id
    const index = utils.findUser(file['users'], id);
    
    // check if retrieved valid index
    if (index == -1)
        return res.status(404).send({ 'success': false, 'message': 'User not found' });

    return res.status(200).send({ 'success': true, 'data': file['users'][index]});

}

/**
 * [POST]
 *  - Creates a user
 */
exports.createUser = (req, res) => {
    // check body values
    if(req.body.username == null) return res.status(400).send({ 'success': false, 'message': 'Missing field/s' });
    if(req.body.password == null) return res.status(400).send({ 'success': false, 'message': 'Missing field/s' });
    if(req.body.email == null) return res.status(400).send({ 'success': false, 'message': 'Missing field/s' });
    if(req.body.firstName == null) return res.status(400).send({ 'success': false, 'message': 'Missing field/s' });
    if(req.body.lastName == null) return res.status(400).send({ 'success': false, 'message': 'Missing field/s' });

    const newUser = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        token: "",
    }

    const file = utils.openDB();
    if (!file) 
        return res.status(404).send({ 'success': false, 'message': 'Database error' });
    
    //  look through users for duplicates
    if (utils.findUser(file['users'], newUser.username) >= 0) {
        console.log('Duplicate User!');
        return res.status(409).send({ 'success': false, 'message': 'Duplicate user credentials' });
    }
    
    //  add new user
    file['users'].push(newUser);

    if (!utils.updateDB(file))
        return res.status(404).send({ 'success': false, 'message': 'Database error' });
    
    res.status(201).send({ 'success': true });
}

/**
 * [PUT]
 * - Updates User entity fields
 */
exports.updateUser = (req, res) => {

    var id = req.body.username;
    let token = req.header('Authorization');

    // verify user token
    if (!token || !id) 
        return res.status(400).send({
            'success': false,
            'message': 'Missing Required Fields' 
        });
    else token = token.slice(7);

    if (!utils.verifyToken(token))
        return res.status(401).send({
            'success': false,
            'message': 'Invalid Token Provided' 
        });

    const file = utils.openDB();
    if (!file) 
        return res.status(404).send({ 'success': false, 'message': 'Database error' });

    const index = utils.findUser(file['users'], id);
    
    // check if retrieved valid index
    if (index == -1)
        return res.status(404).send({ 'success': false, 'message': 'User not found' });

    // update fields
    file['users'][index].password = req.body.password ? req.body.password : file['users'][index].password;
    file['users'][index].email = req.body.email ? req.body.email : file['users'][index].email;
    file['users'][index].firstName = req.body.firstName ? req.body.firstName : file['users'][index].firstName;
    file['users'][index].lastName = req.body.lastName ? req.body.lastName : file['users'][index].lastName;
    
    // save changes to DB
    if (!utils.updateDB(file))
        return res.status(404).send({ 'success': false, 'message': 'Database error' });
    
    res.status(201).send({ 'success': true });
}

exports.deleteUser = (req, res) => {
    let token = req.header('Authorization');

    if (!token || !req.query.username) 
        return res.status(400).send({
            'success': false,
            'message': 'Missing Required Fields' 
        });
    else token = token.slice(7);

    if (!utils.verifyToken(token))
        return res.status(401).send({
            'success': false,
            'message': 'Invalid Token Provided' 
        });
    
    if (req.query.username == jwt.verify(token, 'SECRET_KEY'))
        return res.status(403).send({
            'success': false,
            'message': 'Cannot Delete User' 
        });
    
    //  open the DB to look for the user to delete
    const file = utils.openDB();
    if (!file) 
        return res.status(404).send({ 'success': false, 'message': 'Failed to Open DB' });
    
    const foundUser = utils.findUser(file['users'], req.query.username);

    if (foundUser < 0)
        return res.status(404).send({ 'success': false, 'message': 'User not Found' });

    file['users'].splice(foundUser, 1);

    if (!utils.updateDB(file))
        return res.status(404).send({ 'success': false, 'message': 'Database error' });
    
    res.status(200).send({ 'success': true });
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