'use strict';

const fs = require('fs');
const gulp = require('gulp');
const jade = require('gulp-jade');
const rename = require('gulp-rename');
const marked = require('marked');

gulp.task('default', () => {

  gulp.watch('./src/blog/*.md', (e) => {
    const md = marked(fs.readFileSync(e.path, 'utf8'));
    let file = e.path.split('/');
    file = file[file.length - 1];
    file = file.substring(0, file.length - 4) + '.html';

    gulp.src('./src/jade/index.jade')
      .pipe(jade({
        locals: {
          content: md
        }
      }))
      .pipe(rename(file))
      .pipe(gulp.dest('./dist/'));
  });
});
