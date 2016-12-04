const params = require('../../src/params.js');
const socrata = require('../../src/platform/socrata.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Get metadata from Socrata instance', function() {

  before(function(done) {
    params.minWait = 0;
    params.maxWait = 100;
    done();
  });

  this.timeout(params.maxTimeout);

  it('It should return data from data.seattle.gov', function() {
    return socrata.getFullMetadata('data.seattle.gov')
      .then(function(data) {
        expect(data.count).to.above(0);
        expect(data.tags.length).to.above(0);
        expect(data.categories.length).to.above(0);
        expect(data.organizations.length).to.equal(0);
      });
  });
});
