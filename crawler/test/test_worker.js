var logger = require('log4js').getLogger('test');
var _ = require('lodash');
var params = require('../src/params.js');
var worker = require('../src/worker.js');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

describe('Get Data', function() {

  before(function() {
    params.minWait = 0;
    params.maxWait = 100;
  });

  this.timeout(params.maxTimeout);

  it('It should return data from data.gov', function() {
    return worker.getRegionData('http://catalog.data.gov', {
      extras: { ext_bbox: [] }
    })
    .then(function(data) {
      expect(data.count).to.above(0);
    })
    .catch(function(err) {
      logger.error(err);
    });
  });

  it('It should return data from africa open data', function() {
    return worker.getRegionData('https://africaopendata.org', {
      extras: { ext_bbox: [] }
    })
    .then(function(data) {
      expect(data.count).to.above(0);
    })
    .catch(function(err) {
      logger.error(err);
    });
  });
});
