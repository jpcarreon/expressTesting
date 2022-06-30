// dependencies
const express = require('express')
const Router = require('./router');
const formData = require('express-form-data');

exports.start = () => {
    // initialize express app
    const App = express();
    App.use(express.json());
    App.use(express.urlencoded({ extended: false }));
    App.use(formData.parse());

    App.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE")
        res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers,Access-Control-Allow-Methods,Origin,Accept,Content-Type, Authorization")
        res.setHeader("Access-Control-Allow-Credentials","true")
        next()
    })

    // define route
    App.use('/', Router); // http://localhost:3001/

    // start server at port
    App.listen(3001, (err) => {
        if (err) { console.log(err) }
        else {console.log('Server started at port 3001')}
    })
}