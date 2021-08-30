const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const server = require('browser-sync').create();
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const del = require('del');
const fileinclude = require('gulp-file-include');
const htmlbeautify = require('gulp-html-beautify');
const gcmq = require('gulp-group-css-media-queries');

const html = () => {
  return gulp.src(['source/html/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@root',
    }))
    .pipe(htmlbeautify({
      'indent_size': 2,
      'preserve_newlines': true,
      'max_preserve_newlines': 0,
      'wrap_attributes': 'auto',
    }))
    .pipe(gulp.dest('build'));
};

const css = () => {
  return gulp.src('source/sass/style.scss')
      .pipe(plumber())
      .pipe(sourcemap.init())
      .pipe(sass())
      .pipe(postcss([autoprefixer()]))
      .pipe(gcmq())
      .pipe(gulp.dest('build/css'))
      .pipe(csso())
      .pipe(rename('style.min.css'))
      .pipe(sourcemap.write('.'))
      .pipe(gulp.dest('build/css'))
      .pipe(server.stream());
};

const copy = () => {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/img/**',
  ], {
    base: 'source',
  })
  .pipe(gulp.dest('build'));
};

const syncserver = () => {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch('source/html/**/*.html', gulp.series(html, refresh));
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series(css));
  gulp.watch('source/img/**', gulp.series(copy, html, refresh));
};

const refresh = (done) => {
  server.reload();
  done();
};

const clean = () => {
  return del('build');
};

const build = gulp.series(clean, copy, css, html);

const start = gulp.series(build, syncserver);

exports.build = build;
exports.start = start;
