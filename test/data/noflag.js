// My dummy module
module.exports = function (multiexports) {
  return function () {
    return 'chupacabra ' + multiexports.foo;
  }
};
