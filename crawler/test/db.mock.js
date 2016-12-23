/**
 * Mock pg-promise functions for unit testing
 */

const Promise = require('bluebird');

module.exports = {
  none: none,
  any: any,
  one: one,
  oneOrNone: none,
  tx: tx,
  sequence: sequence,
  batch: Promise.all
};

function one() {
  return Promise.resolve({});
}

function any() {
  return Promise.resolve([]);
}

function none() {
  return Promise.resolve();
}

function tx(fn) {
  return fn(module.exports);
}

function sequence(fn) {
  let results = [];

  for (let i = 0;; i++) {
    let result = fn(i);

    if (!result) { break; }

    results.push(result);
  }

  return Promise.all(results);
}
