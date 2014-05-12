'use strict';
var gulp = require('gulp');
var express = require('express');
var path = require('path');
var gutil = require('gulp-util');
var tinylr = require('tiny-lr');
var rimraf = require('gulp-rimraf');
var webpack = require('webpack');

var javascriptGlob = 'static/js/**/*';
var assetsGlob = ['static/**/*', '!' + javascriptGlob];
var buildDestination = 'dist';


gulp.task('clean', function () {
  return gulp.src(buildDestination, { read: false })
      .pipe(rimraf());
});

gulp.task('build-js', function (callback) {
  buildJavascript(callback);
});

gulp.task('clean-build-js', ['clean'], function (callback) {
  buildJavascript(callback);
});

gulp.task('copy-assets', function () {
  return copyAssets();
});

gulp.task('clean-copy-assets', ['clean'], function () {
  return copyAssets();
});

gulp.task('build', ['clean', 'clean-build-js', 'clean-copy-assets']);

gulp.task('default', ['build']);

gulp.task('develop', ['build'], function (callback) {
  liveReload(35729, function (err, lr) {
    serve(buildDestination, 3000, function () {
      gutil.log('http server listening on port 3000 (livereload port 35729)...');

      gulp.watch(javascriptGlob, ['build-js']);

      gulp.watch(assetsGlob, function (evt) {
        gulp.src(evt.path).pipe(gulp.dest(buildDestination));
        lr.changed({ body: { files: [ evt.path ] } });
      });

      gulp.watch([buildDestination + '/**/*'], function (evt) {
        gutil.log(gutil.colors.cyan(evt.path), 'changed');
        lr.changed({ body: { files: [ evt.path ] } });
      });

      callback();
    });
  });
});

function liveReload(port, callback) {
  var lr = tinylr();
  lr.listen(port, function () {
    callback(null, lr);
  });
}

function serve(rootPath, port, callback) {
  var app = express();
  app.use(express.static(path.resolve(rootPath)));
  app.listen(port, callback);
}

function buildJavascript(callback) {
  var webpackConfig = require('./webpack.config');
  webpackConfig.plugins = webpackConfig.plugins.concat(
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin()
  );

  webpack(webpackConfig, function (err, stats) {
    if (err) {
      throw new gutil.PluginError('[build-js]', err);
    }

    gutil.log('[build-js]', stats.toString({ colors: true }));
    callback();
  });
}

function copyAssets() {
  return gulp.src(assetsGlob)
      .pipe(gulp.dest(buildDestination));
}