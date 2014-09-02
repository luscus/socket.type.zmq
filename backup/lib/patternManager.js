var zmq = require('zmq'),
    patterns = {},
    service;



function get (socketConfig) {
  var pattern = loadPattern(socketConfig);
  pattern.type = resolveType(socketConfig);

  return pattern;
}

function getPatternName (socketConfig) {
  switch (socketConfig.pattern) {
    case 'pub':
    case 'pull':
    case 'sub':
    case 'push':
    case 'rep':
    case 'req':
      return 'default';
  }
}

function loadPattern (socketConfig) {
  var name = getPatternName(socketConfig);

  if (!patterns[name]) {
    patterns[name] = require('./patterns/' + name)(service);
  }

  return patterns[name];
}

function resolveType (socketConfig) {
  switch (socketConfig.pattern.toLowerCase()) {
    case 'push':
    case 'pub':
      return 'sender';

    case 'pull':
    case 'sub':
      return 'receiver';

    case 'rep':
    case 'req':
      return 'bidirectional';
  }
}


module.exports = function (serviceObject) {
  service = serviceObject;

  return {
    get: function (socketConfig) {
      return get(socketConfig);
    }
  };
};
