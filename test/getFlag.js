var assert = require('assert');
var path = require('path');
var getFlag = require('../libs/getFlag');
var flag;

var file = function (fileName) {
  return path.join(__dirname, fileName);
};

assert.equal(getFlag(file('./data/ignore.js')), 'ignore');
assert.equal(getFlag(file('./data/noflag.js')), undefined);

