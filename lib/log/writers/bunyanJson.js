var bunyan = require('bunyan');
module.exports = function () {
  var pub = {};
  var levels = [
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace'
  ];
  var logger;
  pub.output = function ( logObject ) {
    logger = logger || bunyan.createLogger( { name: logObject.application } );
    logObject.level = levels[ logObject.level ];
    logger[ logObject.level ]( logObject.message );
  };
  pub.getEntries = function() {};
  pub.reset = function() {};
  return pub;
};
