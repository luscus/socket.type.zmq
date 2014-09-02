var Socket = function Socket (socketConfig, pattern) {

  this.id     = socketConfig.id;
  this.status = true;
  this.config = socketConfig;
  this.name   = socketConfig.name;

  this.socket = pattern.open(socketConfig);
};

Socket.prototype.close = function () {
  this.status = false;
  this.socket.close();
};

Socket.prototype.send = function (data) {
  this.socket.send(JSON.stringify(data));
};


module.exports = function (serviceObject) {
  service = serviceObject;

  return {
    instanciate: function (socketConfig, pattern) {
      return new Socket(socketConfig, pattern);
    }
  };
};
