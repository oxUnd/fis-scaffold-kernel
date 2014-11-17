
var exports = module.exports = function (option) {
    this.repos = option.repos || 'https://codeload.github.com/';
    this.postfix = '/zip/';
};

exports.prototype.download = function (id, cb) {
    if (!id) {
        cb(new Error('must given a component ID'));
        return;
    }
    var util = require('./util.js');
    var c = id.split('@');
    if (!c[1]) {
        c[1] = 'master';
    }
    var url = this.repos + c[0] + this.postfix + c[1];
    var subpath = this.getPath(id);
    util.download(url,{},function (err, path) {
        if (!err) {
            path = path + '/' + subpath;
        }
        cb(err, path);
    });
};

exports.prototype.getPath = function (id) {
    var c = id.split('@');
    if (!c[1]) {
        c[1] = 'master'
    }
    var r = c[0].substr(c[0].lastIndexOf('/')+1);
    return r + '-' + c[1];
};