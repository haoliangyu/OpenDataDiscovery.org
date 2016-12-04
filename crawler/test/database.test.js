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
  before(function() {
    return readFile('./crawler/test/sql/test_database_data.sql', 'utf8')
      .then(function(content) {
        return db.none(content);
      });
  });

  it('It should save test data into the database', function() {
    let instanceID;

    return db.one('SELECT instance_id FROM view_instance_region WHERE instance_name = $1', 'test instance')
      .then(function(result) {
        instanceID = result.instance_id;
        return database.saveData(db, instanceID, data);
      })
      .then(function() {
        var sql = [
          'SELECT count FROM instance_data WHERE instance_id = $1',
          'ORDER BY update_date LIMIT 1'
        ].join(' ');

        return db.one(sql, instanceID);
      })
      .then(function(result) {
        return expect(result.count).to.equal(1010);
      });
  });

  // clean up test data
  after(function() {
    return readFile('./crawler/test/sql/test_database_cleanup.sql', 'utf8')
      .then(function(content) {
        return db.none(content);
      })
  });

});
