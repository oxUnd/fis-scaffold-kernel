
var util = require('./util.js');

var exports = module.exports = function (option) {
    exports.repos = option.repos || 'https://codeload.github.com/';
    exports.postfix = '/tar.gz/';
};

function downloadFromGithub(address, version, cb, progress) {
    util.download(exports.repos + address + exports.postfix + version, {}, cb, progress);
}

function downloadFromMirror(address, version, cb, progress) {
    var parts = address.split('/');
    var ns = parts[0];
    var repos = parts[1];
    var folder = ns.substring(4);
    util.download('http://fis-cloud.bj.bcebos.com/' + folder + '/' + repos + '/' + version + '/all.tar.gz?responseContentDisposition=attachment', null, function(error) {

        if (error) {
            console.log('Download From Mirror fail, fallback to github self.');
            return downloadFromGithub(address, version, cb, progress);
        }

        return cb.apply(this, arguments);
    }, progress);

}

exports.prototype.download = function (id, cb, progress) {
    if (!id) {
        cb(new Error('must given a component ID'));
        return;
    }

    var c = id.split('@');
    if (!c[1]) {
        c[1] = 'master';
    }

    if (c[0].indexOf('fis-components/') === 0 || c[0].indexOf('fis-scaffold/') === 0) {
        return downloadFromMirror(c[0], c[1], cb, progress);
    }
    
    downloadFromGithub(c[0], c[1], cb, progress);
};
