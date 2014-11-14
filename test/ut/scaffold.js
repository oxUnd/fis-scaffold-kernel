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

describe('download', function () {
    it ('download from github', function (done) {
        var s = new Scaffold({
            type: 'github'
        });
        this.timeout(5000);
        s.download('xiangshouding/github-support-doc-type', function (err, path) {
            expect(err).to.be.equal(null);
            console.log(path);
            done();
        });
    });

    it ('download from gitlab', function () {

    });
});