var lodash = require('lodash');
var util = require('util');
var path = require('path');
var log = require('./lib/log.js')();

function Scaffold (options) {
    if (!(this instanceof Scaffold)) return new Scaffold(options);
    this._options = lodash.merge({}, options);
    this.util = require('./lib/util.js');
}


Scaffold.prototype._roadmap = function (roadmap) {
    var self = this;
    if (!this.isArray(roadmap)) {
        log.warn('roadmap must be a Array.');
        return [];
    }
    var map = {};
    roadmap.forEach(function (raw) {
        if (raw.reg && raw.release) {
            if (!self.isRegExp(raw.reg)) {
                return;
            }
            map[raw.release] = raw.reg;
        }
    });
    return map;
};

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

Scaffold.prototype.deliver = function (files, root, to, roadmap) {
    if (!this.isArray(files)) {
        return;
    }
    to = to || '';
    var map = this._roadmap(roadmap);

    function _replaceDefine(match, release) {
            return release.replace(/\$(\d+|&)/g, function (m, $1) {
                var val = match[$1 == '&' ? 0 : $1];
                return typeof val == 'undefined' ? '' : val;
            });
    }

    for (var i = 0, len = files.length; i < len; i++) {
        var file = files[i];
        var release;
        var isMatch = false;
        for (release in map) {
            if (map.hasOwnProperty(release)) {
                var reg = map[release];
                file.replace(root, '').replace(reg, function () {
                    release = _replaceDefine(arguments, release);
                    isMatch = true;
                });
                if (isMatch) break;
            }
        }
        if (!isMatch) {
            release = file.replace(root, '');
        }
        log.notice(path.join(to, release));
        this.util.move(file, path.join(to, release)); //copy
    }
};

lodash.extend(Scaffold.prototype, lodash);

module.exports = Scaffold;