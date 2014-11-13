var Scaffold = require('../../');

var scaffold = new Scaffold({
    type:'gitlab'
});

scaffold.download('fis-dev/fis-report-record@master', function (err, path) {
    if (err) throw err;
    console.log(path);
});