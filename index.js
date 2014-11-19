var path = require('path');
var glob = require('glob.js');
var lodash = require('lodash');

var log = require('./lib/log.js')();

function Scaffold (options) {
    if (!(this instanceof Scaffold)) return new Scaffold(options);
    this._options = lodash.merge({}, options);
    this.util = require('./lib/util.js');
}

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
    request.download(id, cb);
};

Scaffold.prototype.replace = function (path, map, use_prompt, callback) {
    var files = this.util.find(path);
    var that = this;
    function cb (err, result) {
        files.forEach(function (file) {
            //@TODO
            var content = that.util.fs.readFileSync(file, {
                encoding: 'utf-8'
            });
            that.map(result, function (v, k) {
                var reg = new RegExp(that.util.escapeRegExp(k), 'g');
                content = content.replace(reg, v);
            });
            //@TODO
            that.util.fs.writeFileSync(file, content, {
                encoding: 'utf-8'
            })
        });
        callback && callback(err, path);
    }
    if (use_prompt) {
        this.prompt(map, function (err, result) {
            cb(err, result);
        });
    } else {
        cb(null, map);
    }
};

Scaffold.prototype.prompt = function (schemas, cb) {
    cb = this.isFunction(cb) ? cb : function () {};
    if (!schemas) {
        //@TODO
        cb (new Error('need schemas.'));
        return;
    }
    var prompt = require('prompt');
    prompt.start();
    prompt.get(schemas, function (err, result) {
        cb(err, result);
    });
};

Scaffold.prototype._roadmap = function (roadmap) {
    var self = this;
    if (!this.isArray(roadmap)) {
        log.warn('roadmap must be a Array.');
        return [];
    }
    var map = [];
    roadmap.forEach(function (raw) {
        if (raw.reg) {
            if (self.isString(raw.reg)) {
                raw.reg = glob.make(raw.reg);
            }
            map.push({
                reg: raw.reg,
                release: (typeof raw.release == 'undefined') ? '$&' : raw.release
            });
        }
    });
    return map;
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
        var isRlease = true;
        for (var j = 0; j < map.length; j++) {
            var rule = map[j];
            file.replace(root, '').replace(rule.reg, function () {
                if (rule.release) {
                    release = _replaceDefine(arguments, rule.release);
                } else {
                    isRlease = false;
                }
                isMatch = true;
            });
            if (isMatch) break;
        }

        if (!isRlease) {
            continue;
        }

        if (!isMatch) {
            release = file.replace(root, '');
        }
        log.notice(path.join(to, release));
        this.util.move(file, path.join(to, release)); //copy
    }
};

Scaffold.prototype.release = function (id, to, replacer, roadmap, cb) {
    var that = this;
    cb = !that.isFunction(cb) ? function () {} : cb;
    that.download(id, function (err, path) {
        if (err) {
            cb(err);
            return;
        }
        function deliver(files) {
            that.deliver(files, path, to, roadmap);
        }
        //@TODO
        if (that.isFunction(replacer)) {
            replacer(deliver);
        } else {
            that.replace(path, replacer, true, function (err) {
                if (!err) {
                    deliver(that.util.find(path));
                }
                cb(err);
            });
        }
    });
};

lodash.extend(Scaffold.prototype, lodash);

module.exports = Scaffold;