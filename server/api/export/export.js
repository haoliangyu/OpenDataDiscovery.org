const Promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: Promise });
const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');
const logger = require('log4js').getLogger('export');

const params = require('../../config/params.js');
const exportTo = {
  csv: require('./toCSV.js'),
  json: require('./toJSON.js')
};

exports.exportData = (req, res) => {
  const db = pgp(params.dbConnStr);

  let date = req.query.date ? req.query.date : getToday();
  let format = req.query.format ? req.query.format : 'json';

  exportTo[format](date, res)
    .catch(err => {
      logger.error(err);
      res.status(500).send({
        success: false,
        message: err.message
      });
    });
};

function getToday() {
  let today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}
