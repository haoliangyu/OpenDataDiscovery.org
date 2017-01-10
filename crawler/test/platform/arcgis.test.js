const params = require('../../src/params.js');
const arcgis = require('../../src/platform/arcgis.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;


describe('Get metadata from ArcGIS Open Data instance', function() {

  before(function(done) {
    params.minWait = 0;
    params.maxWait = 100;
    done();
  });

  this.timeout(params.maxTimeout);

  it('It should return data from portal.topomat.opendata.arcgis.com', function() {
    return arcgis.getFullMetadata('http://portal.topomat.opendata.arcgis.com')
      .then(function(data) {
        expect(data.count).to.above(0);
        expect(data.tags.length).to.above(0);
        expect(data.categories.length).to.equal(0);
        expect(data.organizations.length).to.above(0);
      });
  });
});
