const params = require('../../src/params.js');
const proxyquire = require('proxyquire');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;

const junar = proxyquire('../../src/platform/junar.js', {
  db: {
    one: () => {
      return {
        api_url: 'http://api.data.cityofsacramento.org',
        api_key: 'c2ec3f2208a504bc8c2f84ff47a26b889717cdcf'
      };
    }
  }
});

describe('Get metadata from Socrata instance', function() {

  before(function(done) {
    params.minWait = 0;
    params.maxWait = 100;
    done();
  });

  this.timeout(params.maxTimeout);

  it('It should return data from data.cityofsacramento.org', function() {
    return junar.getFullMetadata('http://data.cityofsacramento.org')
      .then(function(data) {
        expect(data.count).to.above(0);
        expect(data.tags.length).to.above(0);
        expect(data.categories.length).to.above(0);
        expect(data.organizations.length).to.equal(0);
      });
  });
});
