const gulp = require('gulp');
const path = require('path');
const less = require('gulp-less');
const insert = require('gulp-insert');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const src = path.resolve(__dirname, '../packages');

const libDir = path.resolve(__dirname, '../lib');
const esDir = path.resolve(__dirname, '../dist');
const exampleDir = path.resolve(__dirname, '../src/dist');

const baseCssPath = path.resolve(__dirname, '../packages/common/index.wxss');

const cleaner = (path) =>
  function clean() {
    return exec(`npx rimraf ${path}`);
  };

const lessCompiler = (dist) =>
  function compileLess() {
    return gulp
      .src(`${src}/**/*.less`)
      .pipe(less())
      .pipe(postcss())
      .pipe(
        insert.transform((contents, file) => {
          if (!file.path.includes('packages' + path.sep + 'common')) {
            const relativePath = path
              .relative(
                path.normalize(`${file.path}${path.sep}..`),
                baseCssPath
              )
              .replace(/\\/g, '/');
            contents = `@import '${relativePath}';${contents}`;
          }
          return contents;
        })
      )
      .pipe(rename({ extname: '.wxss' }))
      .pipe(gulp.dest(dist));
  };

const copier = (dist, ext) =>
  function copy() {
    return gulp.src(`${src}/**/*.${ext}`).pipe(gulp.dest(dist));
  };

const staticCopier = (dist) =>
  gulp.parallel(
    copier(dist, 'js'),
    copier(dist, 'wxml'),
    copier(dist, 'wxs'),
    copier(dist, 'json')
  );

const tasks = [
  ['buildEs', esDir],
  ['buildLib', libDir],
].reduce((prev, [name, ...args]) => {
  prev[name] = gulp.series(
    cleaner(...args),
    gulp.parallel(
      lessCompiler(...args),
      staticCopier(...args)
    )
  );
  return prev;
}, {});

tasks.buildExample = gulp.series(
  cleaner(exampleDir),
  gulp.parallel(
    lessCompiler(exampleDir),
    staticCopier(exampleDir),
    () => {
      gulp.watch('../packages/**/*.less', { delay: 300 }, lessCompiler(exampleDir));
      gulp.watch('../packages/**/*.wxml', { delay: 300 }, copier(exampleDir, 'wxml'));
      gulp.watch('../packages/**/*.wxs', { delay: 300 }, copier(exampleDir, 'wxs'));
      gulp.watch('../packages/**/*.json', { delay: 300 }, copier(exampleDir, 'json'));
    }
  )
);

module.exports = tasks;