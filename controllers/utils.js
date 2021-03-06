const fs = require('fs');
const path = require('path');
const jwt = require("jsonwebtoken");

const userDB = path.join(__dirname, '..', 'data', 'user.json');

/**
 * Opens a json file acting as dummy DB
 * Returns the parsed json object
 * @return {json} object containing users
 */
exports.openDB = () => {
    try {
        var data = fs.readFileSync(userDB, 'utf8');

        return JSON.parse(data);

    } catch (err) {
        console.log(err);
        return null;
    }
}

/**
 * Writes to json file acting as dummy DB
 * Returns success status
 * @param {json} data object containing json to write on file
 * @return {boolean} indicator if save succeeds
 */
exports.updateDB = (data) => {
    try {
        fs.writeFileSync(userDB, JSON.stringify(data, null, '   '), 'utf8');

        return true;

    } catch (err) {
        console.log(err);
        return false;
    }
}

/**
 * Looks through array for an object with matching username
 * Returns index of found value
 * @param {array} db array of users
 * @param {string} username username to find
 * @return {int} index of value; -1 if not in array
 */
exports.findUser = (db, username) => {
    var found = db.find((currUser) => {
        if (currUser.username == username) return currUser;
    })

    return db.indexOf(found);
}


/**
 * Verify given token if it is valid
 * Returns true/false
 * @param {string} token token to verify
 * @param {boolean} logout if verification is done to logout (default: false)
 * @return {boolean} condition if token is valid or not
 */
exports.verifyToken = (token, logout = false) => {
    try {
        //  verify token
        const user = jwt.verify(token, 'SECRET_KEY');

        //  look for user in DB
        var file = this.openDB();
        var found = this.findUser(file['users'], user);

    } catch (err) {
        console.log(err);
        return false;
    }
    
    //  User is not found or token is invalid
    if (found < 0 || file['users'][found].token != token)
        return false;
    else {
        //  user logout; wipe token field in DB
        if (logout) {
            file['users'][found].token = '';
            this.updateDB(file);
        }
            
        return true;
    }
        

}