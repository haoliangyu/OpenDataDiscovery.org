var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

var pgUtil = require('../../util/pg.js');

describe('pgUtil.toCamelCase()', function() {

  var testObject = {
    'name_str': 'test',
    'name_id': 'test'
  };

  it('It should return a camelCase-named object', function(done) {
    var value = testObject.name_str;
    pgUtil.camelCase(testObject, 'name_str');
    expect(testObject.nameStr).to.equal(value);
    done();
  });

  it('It should return ID, not Id', function(done) {
    var value = testObject.name_id;
    pgUtil.camelCase(testObject, 'name_id');
    expect(testObject.nameID).to.equal(value);
    done();
  });
});
