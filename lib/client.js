var urlLib = require('url'),
    tools = require('./tools'),
    zmq = require('zmq');


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
  this.parent.emit('message', JSON.parse(buffer.toString()), this.url, this.parent);
}

var zmqClient = {
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
    this.connections[url].url = url;
    this.connections[url].parent = this;

    this.connections[url].stats = {};
    this.connections[url].stats.startTime = new Date().getTime();
    this.connections[url].stats.requestCount = 0;
    this.connections[url].stats.throughputAvg = 0;
    this.connections[url].stats.hangingCycles = 0;

    this.connections[url].monitor(500);

    this.connections[url].on('error', onError);
    this.connections[url].on('connect', onConnect);
    this.connections[url].on('disconnect', onDisconnect);
    this.connections[url].on('message', onMessage);

    this.connections[url].connect(url);
  },

  send: function (data) {
    if (this.cluster.length) {
      var target = this.cluster[Math.floor(Math.random()*this.cluster.length)],
          now = new Date().getTime();

      this.connections[target].stats.requestCount += 1;

      var uptime = now - this.connections[target].stats.startTime,
          pendingRate = (this.connections[target].stats.requestCount + this.connections[target]._outgoing.length * 10 ) / uptime,
          throughput = this.connections[target].stats.requestCount / uptime;

      if (! this.connections[target].stats.throughputAvg) this.connections[target].stats.throughputAvg = throughput;

      this.connections[target].stats.throughputAvg = (this.connections[target].stats.throughputAvg + throughput) / 2;

      this.connections[target].stats.pendingOverflow = (pendingRate > this.connections[target].stats.throughputAvg * 2);

      if (this.connections[target].stats.pendingOverflow) {
        this.connections[target].stats.hangingCycles += 1;
        if (!this.connections[target].stats.maxHangingCycles) this.connections[target].stats.maxHangingCycles = this.connections[target]._outgoing.length + 10;
        this.connections[target].stats.pendingOverflowGrowing = this.connections[target].stats.oldpendingRate <= pendingRate;
        this.connections[target].stats.oldpendingRate = pendingRate;
      }
      else {
        this.connections[target].stats.hangingCycles = 0;
        this.connections[target].stats.maxHangingCycles = 0;
        this.connections[target].stats.oldpendingRate = 0;
        this.connections[target].stats.pendingOverflowGrowing = false;
      }

      this.connections[target].stats.lastRequest = data;

      this.connections[target].send(JSON.stringify(data));

      if (this.connections[target].pendingOverflow && this.connections[target].pendingOverflowGrowing && this.connections[target].hangingCycles > this.connections[target].maxHangingCycles) {
        this.emit('hanging', target, this.parent);
      }
    }
  },

  getQueue: function (url) {
    return this.connections[url]._outgoing;
  },

  close: function (url) {
    return this.connections[url].close();
  }
};


module.exports = zmqClient;
