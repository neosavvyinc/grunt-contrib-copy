/*
 * grunt-contrib-copy
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 Chris Talkington, contributors
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt-contrib-copy/blob/master/LICENSE-MIT
 */

module.exports = function(grunt) {
  'use strict';

  var path = require('path');
  var fs = require('fs');

  grunt.registerMultiTask('copy', 'Copy files.', function() {
    var kindOf = grunt.util.kindOf;

    var options = this.options({
      encoding: grunt.file.defaultEncoding,
      // processContent/processContentExclude deprecated renamed to process/noProcess
      processContent: false,
      processContentExclude: [],
      mode: false
    });

    var copyOptions = {
      encoding: options.encoding,
      process: options.process || options.processContent,
      noProcess: options.noProcess || options.processContentExclude,
    };

    grunt.verbose.writeflags(options, 'Options');

    var dest;
    var isExpandedPair;
    var destMustExist;
    var tally = {
      dirs: 0,
      files: 0
    };

    this.files.forEach(function(filePair) {
      isExpandedPair = filePair.orig.expand || false;
      destMustExist = filePair.destMustExist || false;
      filePair.dest = grunt.util._.isArray(filePair.dest) ? filePair.dest : [filePair.dest];

      filePair.dest.forEach(function(fDest) {
          if (!destMustExist || (destMustExist && (grunt.file.isDir(unixifyPath(fDest)) | grunt.file.isFile(fDest)))) {
              filePair.src.forEach(function(src) {
                if (detectDestType(fDest) === 'directory') {
                  dest = (isExpandedPair) ? fDest : unixifyPath(path.join(fDest, src));
                } else {
                  dest = fDest;
                }

                if (grunt.file.isDir(src)) {
                  grunt.verbose.writeln('Creating ' + dest.cyan);
                  grunt.file.mkdir(dest);
                  tally.dirs++;
                } else {
                  grunt.verbose.writeln('Copying ' + src.cyan + ' -> ' + dest.cyan);
                  grunt.file.copy(src, dest, copyOptions);
                  if (options.mode !== false) {
                    fs.chmodSync(dest, (options.mode === true) ? fs.lstatSync(src).mode : options.mode);
                  }
                  tally.files++;
                }
              });
          }
        });
    });

    if (tally.dirs) {
      grunt.log.write('Created ' + tally.dirs.toString().cyan + ' directories');
    }

    if (tally.files) {
      grunt.log.write((tally.dirs ? ', copied ' : 'Copied ') + tally.files.toString().cyan + ' files');
    }

    grunt.log.writeln();
  });

  var detectDestType = function(dest) {
    if (grunt.util._.isArray(dest)) {
        return 'array';
    } else if (grunt.util._.endsWith(dest, '/')) {
      return 'directory';
    } else {
      return 'file';
    }
  };

  var unixifyPath = function(filepath) {
    if (process.platform === 'win32') {
      return filepath.replace(/\\/g, '/');
    } else {
      return filepath;
    }
  };
};
