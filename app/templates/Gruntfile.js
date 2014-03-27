'use strict';

// Live Reload
var livereloadSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {

  // Load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.loadNpmTasks('assemble');

  var path = require('path');

  grunt.initConfig({
    yeoman:yeomanConfig,

    pkg: grunt.file.readJSON('package.json'),

    watch: {
      options: {
        livereload: true,
        interrupt: true,
      },
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['watchcontexthelper:gruntfile'],
        options: {
          nospawn: true,
        },
      },
      sass: {
      files: ['app/sass/{,*/}*.{scss,sass}'],
        tasks: ['watchcontexthelper:sass'],
        options: {
          nospawn: true
        },
      },
      js: {
        files: ['app/js/**/*.js'],
        tasks: ['watchcontexthelper:js'],
        options: {
          nospawn: true
        },
      },
      img: {
        files: ['app/images/**/*'],
        tasks: ['watchcontexthelper:img'],
        options: {
          nospawn: true
        },
      },
      html: {
        files: ['app/html/**/*.hbs'],
        tasks: ['watchcontexthelper:html'],
        options: {
          nospawn: true
        },
      },
    },

    connect: {
      options: {
        port: 9090,
        hostname: 'localhost' // change this to '0.0.0.0' to access the server from outside
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              livereloadSnippet,
              mountFolder(connect, 'dist')
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },

    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>/html/'
      }
    },
    cssmin: {
      minify: {
        options: {},
        expand: true,
        cwd: 'dist/css/',
        src: [ '*.css', '!*.min.css' ],
        dest: 'dist/css/',
        ext: '.min.css',
      }
    },

    concat: {
      seajs: {
                options: {
                    relative: true,
                    include: 'all',
                    paths: [
                        'app/js/sea-modules',
                        '.build'
                    ]
                },
                files: {
                'dist/js/main.js': ['.build/{,*/,*/*/}*.js']
                }
            }
    },
    transport: {
            options: {
                debug: false,
                alias: {
                },
                paths: [
                    'app/js/sea-modules'
                ]
            },
            seajs: {
                options: {
                    paths: [
                        '',
                        '.build'
                    ]
                },
                files: [
                    {
                        expand:'true',
                        cwd: '',
                        src: [
                        ],
                        dest: '.build'
                    }
                ]
            }
        },


    uglify: {

      options: {},
      seajs: {
                files: {
                    'dist/js/main.js': 'dist/js/main.js'
                }
            },
    },

    assemble: {
      options: {
        data: 'app/html/data/*.{json,yml}',
        partials: 'app/html/partials/**/*.hbs',
      },
      development: {
        options: {
          production: false
        },
        files: [
          { expand: true, cwd: 'app/html/pages/', src: ['**/*.hbs'], dest: 'dist/html/' }
        ],
      },
      production: {
        options: {
          production: true
        },
        files: [
          { expand: true, cwd: 'app/html/pages/', src: ['**/*.hbs'], dest: 'dist/html/' }
        ],
      },
    },

    copy: {
      seajs: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: 'app/js',
                        src: ['sea-modules/**', 'config.js'],
                        dest: 'dist/js'
                    }
                ]
            },
      js: {
        files: [
          { expand: true, cwd: 'app/js/', src: '**/*', dest: 'dist/js/', filter: 'isFile' },
        ],
      },
      img: {
        files: [
          { expand: true, cwd: 'app/images/', src: '**/*', dest: 'dist/images/' },
        ],
      },
      html: {
        files: [
          { expand: true, cwd: 'app/html/pages/', src: '**/*.html', dest: 'dist/html/' },
        ],
      },
    },

    clean: {
      dist: [ 'dist' ],
      js: [ 'dist/js' ],
      css: [ 'dist/css' ],
      html: [ 'dist/html' ],
      img: [ 'dist/images' ],
      devjs: [ 'dist/js/**/*.js', '!dist/js/**/*.min.js' ],
      devcss: [ 'dist/css/*.css', '!dist/css/*.min.css' ],
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        'development',
        'connect:dist:keepalive',
        'open'
      ]);
    }

    if (target === 'production') {
      grunt.watchcontext = 'production';
      return grunt.task.run([
        'production',
        'connect:livereload',
        'open',
        'watch',
      ]);
    }

    grunt.task.run([
      'development',
      'connect:livereload',
      'open',
      'watch',
    ]);
  });


  grunt.registerTask('watchcontexthelper', function (target){
    switch (target) {
      case 'gruntfile':
        console.log('Spawning a child process for complete rebuild...');
        var child;

        var showDone = function(){
          console.log('Done');
        }

        if (grunt.watchcontext === 'production') {
          child = grunt.util.spawn({ grunt: true, args: ['production'] }, showDone);
        } else {
          child = grunt.util.spawn({ grunt: true, args: ['development'] }, showDone);
        }
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        break;
      case 'js':
        (grunt.watchcontext === 'production') ?
        grunt.task.run(['clean:js', 'copy:js', 'concat', 'uglify', 'clean:devjs']) :
        grunt.task.run(['clean:js', 'copy:js', 'concat']);
        break;
      case 'img':
        (grunt.watchcontext === 'production') ?
        grunt.task.run(['clean:img', 'copy:img']) :
        grunt.task.run(['clean:img', 'copy:img']);
        break;
      case 'html':
        (grunt.watchcontext === 'production') ?
        grunt.task.run(['clean:html', 'copy:html', 'assemble:production']) :
        grunt.task.run(['clean:html', 'copy:html', 'assemble:development']);
        break;
      case 'sass':
        (grunt.watchcontext === 'production') ?
        grunt.task.run(['clean:css', 'sass', 'cssmin', 'clean:devcss']) :
        grunt.task.run(['clean:css', 'sass']);
        break;
    }
  });

  grunt.registerTask('sea', [
        'transport:seajs',
        'concat:seajs'
    ]);

  grunt.registerTask('production', [
    'clean:dist',
    'concat',
    'cssmin',
    'clean:devcss',
    'copy:img',
    'copy:js',
    'clean:devjs',
    'transport:seajs',
        'concat:seajs',
        'uglify:seajs',
    'copy:html',
    'assemble:production'
  ]);

  grunt.registerTask('development', [
    'clean:dist',
    'concat',
    'copy:img',
    'copy:js',
    'transport:seajs',
        'concat:seajs',
        'uglify:seajs',
    'copy:html',
    'assemble:development'
  ]);

  grunt.registerTask('dev', [
    'development'
  ]);

  grunt.registerTask('default', [
    'production'
  ]);

};
