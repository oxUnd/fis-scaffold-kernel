var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var Scaffold = require('../../');

//var scaffold = new Scaffold({
//    type:'gitlab'
//});
//
//scaffold.download('fis-dev/fis-report-record@master', function (err, path) {
//    if (err) throw err;
//    console.log(path);
//    var files = scaffold.util.find(path);
//    scaffold.deliver(files, path + '/fis-report-record.git', './output', [
//        {
//            reg: /.*\.js$/,
//            release: '/js/$&'
//        },
//        {
//            reg: /.*\.json$/,
//            release: '/json/$&'
//        }
//    ])
//});