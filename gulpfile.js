
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
  dist_assets: 'dist-assets/',
  dist_html: 'dist-html/',
  dist_php: 'dist-php/',
  raw_contents: 'raw_contents/',
  scss: 'src/assets/css/',
  css: 'dist-assets/assets/css/',
  pug: 'src/',
  html: 'dist-html/',
  php: 'dist-php/',
  es6: 'src/assets/js/',
  js: 'dist-assets/assets/js/',
  dist_image: 'dist-assets/assets/img/',
  src_image: 'src/assets/img/',
  src_lib: 'src/assets/lib/',
  dist_lib: 'dist-assets/assets/lib/',
};


const clean_task = () => del([
  paths.dist_assets,
  paths.dist_html,
  paths.dist_php,
  paths.dist,
]);


const copy_image_task = () => gulp.src([`${paths.src_image}**`], { base: paths.src_image })
  .pipe(gulp.dest(paths.dist_image));


const copy_lib_task = () => gulp.src([`${paths.src_lib}**`], { base: paths.src_lib })
  .pipe(gulp.dest(paths.dist_lib));

const scss_task = () => {
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
};


function pugTaskInternal(isPHP) {
  const destDir = isPHP ? paths.php : paths.html;
  const extname = isPHP ? ".php" : ".html";
  return gulp
    .src([`${paths.pug}**/*.pug`, `!${paths.pug}**/_*.pug`])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>'),
    }))
    .pipe(gulpFlatmap((stream, file) => stream
      .pipe(pug({
        pretty: true,
        locals: {
          isPHP,
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
    .pipe(rename({
      extname,
    }))
    .pipe(gulp.dest(destDir))
}

const pug_to_html_task = () => pugTaskInternal.call(null, false);
const pug_to_php_task = () => pugTaskInternal.call(null, true);

const pug_task = gulp.series(pug_to_html_task, pug_to_php_task);

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

const babelify_task = () => babelifyTaskInternal.call(null, true);
const babelify_for_watch_task = () => babelifyTaskInternal.call(null, false);

const build_each_task = gulp.series(
  gulp.parallel(
    copy_image_task,
    copy_lib_task,
  ),
  gulp.parallel(
    scss_task,
    // pug
    pug_task,
    babelify_task,
  ),
);


const publish_assets_task = () => {
  return gulp.src([`${paths.dist_assets}**`], { base: paths.dist_assets })
    .pipe(gulp.dest(paths.dist))
};

const publish_php_task = () => {
  return gulp.src([`${paths.dist_php}**`], { base: paths.dist_php })
    .pipe(gulp.dest(paths.dist))
};


const publish_task = gulp.series(
  publish_assets_task,
  publish_php_task,
);
exports.publish = publish_task;

const build_task = gulp.series(
  clean_task,
  build_each_task,
  publish_task,
);
exports.build = build_task;

const watch_task = () => {
  gulp.watch([`${paths.src_image}**/*`], copy_image_task);
  gulp.watch([`${paths.scss}**/*.scss`], scss_task);
  gulp.watch([`${paths.pug}**/*.pug`], pug_task);
  // gulp.watch([paths.es6+"**/*.es6"],gulp.task('babel'))
  gulp.watch([`${paths.es6}**/*.es6`], babelify_for_watch_task);

  browserSync({
    notify: false,
    port: 3000,
    https: IS_HTTPS,
    server: {
      baseDir: [paths.dist_html, paths.dist_assets, paths.raw_contents],
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
};
exports.watch = watch_task;

const debug_task = gulp.series(
  clean_task,
  build_each_task,
  watch_task,
);
exports.debug = debug_task;

exports.default = gulp.series(
  debug_task,
);
