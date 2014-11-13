var exports = module.exports = function (option) {
    this.repos = option.repos || 'http://gitlab.baidu.com/';
    this.postfix = '/repository/archive.zip?ref=';
};

exports.prototype.download = function (id, cb) {
    if (!id) {
        cb(new Error('must given a component ID'));
    }
    var util = require('./util.js');
    var c = id.split('@');
    if (!c[1]) {
        c[1] = 'master';
    }
    var url = this.repos + c[0] + this.postfix + c[1];
    util.download(url,{},cb);
};