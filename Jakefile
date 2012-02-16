var interleave = require('interleave'),
    aliases = {
        eve: 'github://DmitryBaranovskiy/eve/',
        underscore: 'github://documentcloud/underscore/',
        matchme: 'github://DamonOehlman/matchme/'
    },
    aliasesLocal = {
        eve: '/development/projects/github/eve/',
        underscore: '/development/projects/github/underscore/',
        matchme: '/development/projects/DamonOehlman/matchme/'
    };

desc('build the client files');
task('default', function() {
    interleave('src/ioc.js', {
        aliases: aliases,
        path: '.',
        after: ['uglify']
    });
    
    interleave('src/node-wrappers', {
        aliases: aliases,
        path: '_lib-generated'
    });
});

task('build.local', function() {
    aliases = aliasesLocal;
    
    jake.Task['default'].invoke();
});