var _ = require('lodash');

/**
 * Get the top xxx itmes in a list based on the item count.
 * @param  {object[]}   items   item list
 * @param  {integer}    count   number of desired items
 * @return {object[]}   desired items
 */
exports.getTopItems = function(items, count) {

  count = items.length < count ? items.length : count;

  return _.chain(items)
          .sortBy('count')
          .slice(0, count)
          .value();
};
