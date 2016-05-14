var logger = require('log4js').getLogger('test_database');
var params = require('../src/params.js');
var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var database = require('../src/database.js');
var readFile = Promise.promisify(require('fs').readFile);

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var db = pgp(params.dbConnStr);
var data = {
  count: 1010,
  tags: [
    { display_name: 'test tag', count: 200 }
  ],
  categories: [
    { display_name: 'test category', count: 200 }
  ],
  organizations: [
    { display_name: 'test organization', count: 200 }
  ]
};


describe('Save Data', function() {

  this.timeout(params.maxTimeout);

  // set up the test data
  before(function(done) {
    return readFile('./test/sql/test_database_data.sql', 'utf8')
      .then(function(content) {
        return db.none(content);
      })
      .then(function() {
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('It should save test data into the database', function(done) {
    var instanceID, regionID;
    return db.one('SELECT instance_id, region_id FROM view_instance_region WHERE instance_name = $1', 'test instance')
      .then(function(result) {
        instanceID = result.instance_id;
        regionID = result.region_id;
        return database.saveData(db, instanceID, regionID, data);
      })
      .then(function() {
        return db.none('REFRESH MATERIALIZED VIEW view_instance_region_info');
      })
      .then(function() {
        return db.one('SELECT count FROM view_instance_region_info WHERE instance_id = $1 AND region_id = $2', [instanceID, regionID]);
      })
      .then(function(result) {
        return expect(result.count).to.equal(1010);
      })
      .then(function() { done(); })
      .catch(function(err) {
        logger.error(err);
        done(err);
      });
  });

  // clean up test data
  after(function(done) {
    return readFile('./test/sql/test_database_cleanup.sql', 'utf8')
      .then(function(content) {
        return db.none(content);
      })
      .finally(function() {
        done();
      });
  });

});
