'use strict';

const fs = require('fs');
const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const tap = require('gulp-tap');
const lazypipe = require('lazypipe');
const del = require('del');
const marked = require('marked');

const mdTask = lazypipe()
  .pipe(tap, _tapConcat)
  .pipe(rename, { extname: '.html' });

// Concat header and footers
function _tapConcat(f, t) {
  f.contents = Buffer.concat([
    new Buffer(fs.readFileSync('./src/blog/templates/header.html', 'utf8')),
    new Buffer(marked(f.contents.toString())),
    new Buffer(fs.readFileSync('./src/blog/templates/footer.html', 'utf8')),          
  ]);
}

function _build() {
  return gulp.src('./src/blog/**/*.md', {base: './src/blog/'})
  .pipe(mdTask())
  .pipe(gulp.dest('./build/'));
}

function _clean() {
  del(['./build/**']);
}

gulp.task('default', () => {

  // Update specific markdown file
  gulp.watch('./src/blog/**/*.md', (e) => {
    console.log(`Writing ${e.path}`);

    gulp.src(e.path, { base: './src/blog/' })
      .pipe(mdTask())
      .pipe(gulp.dest('./build/'));
  });

  gulp.watch(['./src/css/**/*.scss', '!./src/css/reset.scss', '!./src/css/core.scss'], (e) => {
    console.log(`Writing ${e.path}`);

    gulp.src(e.path, { base: 'src/'})
      .pipe(sass())
      .pipe(gulp.dest('./build/'));
  });

  // Watch for any template changes
  gulp.watch('./src/blog/templates/**/*.html', (e) => {
    console.log('Template Updated: Building all md files.');
    _build();
  });
});

gulp.task('build', _build);

gulp.task('clean', _clean);
