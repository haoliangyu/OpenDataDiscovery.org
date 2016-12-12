const Promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: Promise });
const params = require('./config/params.js');

let db;

/**
 * Initialize database connection.
 * @return {object}   pgp database connection
 */
exports.initialize = () => {
  db = pgp(params.dbConnStr);
  return db;
};

/**
 * Get database connection.
 * @return {object}   pgp database connection
 */
exports.getConnection = () => {
  return db || exports.initialize();
};
