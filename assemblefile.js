'use strict';

var path = require('path');
var prettify = require('gulp-prettify');
var extname = require('gulp-extname');
var merge = require('mixin-deep');
var store = require('base-store');
var get = require('get-value');
var assemble = require('./');

/**
 * HEADS UP! this assemblefile is temporary and is not used in the project.
 * We're just using it to quickly test things out while we're working on
 * docs.
 */

/**
 * Create our assemble appplication
 */

var app = assemble();
app.use(store('assemble'));

/**
 * Customize how templates are stored. This changes the
 * key of each template, so it's easier to lookup later
 */

app.option('renameKey', function(fp) {
  return path.basename(fp, path.extname(fp));
});

/**
 * Create a custom view collection
 */

app.create('docs');

/**
 * Load helpers
 */

app.helpers('docs/support/helpers/*.js');

/**
 * Load some "global" data
 */

app.data({
  site: {
    title: 'Assemble Docs'
  },
  destBase: '_gh_pages/',
  assets: 'assets',
  links: [{
    dest: 'assemble',
    collection: 'docs',
    text: 'Assemble'
  }]
});

/**
 * Middleware
 */

app.preLayout(/\/api\/.*\.md$/, function(view, next) {
  view.layout = 'body';
  next();
});

/**
 * Re-load templates when triggered by watch
 */

app.task('load', function(cb) {
  app.pages('docs/templates/pages/*.hbs');
  app.partials('docs/templates/partials/**/*.hbs');
  app.layouts('docs/templates/layouts/**/*.hbs');
  app.docs('./docs/content/api/*.md');
  cb();
});

/**
 * Building the assemble docs
 */

app.task('default', ['load'], function() {
  var pkg = require('./package');
  return app.toStream('pages')
    .on('err', console.log)
    .pipe(app.renderFile())
    .on('err', console.log)
    .pipe(prettify())
    .pipe(extname())
    .pipe(app.dest(function(file) {
      file.base = file.dirname;
      return '_gh_pages/en/v' + pkg.version;
    }))
});

/**
 * Watch files for changes
 */

app.task('watch', ['default'], function() {
  app.watch('docs/**/*.{md,hbs}', ['default']);
  console.log('watching docs templates');
});

/**
 * Expose the `app` instance
 */

module.exports = app;
