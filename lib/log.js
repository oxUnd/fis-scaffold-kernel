var _ = require('lodash');

function Log(writer, level, prefix) {
    if (!(this instanceof Log)) return new Log(writer, level, prefix);
    this.writer = writer || process.stdout;
    this.prefix = prefix || '';
    this.NOTICE = 0x0001;
    this.WARNING = 0x0010;
    this.ERROR = 0x0100;
    this.ALL = 0x0111;
    this.level = level || process.ERROR_LEVEL || this.ALL;
}

Log.prototype.log = function (msg, level) {
    if (level == this.NOTICE) {
        this.writer.write('[NOTICE] ' + this.prefix + ' ' + msg + '\n');
    } else if (level == this.WARNING) {
        this.writer.write('[WARNING] ' + this.prefix + ' ' + msg + '\n');
    } else if (level == this.ERROR) {
        this.writer.write('[ERROR] ' + this.prefix + ' ' + msg + '\n');
    } else {
        this.writer.write('[UNKNOWN] ' + this.prefix + ' ' + msg + '\n');
    }
};

Log.prototype.notice = function (msg) {
    if (this.level & this.NOTICE) {
        this.log(msg, this.NOTICE);
    }
};

Log.prototype.warn = function (msg) {
    if (this.level & this.WARNING) {
        this.log(msg, this.WARNING);
    }
};

Log.prototype.error = function (err) {
    if (this.level & this.ERROR) {
        if (this.writer != process.stdout) {
            this.writer = process.stderr; //error message written to `stderr`
        }
        if (!(err instanceof Error)) {
            err = new Error('err');
        }
        this.log(err.message, this.ERROR);
        throw err;
    }
};

module.exports = Log;
module.exports.ALL = 0x0111;
module.exports.ERROR = 0x0100;
module.exports.WARNING = 0x0010;
module.exports.NOTICE = 0x0001;