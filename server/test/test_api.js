var request = require('supertest');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

var params = require('../config/params.js');

describe('API - /api/info/instances', function() {
  it('It should return an array of instance information', function(done) {
    request('localhost:' + params.port.development)
      .get('/api/info/instances')
      .end(function(err, res) {
        if (err) {
          expect(res.body.success).to.be.false;
          expect(res.body.message).to.exist;
          done();
          return;
        }

        expect(res.body.success).to.be.true;
        expect(res.body.instances.length).to.be.above(0);
        done();
      });
  });
});

describe('API - /api/info/region_levels', function() {
  it('It should return an array of region levels', function(done) {
    request('localhost:' + params.port.development)
      .get('/api/info/region_levels')
      .end(function(err, res) {
        if (err) {
          expect(res.body.success).to.be.false;
          expect(res.body.message).to.exist;
          done();
          return;
        }

        expect(res.body.success).to.be.true;
        expect(res.body.levels).to.have.lengthOf(5);
        done();
      });
  });
});
