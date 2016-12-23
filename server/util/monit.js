const logger = require('log4js').getLogger('monit');

/**
 * Update API upage.
 * @param  {object}   db    pgp database connection
 * @param  {string}   api   api name
 * @return {function}       express middleware
 */
exports.apiUsage = (db, api) => {
  return (req, res, next) => {
    let sql = `INSERT INTO api_usage (api_id) VALUES ((SELECT id FROM api WHERE name = '${api}'))`;

    db.none(sql).catch(err => {
      logger.warn(`Unable to update api usage (${api}): `, err.message);
    })
    .then(()=> {
      next();
    });
  };
};
