const Promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: Promise });
const chai = require('chai');

chai.use(require('chai-as-promised'));
const expect = chai.expect;

const database = require('../src/database.js');

describe('Save Data', function() {

  it('It should insert data into the database if it is different from the existing one.', function() {

    const db = require('./db.mock.js');

    let data = {
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

    db.one = (sql, values) => {
      let formattedSQL = pgp.as.format(sql, values);

      if (formattedSQL.indexOf('INSERT INTO instance_tag_xref') !== -1) {
        // expect to insert new tag
        expect(values[3]).to.equal('test tag');
        return Promise.resolve({ tag_id: 1, id: 1 });
      } else if (formattedSQL.indexOf('INSERT INTO instance_organization_xref') !== -1) {
        // expect to insert new organization
        expect(values[3]).to.equal('test organization');
        return Promise.resolve({ organization_id: 2, id: 2 });
      } else if (formattedSQL.indexOf('INSERT INTO instance_category_xref') !== -1) {
        // expect to insert new category
        expect(values[3]).to.equal('test category');
        return Promise.resolve({ category_id: 3, id: 3 });
      }

      return Promise.resolve({});
    };

    db.none = sql => {
      expect(sql.indexOf('1, 200')).to.not.equal(-1);
      expect(sql.indexOf('2, 200')).to.not.equal(-1);
      expect(sql.indexOf('3, 200')).to.not.equal(-1);
      expect(sql.indexOf('1, 1010')).to.not.equal(-1);
    };

    return database.saveData(db, 1, data);
  });

  it('It should update date if it is the same as the existing one.', function() {

    const db = require('./db.mock.js');

    let data = {
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

    db.oneOrNone = () => {
      let result = {
        count: 1010,
        tags:[
          { name: 'test tag', count: 200 }
        ],
        categories: [
          { name: 'test category', count: 200 }
        ],
        organizations: [
          { name: 'test organization', count: 200 }
        ]
      };

      return Promise.resolve(result);
    };

    db.any = (sql, values) => {
      let formattedSQL = pgp.as.format(sql, values);

      if (formattedSQL.indexOf('instance_tag_xref') !== -1) {
        return Promise.resolve([
          { id: 1, name: 'test tag', xref_id: 1 }
        ]);
      } else if (formattedSQL.indexOf('instance_category_xref') !== -1) {
        return Promise.resolve([
          { id: 2, name: 'test category', xref_id: 2 }
        ]);
      } else if (formattedSQL.indexOf('instance_organization_xref') !== -1) {
        return Promise.resolve([
          { id: 3, name: 'test organization', xref_id: 3 }
        ]);
      }

      return Promise.resolve([]);
    };

    db.none = sql => {
      expect(sql.indexOf('UPDATE tag_data')).to.not.equal(-1);
      expect(sql.indexOf('UPDATE category_data')).to.not.equal(-1);
      expect(sql.indexOf('UPDATE organization_data')).to.not.equal(-1);
      expect(sql.indexOf('UPDATE instance_data')).to.not.equal(-1);
    };

    return database.saveData(db, 1, data);
  });

  it('It should not update date if it is at insert only mode.', function() {

    const db = require('./db.mock.js');

    let data = {
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

    db.oneOrNone = () => {
      let result = {
        count: 1010,
        tags:[
          { name: 'test tag', count: 200 }
        ],
        categories: [
          { name: 'test category', count: 200 }
        ],
        organizations: [
          { name: 'test organization', count: 200 }
        ]
      };

      return Promise.resolve(result);
    };

    db.any = (sql, values) => {
      let formattedSQL = pgp.as.format(sql, values);

      if (formattedSQL.indexOf('instance_tag_xref') !== -1) {
        return Promise.resolve([
          { id: 1, name: 'test tag', xref_id: 1 }
        ]);
      } else if (formattedSQL.indexOf('instance_category_xref') !== -1) {
        return Promise.resolve([
          { id: 2, name: 'test category', xref_id: 2 }
        ]);
      } else if (formattedSQL.indexOf('instance_organization_xref') !== -1) {
        return Promise.resolve([
          { id: 3, name: 'test organization', xref_id: 3 }
        ]);
      }

      return Promise.resolve([]);
    };

    db.none = sql => {
      expect(sql.indexOf('UPDATE tag_data')).to.equal(-1);
      expect(sql.indexOf('UPDATE category_data')).to.equal(-1);
      expect(sql.indexOf('UPDATE organization_data')).to.equal(-1);
      expect(sql.indexOf('UPDATE instance_data')).to.equal(-1);
    };

    return database.saveData(db, 1, data, true);
  });

});
