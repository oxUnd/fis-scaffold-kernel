var _ = require('lodash');
var util = require('util');
var path = require('path');
var log = require('./lib/log.js')();

function Scaffold (options) {
    this._options = _.merge({}, options);
    _.call(this);
}

util.inherits(Scaffold, _);

Scaffold.prototype.download = function (id, cb) {
    log.notice('will download component id: ' + id);
    if (!id) {
        log.error(new Error('invalid, '));
    }
    var supports = ['github', 'gitlab', 'lights'];
    var type = this._options['type'];
    if (!~supports.indexOf(type)) {
        type = 'lights';
    }
    var request = new (require('./lib/'+type))(this._options);
    log.notice(type + ': download start');
    request.download(id, cb || function(){});
};

Scaffold.prototype.prompt = function (id) {

};

Scaffold.prototype.deliver = function (roadmap) {

};

module.exports = Scaffold;