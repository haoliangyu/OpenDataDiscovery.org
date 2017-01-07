const params = require('../../src/params.js');
const ckan = require('../../src/platform/ckan.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Get metadata from CKAN instance', function() {

  before(function(done) {
    params.minWait = 0;
    params.maxWait = 100;
    params.searchLimit.default = 2;
    done();
  });

  this.timeout(params.maxTimeout);

  it('It should return data from data.gov', function() {
    return ckan.getFullMetadata('https://catalog.data.gov', {
      extras: { ext_bbox: [] }
    })
    .then(function(data) {
      expect(data.count).to.above(0);
    });
  });
});
