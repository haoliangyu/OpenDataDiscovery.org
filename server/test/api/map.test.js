const rp = require('request-promise');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');

chai.use(chaiAsPromised);
const expect = chai.expect;

const params = require('../../config/params.js');

describe('API - /api/map_styles', function() {
  it('It should return an array of 5-level map colors', () => {
    return rp({
      method: 'GET',
      uri: `http://localhost:${params.port.production}/api/map_styles/5`,
      json: true
    })
    .then(body => {
      expect(body.success).to.be.true;
      expect(body.styles).to.have.lengthOf(5);

      _.forEach(body.styles, function(style) {
        expect(style.fill).to.match(/^#(?:[0-9a-f]{3}){1,2}$/i);
        expect(style.upperBound).to.be.a('number');
        expect(style.lowerBound).to.be.a('number');
      });
    });
  });
});
