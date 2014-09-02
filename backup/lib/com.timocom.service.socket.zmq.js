(function() {

  var receiver,
      sender,
      bidirectional,
      patternManager,
      service;


  function instanciate (socketConfig) {

    if (!socketConfig.protocol) {
      throw new Error('You have to specify a "protocol" property for ZeroMQ Sockets');
    }

    var pattern = patternManager.get(socketConfig);

    switch (pattern.type) {
      case 'sender':
        return sender.instanciate(socketConfig, pattern);

      case 'receiver':
        return receiver.instanciate(socketConfig, pattern);

      case 'bidirectional':
        return bidirectional.instanciate(socketConfig, pattern);
    }
  };



  function getUrl (socketConfig) {

    if (!socketConfig.protocol) {
      throw new Error('You have to specify a "protocol" property for ZeroMQ Sockets');
    }

    var pattern = patternManager.get(socketConfig);

    return pattern.resolveSocketUrl(socketConfig);
  }

  module.exports = function (serviceObject) {
    service = serviceObject;
    patternManager = require('./patternManager')(service);

    receiver = require('./types/receiver')(service);
    sender = require('./types/sender')(service);
    bidirectional = require('./types/bidirectional')(service);

    return {
      instanciate: function (socketConfig) {
        return instanciate(socketConfig);
      },
      getUrl: function (socketConfig) {
        return getUrl(socketConfig);
      }
    };
  };

}).call(this);
