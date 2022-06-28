const fs = require('fs');
const path = require('path');

const userDB = path.join(__dirname, '..', 'data', 'user.json');
const utils = require('./utils');

// controllers
exports.findUser = (req,res) => {
    console.log('User:' + req.query.user);
    console.log('Password:' + req.query.password);

    res.status(200).send('OK');
}

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