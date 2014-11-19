var SS = require('..');

var s = new SS({
    type: 'lights',
    log: {
        level: 0
    }
});

s.release(
    'pc-demo',
    '/Users/shouding/Downloads/glob_t',
    [],
    [{
        reg: '**'
    }],
    function (err) {
        console.log(err);
    }
);