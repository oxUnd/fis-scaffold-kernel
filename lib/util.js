var log = require('./log.js')();
var path = require('path');
var fs = require('fs');
var http = require('http');
var lodash = require('lodash');
var unzip;
var _ = {};

module.exports = _;

function getUNZIP() {
    if (!unzip) {
        unzip = require('unzip');
    }
    return unzip;
}

_.normalize = function (file) {
    return path.normalize(file); // node 0.10.*
};

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

_.hit = function (file, include, exclude) {
    return include ?
        (exclude ? include.test(file) && !exclude.test(file) : include.test(file)) :
        (exclude ? !exclude.test(file) : true);
};

_.find = function (dir, include, exclude) {
    dir = path.resolve(dir);
    if (!fs.existsSync(dir)) {
        return [];
    }
    var files = [];
    var arr = fs.readdirSync(dir);
    arr.forEach(function (file) {
        file = path.join(dir, file);
        var stat = fs.statSync(file);
        if (stat.isFile()) {
            if (_.hit(file, include, exclude)) {
                files.push(file);
            }
        } else if (stat.isDirectory()) {
            files = files.concat( _.find(file, include, exclude));
        }
    });
    return files;
};

_.mkdir = function (dir, mode) {
    if (!mode) {
        mode = 511 & (~process.umask());
    }
    if (fs.existsSync(dir)) return;
    dir.split('/').reduce(function(prev, next) {
        if (prev && !fs.existsSync(prev)) {
            fs.mkdirSync(prev, mode);
        }
        return prev + '/' + next;
    });

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, mode);
    }
};

_.write = function (file, data, append) {
    if (!fs.existsSync(file)) {
        _.mkdir(path.dirname(file));
    }
    if (append) {
        fs.appendFileSync(file, data);
    } else {
        fs.writeFileSync(file, data);
    }
};

_.isFile = function (file) {
    if (!fs.existsSync(file)) {
        return false;
    }
    var stat = fs.statSync(file);
    return stat.isFile();
};

_.copy = function (from, to, include, exclude, move) {
    from = path.resolve(_.normalize(from));
    to = path.resolve(_.normalize(to));
    if (!fs.existsSync(from)) {
        log.warn(from + ' is not exists.');
        return;
    }
    var stat = fs.statSync(from);
    if (stat.isFile()) {
        if (fs.existsSync(to) && !_.isFile(to)) {
            to = path.join(to, path.basename(from));
        }
        _.write(to, fs.readFileSync(from));
        if (move) {
            _.del(from);
        }
    } else if (stat.isDirectory()) {
        var files = _.find(from, include, exclude);
        files.forEach(function (file) {
            _.copy(file, path.join(to, file.replace(from, '')), include, exclude, move);
        });
        if (move) {
            _.del(from);
        }
    }
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