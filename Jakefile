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
    interleave('src', {
        aliases: aliases,
        path: '.',
        after: ['uglify']
    });
});

task('build.local', function() {
    interleave('src', {
        aliases: aliasesLocal,
        path: '.',
        after: ['uglify']
    });
});