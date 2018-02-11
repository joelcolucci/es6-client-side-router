const browserSync = require('browser-sync').create();
const historyFallback = require('connect-history-api-fallback');
const gulp = require('gulp');
const rollup = require('rollup');
const uglify = require('rollup-plugin-uglify-es');


gulp.task('build:es', () => {
  return rollup.rollup({
    input: './lib/router.js',
    plugins: [
      // uglify()
    ]
  }).then(bundle => {
    return bundle.write({
      file: './dist/router-es.js',
      format: 'es',
      name: 'Router',
      sourcemap: true
    });
  });
});


gulp.task('build:umd', () => {
  return rollup.rollup({
    input: './lib/router.js',
    plugins: [
      // uglify()
    ]
  }).then(bundle => {
    return bundle.write({
      file: './dist/router-umd.js',
      format: 'umd',
      name: 'Router',
      sourcemap: true
    });
  });
});


gulp.task('watch', function() {
  //TODO: runSequence
  gulp.watch('./lib/*.js', ['build:es', browserSync.reload]);

  initBrowserSync('./demo-es');
});


gulp.task('demo-es', () => {
  initBrowserSync('./demo-es');
});


gulp.task('demo-umd', () => {
  initBrowserSync('./demo-umd');
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
  'build:es',
  'build:umd'
]);
