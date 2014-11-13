var Log = require('../../lib/log.js');

var log = new Log(null, Log.ALL & ~Log.ERROR);

log.warn('test');
log.error(new Error('test'));