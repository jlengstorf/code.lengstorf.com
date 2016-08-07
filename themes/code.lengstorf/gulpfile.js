/*
 * # Build Pipeline for code.lengstorf.com
 * This gulpfile is heavily influenced by the Sage WordPress theme.
 * See https://github.com/roots/sage/blob/master/gulpfile.js for more info.
 */
const gulp = require('gulp');
const path = require('path');

/*
 * ## Load Dependencies for Processing Assets
 */
const lazypipe = require('lazypipe');
const changed = require('gulp-changed');
const gulpif = require('gulp-if');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const rev = require('gulp-rev');
const browserSync = require('browser-sync').create();
const merge = require('merge-stream');
const runSequence = require('run-sequence');

/*
 * ## Set Paths for Assets
 */
const paths = {
  pug: {
    cwd: 'source',
    src: [ 'templates/**/*.pug' ],
    dest: 'layouts',
  }
};


/*
 * ## Create a Simple Error Handler for Use With Plumber
 */
const handleError = (err) => {
  console.error(err.message);
};


/*
 * ## Convert Pug Files to HTML
 * Pug used to be called Jade. It's a faster way to write HTML.
 */
const pug = require('gulp-pug');
gulp.task('pug', () => {
  gulp.src(paths.pug.src, { cwd: paths.pug.cwd })
      .pipe(gulpif(!enabled.failTemplateTask, plumber(handleError)))
      .pipe(pug({
        basedir: path.resolve(__dirname),
      }))
      .pipe(changed(paths.pug.dest, {
        extension: '.html',
        hasChanged: changed.compareSha1Digest,
      }))
      .pipe(gulp.dest(paths.pug.dest));
});


/*
 * ## Use the Asset Builder to Create Site Assets
 * See https://github.com/austinpray/asset-builder for details.
 */
const manifest = require('asset-builder')('./source/asset-manifest.json');

/*
 * ## Set Options Based on CLI Args
 */
const argv = require('minimist')(process.argv.slice(2));
const enabled = {

  /*
   * ### If the `--production` flag is set, we handle a few things differently.
   * Enable file revisions.
   */
  rev: argv.production,

  // Disable source maps.
  maps: !argv.production,

  // Fail on style errors
  failStyleTask: argv.production,

  // Fail on pug errors
  failTemplateTask: argv.production,
};


/*
 * ## Process Stylesheets
 */
const styleTasks = (filename) => {
  const processors = [

    // - [`postcss-import`](http://git.io/vUQ0p) for `@import` support
    require('postcss-import')({ glob: true }),

    // - [`postcss-mixins`](http://git.io/vUBKn) allows Sass-style mixins
    require('postcss-mixins')({
      mixinsDir: process.cwd() + '/source/scripts/postcss/mixins/'
    }),

    // - [`postcss-nested`](http://git.io/vUBoT) allows nested selectors
    require('postcss-nested'),

    // - [`postcss-simple-vars`](http://git.io/vUBKX) allows Sass-style vars
    require('postcss-simple-vars'),

    // - [`postcss-simple-vars`](http://git.io/vUBKX) allows Sass-style vars
    require('postcss-cssnext')(),

    // - [`postcss-simple-vars`](http://git.io/vUBKX) allows Sass-style vars
    require('cssnano')({ safe: true, autoprefixer: false }),
  ];

  return lazypipe()

    // Enables plumber if enabled to avoid failing on an error in this task.
    .pipe(() => gulpif(!enabled.failStyleTask, plumber()))

    // Enables sourcemaps if they're enabled.
    .pipe(() => gulpif(enabled.maps, sourcemaps.init()))

    // Run PostCSS to allow future CSS syntax without compatibility issues.
    .pipe(require('gulp-postcss'), processors)

    // Concatenate all files into a single file with the passed filename.
    .pipe(concat, filename)

    // Revision the generated file if that's enabled.
    .pipe(() => gulpif(enabled.rev, rev()))

    .pipe(() => gulpif(enabled.maps, sourcemaps.write('.', {
      sourceRoot: 'static/assets/styles/',
    })))
    ();
};

/*
 * ## Write to the Rev Manifest
 */
const revManifest = manifest.paths.dist + 'assets.json';
const writeToManifest = (directory) => {
  return lazypipe()
    .pipe(gulp.dest, manifest.paths.dist + directory)
    .pipe(browserSync.stream, { match: '**/*.{js,css}' })
    .pipe(rev.manifest, revManifest, {
      base: manifest.paths.dist,
      merge: true,
    })
    .pipe(gulp.dest, manifest.paths.dist)();
};


/*
 * ## Create the Gulp Tasks
 */
gulp.task('styles', [], () => {
  const merged = merge();
  manifest.forEachDependency('css', (dep) => {
    const styleTasksInstance = styleTasks(dep.name);

    if (!enabled.failStyleTask) {
      styleTasksInstance.on('error', handleError);
    }

    merged.add(
      gulp.src(dep.globs, { base: 'styles' })
        .pipe(styleTasksInstance)
    );
  });

  return merged.pipe(writeToManifest('styles'));
});


gulp.task('wiredep', () => {
  const wiredep = require('wiredep').stream;
  return gulp.src('./layouts/**/*.html')
    .pipe(wiredep())
    .pipe(changed(manifest.paths.source, {
      hasChanged: changed.compareSha1Digest,
    }))
    .pipe(gulp.dest('./layouts'));
});

gulp.task('styles:watch', (callback) => {
  runSequence(
    'styles',
    'pug',
    callback
  );
});


/*
 * ## Set Up File Watching for Development
 */
gulp.task('watch', () => {
  browserSync.init({
    open: 'external',
    host: manifest.config.devUrl,
    port: 8100,
  });

  gulp.watch([ manifest.paths.source + 'styles/**/*' ], [ 'styles:watch' ]);

  // Hugo server already reloads, so we don't need to watch templates.
  gulp.watch([ manifest.paths.source + 'templates/**/*' ], [ 'pug' ]);
});
