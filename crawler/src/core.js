const _ = require('lodash');
const Promise = require('bluebird');
const params = require('./params.js');

exports.gentleRequest = request => {
  return Promise.delay(_.random(params.minWait, params.maxWait))
                .then(() => {
                  return request;
                })
                .timeout(params.maxTimeout);
};
