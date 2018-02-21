const browserSync = require('browser-sync').create();
const historyFallback = require('connect-history-api-fallback');
const gulp = require('gulp');
const rollup = require('rollup');


gulp.task('watch', function() {
  gulp.watch('./lib/*.js', ['build', browserSync.reload]);

  initBrowserSync('./demo');
});


gulp.task('build', () => {
  return rollup.rollup({
    input: './lib/router.js'
  }).then((bundle) => {
    return bundle.write({
      file: './dist/router.js',
      format: 'es',
      name: 'Router',
      sourcemap: true
    });
  });
});


function initBrowserSync(baseDir) {
  browserSync.init({
    server: {
      baseDir: baseDir,
      middleware: [
        historyFallback()
      ]
    },
    serveStatic: [{
      route: '/assets',
      dir: 'dist'
    }],
    port: 5000
  });
}


gulp.task('default', [
  'build'
]);
