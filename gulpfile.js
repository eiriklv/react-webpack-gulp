'use strict';
var gulp = require('gulp');
var express = require('express');
var path = require('path');
var util = require('util');
var gutil = require('gulp-util');
var tinylr = require('tiny-lr');
var rimraf = require('gulp-rimraf');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

var javascriptGlob = 'static/js/**/*';
var assetsGlob = ['static/**/*', '!' + javascriptGlob];
var buildDestination = 'dist';
var liveReloadPort = 35729;
var httpServerPort = 3000;

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

gulp.task('build', ['clean-build-js', 'clean-copy-assets']);

gulp.task('default', ['build']);

gulp.task('develop', ['build'], function (callback) {
  liveReload(liveReloadPort, function (err, lr) {
    serve(buildDestination, httpServerPort, function () {
      gutil.log(util.format('http server listening on port %d (livereload port %d)...', liveReloadPort, httpServerPort));

      gulp.watch(javascriptGlob, ['build-js']);

      gulp.watch(assetsGlob, function (evt) {
        gulp.src(evt.path).pipe(gulp.dest(buildDestination));
        lr.changed({ body: { files: [ evt.path ] } });
      });

      gulp.watch([buildDestination + '/**/*'], function (evt) {
        gutil.log(gutil.colors.cyan(evt.path), 'changed');
        lr.changed({ body: { files: [ evt.path ] } });
      });
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
