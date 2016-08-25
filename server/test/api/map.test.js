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
      .post('/api/map_styles')
      .send({ class: 5 })
      .set('Accept', 'application/json')
      .end(function(err, res) {
        if (err) {
          expect(res.body.success).to.be.false;
          expect(res.body.message).to.exist;
          done();
          return;
        }

        expect(res.body.success).to.be.true;
        expect(res.body.styles).to.have.lengthOf(5);

        _.forEach(res.body.styles, function(style) {
          expect(style.fill).to.match(/^#(?:[0-9a-f]{3}){1,2}$/i);
          expect(style.upperBound).to.be.a('number');
          expect(style.lowerBound).to.be.a('number');
          expect(style.percentTile).to.be.a('number');
        });

        done();
      });
  });
});
