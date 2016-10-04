var logger = require('log4js').getLogger('test_ckan');
var params = require('../src/params.js');
var ckan = require('../src/ckan.js');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

describe('Get Data', function() {

  before(function(done) {
    params.minWait = 0;
    params.maxWait = 100;
    params.searchLimit.default = 2;
    done();
  });

  this.timeout(params.maxTimeout);

  it('It should return data from data.gov', function(done) {
    return ckan.getFullMetadata('http://catalog.data.gov', {
      extras: { ext_bbox: [] }
    })
    .then(function(data) {
      expect(data.count).to.above(0);
    })
    .then(function() { done(); })
    .catch(function(err) {
      logger.error(err);
      done(err);
    });
  });
});
