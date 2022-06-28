const fs = require('fs');
const path = require('path');

const userDB = path.join(__dirname, '..', 'data', 'user.json');

exports.openDB = () => {
    try {
        var data = fs.readFileSync(userDB, 'utf8');

        return JSON.parse(data);

    } catch (err) {
        console.log(err);
        return null;
    }
}

exports.saveDB = (data) => {
    try {
        fs.writeFileSync(userDB, JSON.stringify(data, null, '   '), 'utf8');

        return true;
        
    } catch (err) {
        console.log(err);
        return false;
    }
}