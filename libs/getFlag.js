var fs = require('fs');
var EOL = require('os').EOL;
var extractFlag = require('./utils/extractFlag');
var LENGTH = 80;

module.exports = function getFlag(path, callback) {
  var fd = fs.openSync(path, 'r');
  var buf = new Buffer(LENGTH);
  var lines;

  fs.readSync(fd, buf, 0, LENGTH);
  lines = (buf.toString() || '').split(EOL);
  fs.close(fd);

  return lines.length ? extractFlag(lines[0]) : undefined;
};
