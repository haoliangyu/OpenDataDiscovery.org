var _ = require('lodash');
var redis = require('redis');
var logger = require('log4js').getLogger('tile-server-util');

/**
 * Get the top xxx itmes in a list based on the item count.
 * @param  {object[]}   items   item list
 * @param  {integer}    count   number of desired items
 * @return {object[]}   desired items
 */
exports.getTopItems = function(items, count) {

  count = items.length < count ? items.length : count;

  return _.chain(items)
          .sortBy('count', 'desc')
          .slice(0, count)
          .value();
};

/**
 * Get week + day time in second
 * @param  {integer} week week count
 * @param  {integer} day  day count
 * @return {integer}      second count
 */
exports.getCacheTime = function(week, day) {
  week = _.isInteger(week) && week > 0 ? week : 0;
  day = _.isInteger(day) && day > 0 ? day : 0;

  return 604800000 * week + 86400000 * day;
};

/**
 * Get the Redis caching key
 * @param  {object} tile TileSplash tile layer
 * @return {string}      cache key
 */
exports.getCacheKey = function(tile) {
  return 'odd-vt/' + tile.layer + '/' + tile.z + '/' + tile.x + '/' + tile.z;
};

/**
 * Clear all tile cache
 * @return {undefined}
 */
exports.clearCache = function() {
  // source from: https://github.com/uber-archive/redis-delete-pattern
  var client = redis.createClient();

  client.keys('odd-vt/*', function handleKeys (err, keys) {
    if (err) {
      logger.error(err);
      return;
    }

    if (keys.length) {
      logger.info('Clearing ' + keys.length + ' keys...');
      client.del(keys);
    }

    client.end(true);
    process.exit();
  });
};
