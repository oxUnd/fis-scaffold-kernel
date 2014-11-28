var SS = require('..');

var s = new SS({
    type: 'github',
    log: {
    }
});

s.release(
    'fis-components/sample@v0.0.1',
    '/Users/shouding/Downloads/glob_t',
    [],
    [{
        reg: '**'
    }],
    function (err) {
        console.log(err);
    }
);