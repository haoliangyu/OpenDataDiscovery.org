var request = require('supertest');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var _ = require('lodash');

chai.use(chaiAsPromised);
var expect = chai.expect;

var params = require('../../config/params.js');

describe('API - /api/map_styles', function() {
  it('It should return an array of 5-level map colors', function(done) {
    request('localhost:' + params.port.development)
      .get('/api/map_styles/5')
      .expect(200)
      .end(function(err, res) {
        expect(res.body.success).to.be.true;
        expect(res.body.styles).to.have.lengthOf(5);

        _.forEach(res.body.styles, function(style) {
          expect(style.fill).to.match(/^#(?:[0-9a-f]{3}){1,2}$/i);
          expect(style.upperBound).to.be.a('number');
          expect(style.lowerBound).to.be.a('number');
        });

        done();
      });
  });
});
