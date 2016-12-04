const params = require('../../src/params.js');
const dkan = require('../../src/platform/dkan.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Get metadata from DKAN portal', function() {

  before(function(done) {
    params.minWait = 0;
    params.maxWait = 100;
    done();
  });

  this.timeout(params.maxTimeout);

  it('It should return data from healthdata.gov', function() {
    return dkan.getFullMetadata('http://www.healthdata.gov')
      .then(function(data) {
        expect(data.count).to.above(0);
        expect(data.tags.length).to.above(0);
        expect(data.organizations.length).to.above(0);
        expect(data.categories.length).to.equal(0);
      });
  });

  it('It should return data from opendata.sayada.tn/fr (API version 1.0)', function() {
    return dkan.getFullMetadata('http://opendata.sayada.tn/fr')
      .then(function(data) {
        expect(data.count).to.above(0);
        expect(data.tags.length).to.above(0);
        expect(data.organizations.length).to.above(0);
        expect(data.categories.length).to.equal(0);
      });
  });
});
