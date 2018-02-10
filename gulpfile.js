const browserSync = require('browser-sync').create();
const historyFallback = require('connect-history-api-fallback');
const gulp = require('gulp');
const rollup = require('rollup');
const uglify = require('rollup-plugin-uglify-es');


gulp.task('js', function() {
  return gulp.src([
    './lib/*.js'
  ])
  .pipe(gulp.dest('./dist/'));
});


gulp.task('build', () => {
  return rollup.rollup({
    input: './lib/router.js',
    plugins: [
      uglify()
    ]
  }).then(bundle => {
    return bundle.write({
      file: './dist/router.bundle.js',
      format: 'umd',
      name: 'Router',
      sourcemap: true
    });
  });
});


gulp.task('watch', function() {
  gulp.watch('./lib/*.js', ['js', browserSync.reload]);

  initBrowserSync('./demo');
});


gulp.task('demo', () => {
  initBrowserSync('./demo');
});


gulp.task('demo-bundle', () => {
  initBrowserSync('./demo-bundle');
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
  'js',
  'build'
]);
