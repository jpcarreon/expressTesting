const utils = require("./utils");

// controllers
exports.findUser = (req,res) => {
    console.log('User:' + req.query.user);
    console.log('Password:' + req.query.password);

    res.status(200).send('OK');
}

exports.createUser = (req, res) => {
    const User = {
        username: req.body.username,
        password: req.body.password
    }

    utils.testFunction();

    res.status(201).send(User);
}