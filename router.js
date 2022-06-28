const { User } = require('./endpoints/index').endpoints;
const Router = require('express').Router;

// initialize router
const router = Router();

// add different routes
router.use('/user', User); // loclahost:3001/user

module.exports = router;