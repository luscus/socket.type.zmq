var Socket = function Socket (socketConfig, pattern) {
  var _this = this;

  this.id     = socketConfig.id;
  this.status = true;
  this.config = socketConfig;
  this.name   = socketConfig.name;

  this.socket = pattern.open(socketConfig);

  this.messageHandler = function (data) {

    var message = {
      error: 'YOU HAVE TO IMPLEMENT AN HANDLER FOR THIS RECEIVER SOCKET',
      data: data
    };

    return message;
  }
};

Socket.prototype.close = function () {
  this.status = false;
  this.socket.close();
};

Socket.prototype.setSubscriptionPattern = function (pattern) {
  if (typeof pattern === 'string') {
    this.subscriptionPattern = pattern;

    this.socket.subscribe(pattern);
  }
};

Socket.prototype.setMessageHandler = function (handler) {
  if (typeof handler === 'function') {
    this.messageHandler = handler;
  }
};

Socket.prototype.send = function (data) {
  this.socket.send(JSON.stringify(data));
};


function instanciate (socketConfig, pattern) {
  var instance = new Socket(socketConfig, pattern);

  //instance.socket.subscribe("");
  instance.socket.on('message', function zmqMessageHandler (buffer) {

    var raw = buffer.toString(),
        data = JSON.parse(raw),
        meta = {};

    meta.bufferSize = buffer.length;
    meta.source = instance.id;

    var response = instance.messageHandler(data, meta, raw);
    response = service.Socket.formatResponse(response, data);

    if (instance.config.patternType === 'receiver') {
      // only a receiver should send a response back
      // otherwise the communication breaks
      instance.send(response);
    }
  });

  return instance;
};


module.exports = function (serviceObject) {
  service = serviceObject;

  return {
    instanciate: function (socketConfig, pattern) {
      return instanciate(socketConfig, pattern);
    }
  };
};
