'use strict';

const fs = require('fs');
const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const tap = require('gulp-tap');
const lazypipe = require('lazypipe');
const del = require('del');
const marked = require('marked');

gulp.task('default', gulp.parallel(watchMd, watchTemplate));
gulp.task('build', gulp.series(clean, buildAllPages, buildIndex));
gulp.task(clean);

function watchMd() {
  return _watch('./src/blog/**/*.md', buildPage);
}

function watchTemplate() {
  return _watch('./src/blog/templates/**/*.html', buildAllPages);
}

function buildPage(path) {
  return gulp.src(path, { base: './src/' })
    .pipe(mdTask())
    .pipe(gulp.dest('./build/'));
}

function buildAllPages() {
  return gulp.src('./src/blog/**/*.md', {base: './src/'})
    .pipe(mdTask())
    .pipe(require('gulp-filelist')('posts.json'))
    .pipe(gulp.dest('./build/'));
}

function buildIndex() {
  return gulp.src('./build/posts.json')
    .pipe(tap((f, t) => {
      const html = _generateIndex(JSON.parse(fs.readFileSync(f.path, 'utf8')));

      f.contents = Buffer.concat([
        new Buffer(fs.readFileSync('./src/blog/templates/header.html', 'utf8')),
        new Buffer(html),
        new Buffer(fs.readFileSync('./src/blog/templates/footer.html', 'utf8'))    
      ]);
    }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./'));
}

function _generateIndex(posts) {
  let recentPost = posts.pop();
  recentPost = `./${recentPost.substr(0, recentPost.length - 5)}.md`;
  let html = marked(fs.readFileSync(recentPost, 'utf8'));


  posts = posts.map((path) => {
    // Trim src/blog/ and prepend build/
    path = `build/${path.substr(4)}`;
    let name = path.split('/');
    name = name[name.length - 1];
    // Trim ##_ and .html
    name = name.substr(3, name.length - 8);
    name = name.replace('-', ' ');
    return `<li><a href='${path}'>${name}</a></li>`;
  });

  posts = posts.join('\n');

  return `${html}<ul>${posts}</ul>`;
}

function _watch(path, pipeline) {
  let watcher = gulp.watch(path);

  watcher.on('change', (path, stats) => {
    console.log(`Updating: ${path}`);
    pipeline(path);
  });

  watcher.on('add', (path, stats) => {
    console.log(`Adding: ${path}`);
    pipeline(path);
  });

  return watcher;
}

function clean() {
  return del(['./build/**', './index.html']);
}

const mdTask = lazypipe()
  .pipe(tap, _tapConcat)
  .pipe(rename, { extname: '.html' });

// Concat header and footers
function _tapConcat(f, t) {
  f.contents = Buffer.concat([
    new Buffer(fs.readFileSync('./src/blog/templates/header.html', 'utf8')),
    new Buffer(marked(f.contents.toString())),
    new Buffer(fs.readFileSync('./src/blog/templates/footer.html', 'utf8'))         
  ]);
}
