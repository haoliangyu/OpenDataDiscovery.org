const Promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: Promise });
const core = require('./util/core.js');

let db, dbConnStr;

if (core.existSync('./config/credential.js')) {
  dbConnStr = require('./config/params.js').dbConnStr;
} else {
  dbConnStr = require('./config/credential.js').dbConnStr;
}

/**
 * Initialize database connection.
 * @return {object}   pgp database connection
 */
exports.initialize = () => {
  db = pgp(dbConnStr);
  return db;
};

/**
 * Get database connection.
 * @return {object}   pgp database connection
 */
exports.getConnection = () => {
  return db || exports.initialize();
};
