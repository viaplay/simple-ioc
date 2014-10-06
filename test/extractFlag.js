var assert = require('assert');
var extractFlag = require('../libs/utils/extractFlag');
var IGNORE = 'ignore';
var flag;

flag = extractFlag('/* ioc:ignore */');
assert.equal(flag, IGNORE);

flag = extractFlag('/** ioc:ignore **/');
assert.equal(flag, IGNORE);

flag = extractFlag('/**ioc:ignore**/');
assert.equal(flag, IGNORE);

flag = extractFlag('/**ioc:ignore**/');
assert.equal(flag, IGNORE);

flag = extractFlag('/****    ioc:ignore   */');
assert.equal(flag, IGNORE);

