const fs = require('fs');
const path = require('path');

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
exports.saveDB = (data) => {
    try {
        fs.writeFileSync(userDB, JSON.stringify(data, null, '   '), 'utf8');

        return true;

    } catch (err) {
        console.log(err);
        return false;
    }
}