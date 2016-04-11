# Generating the Index Page

**Goals**

- ✓ Generate a set of static html pages from source md files to be hosted on Github's Pages.
- ➞ Create a landing page with access to the collection of posts and features the newest post. 
- Simple styling
- ➞ Deployed to Github Pages

I've switched to Gulp 4. I made this decision primarily because I have been meaning to try out the build, but secondarily because I wanted to the series and parallel capabilities. I know that there are plugins that do this for Gulp 3. The majority of the work is again in the gulpfile, since this whole blog structure is generated into static pages. 

Generating a list of links to each previous blog post was made simple by a handy plugin called [gulp-filelist](https://www.npmjs.com/package/gulp-filelist). I used this to generate a list of paths and then convert them to a simple html list. Since I was generating a landing page, I figured I may as well set up Github Pages while I'm at it. 

```javascript
function buildAllPages() {
  return gulp.src('./src/blog/**/*.md', {base: './src/'})
    .pipe(mdTask())
    .pipe(require('gulp-filelist')('posts.json'))
    .pipe(gulp.dest('./build/'));
}
```
This function is where I generate all the static pages and the list for the landing page.

```javascript
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
```

Here I take the list of posts and generate the landing page. I decided to not use my mdTask helper, because in the future I want to have more control over what templates I insert into the page. The landing page also contains the most recent post. Currently I have to be aware that it also adds the "temp" pages, the posts I'm working on, as well. I just need to know that I shouldn't build the project and push to github unless it's a released post. I will clean this up later. Probably sooner. 

### Take away

I'm quite happy with how this came out. It's simple and straight forward. The inclusion of in progress posts is something that is easy to fix. I'm not quite satisfied with how I'm writing html, but for now it's fine. I quite like the concept of separation. I feel it is quite under utilized in web development, at least from what I have seen. 

### Next up!

I'm going to add some very, very basic styling to the pages, and then set some new goals to add a much needed UX touch. 


##### Files snapshot
- [gulpfile.js](https://github.com/redice44/redice44.github.io/blob/master/src/blog/2016/04/11/gulpfile.js)