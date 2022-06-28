// dependencies
const express = require('express')
const Router = require('./router');
const formData = require('express-form-data');

// initialize express app
const App = express();
App.use(express.json());
App.use(express.urlencoded({ extended: false }));
App.use(formData.parse());

exports.start = () => {
    // define route
    App.use('/', Router); // http://localhost:3001/

    // start server at port
    App.listen(3001, (err) => {
        if (err) { console.log(err) }
        else {console.log('Server started at port 3001')}
    })
}