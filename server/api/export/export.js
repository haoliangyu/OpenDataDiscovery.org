const logger = require('log4js').getLogger('export');

const exportTo = {
  csv: require('./toCSV.js'),
  json: require('./toJSON.js')
};

exports.exportData = (req, res) => {

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
