var log = require('./log.js')();
var path = require('path');
var fs = require('fs');
var http = require('http');
var unzip;
var _ = {};

module.exports = _;

function getUNZIP() {
    if (!unzip) {
        unzip = require('unzip');
    }
    return unzip;
}

_.del = function (p) {
    log.notice('_.del("' + p + '")');
    var stat = fs.statSync(p);
    if (stat.isFile() || stat.isSymbolicLink()) {
        fs.unlinkSync(p);
    } else if (stat.isDirectory()) {
        fs.readdirSync(p).forEach(function (name) {
            _.del(path.join(p, name));
        });
        fs.rmdirSync(p);
    }
    return true;
};

_.download = function (url, opt, cb) {
    var tmp_path = path.join(_.getTempDir(), _.md5(url));
    if (fs.existsSync(tmp_path)) {
        _.del(tmp_path);
    }
    var writer = fs.createWriteStream(tmp_path);
    log.notice(url);

    http.request(url, function (res) {
        var status = res.statusCode;
        res.on('data', function (c) {
            writer.write(c);
        });
        res.on('end', function () {
            if(status >= 200 && status < 300 || status === 304) {
                var zip = getUNZIP();
                var extract = zip.Extract({
                    path: tmp_path
                });
                fs.createReadStream(tmp_path).pipe(extract);
                extract
                    .on('error', cb)
                    .on('close', function () {
                        cb(null, tmp_path);
                    });
            } else {
                cb(err);
            }
        });
        res.on('error', cb);
    }).on('error', cb).end();
};

_.md5 = function (data) {
    var crypto = require('crypto');
    var md5 = crypto.createHash('md5');
    var encoding = typeof data === 'string' ? 'utf8' : 'binary';
    md5.update(data, encoding);
    return md5.digest('hex');
};

_.getTempDir = function () {
    var list = ['LOCALAPPDATA', 'APPDATA', 'HOME'];
    var tmp;
    for(var i = 0, len = list.length; i < len; i++){
        if(tmp = process.env[list[i]]){
            break;
        }
    }
    tmp = path.join(tmp, '.fis-download');

    if (!fs.existsSync(tmp)) {
        fs.mkdirSync(tmp);
    }

    return tmp;
};