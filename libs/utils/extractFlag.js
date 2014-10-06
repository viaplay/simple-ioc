var RE_FLAG = /^\/\*+\s*ioc\:(\w+)\s*\*+\//i;

var knownFlags = {
  'ignore':   'ignore',
  'noresolve': 'noresolve'
};

module.exports = function (line) {
  var match = line.match(RE_FLAG);
  if (!match) return;
  var flag = match[1];
  return knownFlags[flag];
}
