const { UserController } = require('../controllers/index').controllers;
const Router = require('express').Router;

// initialize User router
const User = Router();

// access controllers
User.get('/', UserController.findUser); // localhost:3001/user/
User.post('/', UserController.createUser);
User.put('/', UserController.updateUser);

module.exports = User;