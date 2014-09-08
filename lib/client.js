var urlLib = require('url'),
    tools = require('./tools'),
    zmq = require('zmq');

// ZMQ event handlers
function onConnect () {
  this.parent.emit('connected', this.url, this.parent);
}

function onDisconnect () {
  this.parent.emit('disconnected', this.url, this.parent);
}

function onError (error) {
  this.parent.emit('error', error, this.url, this.parent);
}

function onMessage (buffer) {
  this.parent.emit('message', JSON.parse(buffer.toString()), this.url);
}


var zmqClientTemplate = {
  connect: function (target) {
    var url;

    switch (typeof target) {
      case 'string':
        var parts = urlLib.parse(target);

        if (parts.hostname) {
          url = target;
        }
        break;
      case 'object':
        break;
    }

    this.connections[url] = new zmq.socket(tools.resolvePattern(this.config));
    this.initStats(url);

    this.connections[url].monitor(500);

    this.connections[url].on('error', onError);
    this.connections[url].on('connect', onConnect);
    this.connections[url].on('disconnect', onDisconnect);
    this.connections[url].on('message', onMessage);

    this.connections[url].connect(url);
  },

  send: function (data) {
    if (this.cluster.length) {
      var target = this.cluster[Math.floor(Math.random()*this.cluster.length)];

      this.updateStats(target, data);

      this.connections[target].send(JSON.stringify(data));
    }
  },

  getQueue: function (url) {
    return this.connections[url]._outgoing;
  },

  close: function (url) {
    return this.connections[url].close();
  }
};


module.exports = zmqClientTemplate;
