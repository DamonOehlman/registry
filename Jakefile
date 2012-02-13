var interleave = require('interleave');

desc('build the client files');
task('default', function() {
    interleave('src', {
        after: ['uglify']
    });
});