const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const { start } = require('../app');
require('dotenv').config();

chai.use(chaiHttp);
start();

describe('Regular Employee', () => {
    describe('[GET] /eps/employee/{empid}', () => {
        it('GET someone else (404)', (done) => {
            chai.request('localhost:3001')
                .get('/user')
                .end((err, response) => {
                    assert.equal(response.statusCode, 404);
                    assert.isFalse(response.body.success);

                    done();
                });
        });
    });
    
});
