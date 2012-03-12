var interleave = require('interleave'),
    fs = require('fs'),
    path = require('path'),
    aliases = {
        eve: 'github://DmitryBaranovskiy/eve/'
    };

desc('build the client files');
task('default', function() {
    interleave('src/ioc.js', {
        data: JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')),
        path: '.',
        after: ['uglify']
    });
    
    interleave('src/node-wrappers', {
        aliases: aliases,
        path: '_lib-generated'
    });
});