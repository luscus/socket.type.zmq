var Socket = function Socket (socketConfig, pattern) {
  this._this = this;

  this.id      = socketConfig.id;
  this.pattern = pattern;
  this.status  = true;
  this.config  = socketConfig;
  this.name    = socketConfig.name;

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

    this.socket.on('message', function zmqMessageHandler (buffer) {
      var data = JSON.parse(buffer.toString());
      handler(data);
    });
  }
};

function instanciate (socketConfig, pattern) {
  var instance = new Socket(socketConfig, pattern);

  instance.socket.subscribe("");
  instance.socket.on('message', function zmqMessageHandler (buffer) {

    var raw = buffer.toString(),
        data = JSON.parse(raw),
        meta = {};

    meta.bufferSize = buffer.length;
    meta.source = instance.id;

    instance.messageHandler(data, meta, raw);
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
