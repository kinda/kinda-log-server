'use strict';

let _ = require('lodash');
let parseBody = require('co-body');
let KindaObject = require('kinda-object');
let KindaLog = require('kinda-log');

let KindaLogServer = KindaObject.extend('KindaLogServer', function() {
  this.creator = function() {
    this.log = this.create(KindaLog);
  };

  this.getMiddleware = function(prefix) {
    if (!prefix) prefix = '';
    if (_.endsWith(prefix, '/')) prefix = prefix.slice(0, -1);
    let that = this;
    return function *(next) {
      let path = this.path;

      if (prefix) {
        if (!_.startsWith(path, prefix)) return yield next;
        path = path.substr(prefix.length);
      }

      if (!(this.method === 'POST' && path === '/logs')) return yield next;

      let body = yield parseBody.json(this);
      that.log.dispatch(body.app, body.host, body.level, body.message);
      this.status = 204;
      this.logLevel = 'silence';
    };
  };
});

module.exports = KindaLogServer;
