# Setting up the Website

While planning the blog portion of my site, I quickly came to the realization that if I wanted to code my own blogging platform (which I do) then it will be quite a time investment. In the spirit of blogging that kind of delay wasn't appealing to me. So, I began thinking of some quick and dirty short term solutions. 

### Initial Thoughts

I originally began writing these posts in markdown, specifically GitHub's flavor of markdown. I started to poke around and see what kind of work process would be required in order to turn these around into a few simple pages. I know that [Jekyll](https://jekyllrb.com/) is around and integrates nicely into GitHub's Pages, but as with many things for this website and other projects, I wanted to go through the experience of developing the tools that I use for the experience of developing finished products. 

I'm going to try to have a single or very few related points in each post with hopefully a few overlying themes. 

### First Iteration

**Minimum Viable Product**

- Generate a set of static html pages from source md files to be hosted on Github's Pages.
- Create a landing page with access to the collection of posts and features the newest post. 
- Simple styling
- Deployed to Github Pages

### Static Page Generation

1. Have a way to build all html files.
2. Have a way to build a specific html file.

The difference between these two build methods end up being how the files are watched through gulp. So, let's take a look at the heavy lifting in the process.

```javascript
const fs = require('fs');
const rename = require('gulp-rename');
const tap = require('gulp-tap');
const lazypipe = require('lazypipe');
const marked = require('marked');

/* ... */

const mdTask = lazypipe()
  .pipe(tap, _tapConcat)
  .pipe(rename, { extname: '.html' });

function _tapConcat(f, t) {
  f.contents = Buffer.concat([
    new Buffer(fs.readFileSync('./src/blog/templates/header.html', 'utf8')),
    new Buffer(marked(f.contents.toString())),
    new Buffer(fs.readFileSync('./src/blog/templates/footer.html', 'utf8')),          
  ]);
}

/* ... */
```

Here we utilize lazypipe to create a reusable pipeline that pipes gulp-tap and gulp-rename to manipulate the markdown file. In tap we wrapping simple header and footer html files around the converted markdown file. Then we change the file extension to html.


```javascript
function _build() {
  return gulp.src('./src/blog/**/*.md', {base: './src/blog/'})
  .pipe(mdTask())
  .pipe(gulp.dest('./build/'));
}

// Watch for any template changes
gulp.watch('./src/blog/templates/**/*.html', (e) => {
  console.log('Template Updated: Building all md files.');
  _build();
});

// Update specific markdown file
gulp.watch('./src/blog/**/*.md', (e) => {
  console.log(`Writing ${e.path}`);

  gulp.src(e.path, { base: './src/blog/' })
    .pipe(mdTask())
    .pipe(gulp.dest('./build/'));
});

gulp.task('build', _build);

```

The _build function takes all markdown files in the blog and processes them with our mdTask pipeline and writes them to the build directory. This gets called anytime a template file gets changed or we just want to build the project. The watch on all markdown files only processes the specific files that was changed. This is accomplished by using `e.path` to get the file that triggered the event.

So far, so good. This post was generated using this process. Next up is getting a main page up and running. 

Files snapshot
- [gulpfile.js](https://github.com/redice44/redice44.github.io/blob/master/src/blog/2016/04/07/gulpfile.js)




