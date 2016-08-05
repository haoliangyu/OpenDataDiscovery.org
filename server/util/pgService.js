var _ = require('lodash');

/**
 * PG naming style (name_it) to JS naming style (nameIt), e.g.: display_name -> displayName. As an
 * exception, id will become ID.
 * @param  {object} object data object
 * @param  {string} key    key to change
 * @return {object}        original object with replaced key
 */
exports.camelCase = function(object, key) {
  var value = object[key];
  var newKey = _.map(key.split('_'), function(name, index) {
    if (index === 0) { return name; }
    if (name === 'id') { return 'ID'; }
    return _.capitalize(name);
  }).join('');

  object[newKey] = value;
  delete object[key];

  return object;
};
