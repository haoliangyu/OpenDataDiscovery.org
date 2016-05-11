Promise = require('promise');
var datagov = require('../datagov.js');
var logger = require('log4js').getLogger('test');
var pmongo = require('promised-mongo');
var params = require('../../config/params.js');
var crawlerParams = require('../params.js');
var _ = require('lodash');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

describe('Fetch data', function() {

  before(function() {
    // this.skip();
  });

  this.timeout(crawlerParams.maxTimeout);

  var db = pmongo(params.dbconnStr);

  it('expects to return all metadata of US from data.ogv', function() {

    return db.collection('nation').findOne({}, { name: 1, bbox: 1, _id: 1})
    .then(function(nation) {
      return datagov.fetchData(db, 'nation', nation._id, {});
    })
    .then(function(result) {
      expect(_.keys(result.tags).length).to.be.equal(crawlerParams.searchLimit.tag);
      expect(_.keys(result.groups).length).to.be.above(0);
      expect(_.keys(result.organizations).length).to.be.above(0);
    })
    .catch(function(err) {
      logger.error(err);
    });

  });

});
