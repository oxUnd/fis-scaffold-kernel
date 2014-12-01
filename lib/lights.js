var path = require('path');

var exports = module.exports = function (option) {
    this.repos = option.repos || 'http://lights.baidu.com';
};

exports.prototype.download = function (id, cb, progress) {
    if (!id) {
        cb(new Error('must given a component ID'));
        return;
    }
    var Client = require('fis-repo-client');
    var client = new Client(this.repos);
    var util = require('./util.js');
    var cur = util.getTempDir() + '/' + util.md5(id);
    util.mkdir(cur);
    var c = id.split('@');
    if (!c[1]) {
        c[1] = 'latest'
    }
    client.install(cur, {name: c[0], version: c[1]}, {overwrite:true}, function (err, installed) {
        var p = null;
        if (!err) {
            p = installed[0].name;
        }
        cb (err, path.join(cur, p), progress);
    });
};