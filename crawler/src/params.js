exports.dbConnStr = 'postgres://postgresd@localhost:5432/odd';

exports.searchLimit = {
  tag: 500,
  organization: 500,
  group: 18,
  default: 2
};

exports.minWait = 5000;

exports.maxWait = 30000;

exports.maxTimeout = 150000;
