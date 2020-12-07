
const gulp = require('gulp');
const gulpFlatmap = require('gulp-flatmap');
const sass = require('gulp-sass');
const assetFunctions = require('node-sass-asset-functions');
const autoprefixer = require('gulp-autoprefixer');
// "Pug" was renamed from "Jade".
// see https://github.com/pugjs/pug
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const uglify = require('gulp-uglify');
const uglifySaveLicense = require('uglify-save-license');
const gulpif = require('gulp-if');
const beautify = require('gulp-jsbeautifier');

const browserify = require('browserify');
const envify = require('envify/custom');
const babelify = require('babelify');
const through2 = require('through2');

const browserSync = require('browser-sync');
const del = require('del');
const path = require('path');

const findBabelConfig = require('find-babel-config');

const babelConfig = findBabelConfig.sync(__dirname);

const IS_HTTPS = false;
const IS_DEBUG = true;

const paths = {
  src: 'src/',
  dist: 'dist/',
  raw_contents: 'raw_contents/',
  scss: 'src/assets/css/',
  css: 'dist/assets/css/',
  pug: 'src/',
  html: 'dist/',
  es6: 'src/assets/js/',
  js: 'dist/assets/js/',
  dist_image: 'dist/assets/img/',
  src_image: 'src/assets/img/',
  src_lib: 'src/assets/lib/',
  dist_lib: 'dist/assets/lib/',
};


gulp.task('watch', () => {
  gulp.watch([`${paths.src_image}**/*`], gulp.task('copy_image'));
  gulp.watch([`${paths.scss}**/*.scss`], gulp.task('scss'));
  gulp.watch([`${paths.pug}**/*.pug`], gulp.task('pug'));
  // gulp.watch([paths.es6+"**/*.es6"],gulp.task('babel'))
  gulp.watch([`${paths.es6}**/*.es6`], gulp.task('babelify-for-watch'));

  browserSync({
    notify: false,
    port: 3000,
    https: IS_HTTPS,
    server: {
      baseDir: [paths.dist, paths.raw_contents],
      routes: {
      },
    },
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: false,
    },
    watch: true,
  });
});

gulp.task('clean', () => del([paths.dist]));


gulp.task('copy_image', () => gulp.src([`${paths.src_image}**`], { base: paths.src_image })
  .pipe(gulp.dest(paths.dist_image)));
gulp.task('copy_lib', () => gulp.src([`${paths.src_lib}**`], { base: paths.src_lib })
  .pipe(gulp.dest(paths.dist_lib)));


gulp.task('scss', () => {
  const pathCssToImage = path.relative(paths.css, paths.dist_image);
  const cacheBusterString = `${Math.floor(Date.now() / 1000)}`;
  return gulp
    .src(`${paths.scss}**/*.scss`)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>'),
    }))
    .pipe(gulpFlatmap((stream, file) => {
      const relRoot = path.relative(path.dirname(file.path), paths.scss);
      return stream
        .pipe(sass({
          outputStyle: 'nested',
          sourceComments: false,
          includePaths: [
            paths.scss,
            './node_modules/compass-mixins/lib',
          ],
          functions: assetFunctions({
            images_path: paths.dist_image,
            http_images_path: path.join(relRoot, pathCssToImage),
            // eslint-disable-next-line camelcase
            asset_cache_buster(http_path, real_path, done) {
              done(cacheBusterString);
            },
          }),
        }));
    }))
    .pipe(
      autoprefixer({
        cascade: false,
      }),
    )
    .pipe(gulp.dest(paths.css));
});

gulp.task('pug', () => gulp
  .src([`${paths.pug}**/*.pug`, `!${paths.pug}**/_*.pug`])
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>'),
  }))
  .pipe(gulpFlatmap((stream, file) => stream
    .pipe(pug({
      pretty: true,
      locals: {
        relRoot: path.join('.', path.relative(path.dirname(file.path), paths.pug), '/'),
      },
      basedir: paths.pug,
      // debug:true,
      // compileDebug:true,
    }))
    .pipe(beautify({
      // indent_inner_html:true,
      indent_size: 2,
    }))))
  .pipe(gulp.dest(paths.html)));


function babelifyTaskInternal(full) {
  const source = full ? [`${paths.es6}**/*.es6`, `!${paths.es6}**/_*.es6`] : [`${paths.es6}**/*.es6`, `!${paths.es6}**/_*.es6`, `!${paths.es6}**/bundle.es6`];
  return gulp
    .src(source)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>'),
    }))
    .pipe(through2.obj((file, encode, callback) => browserify({
      entries: file.path,
      // debug:true,
      basedir: paths.es6,
    })
      .transform(babelify, {
        // jestで参照するためにオプションを`.babelrc`へ移動。
        ...babelConfig.config,
        // babelify独自オプションなので `.babelrc`には書けない。
        global: true,
        // sourceMaps:"file",
      })
      .transform(envify({
        NODE_ENV: (IS_DEBUG ? 'development' : 'production'),
      }))
      .bundle((err, res) => {
        if (err) { return callback(err); }
        // eslint-disable-next-line no-param-reassign
        file.contents = res;
        return callback(null, file);
      })
      .on('error', (err) => {
        console.log(`Error : ${err.message}`);
      })))
    .pipe(gulpif(!IS_DEBUG, uglify({ preserveComments: uglifySaveLicense })))
    .pipe(rename({
      extname: '.js',
    }))
    .pipe(gulp.dest(paths.js));
}

gulp.task('babelify', () => babelifyTaskInternal.call(null, true));

gulp.task('babelify-for-watch', () => babelifyTaskInternal.call(null, false));


gulp.task('build', gulp.series(
  'clean',
  gulp.parallel(
    'copy_image',
    'copy_lib',
  ),
  gulp.parallel(
    'scss',
    // pug
    'pug',
    'babelify',
  ),
));


gulp.task('default', gulp.series(
  'build',
  'watch',
));
