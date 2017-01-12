const params = require('../../src/params.js');
const geonode = require('../../src/platform/geonode.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Get metadata from GeoNode instance', function() {

  before(function(done) {
    params.minWait = 0;
    params.maxWait = 100;
    done();
  });

  this.timeout(params.maxTimeout);

  it('It should return data from mapstory.org', function() {
    return geonode.getFullMetadata('https://mapstory.org')
      .then(function(data) {
        expect(data.count).to.above(0);
        expect(data.tags.length).to.equal(0);
        expect(data.categories.length).to.above(0);
        expect(data.organizations.length).to.equal(0);
      });
  });
});
