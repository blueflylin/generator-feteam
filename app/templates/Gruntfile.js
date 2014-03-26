
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

    // var path = require('path');

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
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
            files: ['<%= yeoman.app %>/sass/{,*/}*.{scss,sass}'],
            tasks: ['watchcontexthelper:sass'],
            options: {
            nospawn: true
            },
        },

        js: {
            files: ['<%= yeoman.app %>/js/**/*.js'],
            tasks: ['watchcontexthelper:js'],
            options: {
                nospawn: true
            },
        },

        img: {
            files: ['<%= yeoman.app %>/images/**/*'],
            tasks: ['watchcontexthelper:img'],
            options: {
                nospawn: true
            },
        },

        html: {
            files: ['<%= yeoman.app %>/html/**/*.hbs'],
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
                    return [ livereloadSnippet, mountFolder(connect, 'dist') ];
                }
            }
        },

        dist: {
            options: {
                middleware: function (connect) {
                    return [ mountFolder(connect, 'dist') ];
                }
            }
        }
    },

    open: {
        server: {
            path: 'http://localhost:<%%= connect.options.port %>/html/'
        }
    },

    sass: {
        main: {
            files: {
                '<%= yeoman.dist %>/css/': '<%= yeoman.app %>/sass/app/**/*.scss',
            },
        }
    },

    cssmin: {
        minify: {
            options: {},
            expand: true,
            cwd: '<%= yeoman.dist %>/css/',
            src: [ '*.css', '!*.min.css' ],
            dest: '<%= yeoman.dist %>/css/',
            ext: '.min.css',
        }
    },

    concat: {
        seajs: {
            options: {
                relative: true,
                include: 'all',
                paths: [ '<%= yeoman.app %>/js/sea-modules', '<%= yeoman.app %>/js/example/static', '.build' ]
            },
            files: {
                '<%= yeoman.dist %>/js/main.js': ['.build/{,*/,*/*/}*.js']
            }
        }
    },

    transport: {
        options: {
            debug: false,
            alias: {
                moment: 'moment'
            },
            paths: [ '<%= yeoman.app %>/js/sea-modules' ]
        },
        seajs: {
            options: {
                alias: {
                    moment: 'moment'
                },
                paths: [ '<%= yeoman.app %>/js', '.build' ]
            },
            files: [
                {
                    expand:true,
                    cwd: '<%= yeoman.app %>/js',
                    src: ['**/.js'],
                    dest: '.build'
                }
            ]
        }
    },

    uglify: {
        options: {},
        seajs: {
            files: {
                '<%= yeoman.dist %>/js/main.js': '<%= yeoman.dist %>/js/main.js'
            }
        }
    },

    assemble: {
        options: {
            data: '<%= yeoman.app %>/html/data/*.{json,yml}',
            partials: '<%= yeoman.app %>/html/partials/**/*.hbs',
        },
        development: {
            options: {
                production: false
            },
            files: [
                { expand: true, cwd: '<%= yeoman.app %>/html/pages/', src: ['**/*.hbs'], dest: '<%= yeoman.dist %>/html/' }
            ],
        },
        production: {
            options: {
                production: true
            },
            files: [
                { expand: true, cwd: '<%= yeoman.app %>/html/pages/', src: ['**/*.hbs'], dest: '<%= yeoman.dist %>/html/' }
            ],
        },
    },

    copy: {
        js: {
            files: [
                { expand: true, cwd: '<%= yeoman.app %>/js/', src: '**/*', dest: '<%= yeoman.dist %>/js/', filter: 'isFile' },
            ],
        },
        img: {
            files: [
                { expand: true, cwd: '<%= yeoman.app %>/images/', src: '**/*', dest: '<%= yeoman.dist %>/images/' },
            ],
        },
        html: {
            files: [
                { expand: true, cwd: '<%= yeoman.app %>/html/pages/', src: '**/*.html', dest: '<%= yeoman.dist %>/html/' },
            ],
        },
        seajs: {
            files: [
                { expand: true, dot: true, cwd: '<%= yeoman.app %>/js', src: ['sea-modules/**', 'config.js'], dest: '<%= yeoman.dist %>/js'}
            ],
        },
    },

    clean: {
        dist: [ '<%= yeoman.dist %>' ],
        js: [ '<%= yeoman.dist %>/js' ],
        css: [ '<%= yeoman.dist %>/css' ],
        html: [ '<%= yeoman.dist %>/html' ],
        img: [ '<%= yeoman.dist %>/images' ],
        devjs: [ '<%= yeoman.dist %>/js/**/*.js', '!<%= yeoman.dist %>/js/**/*.min.js' ],
        devcss: [ '<%= yeoman.dist %>/css/*.css', '!<%= yeoman.dist %>/css/*.min.css' ],
    }
});

grunt.registerTask('server', function (target) {
    if (target === 'dist') {
        return grunt.task.run(['development', 'connect:dist:keepalive', 'open']);
    }

    if (target === 'production') {
      grunt.watchcontext = 'production';
      return grunt.task.run(['production', 'connect:livereload', 'open', 'watch', ]);
    }

    grunt.registerTask('sea', ['transport:seajs', 'concat:seajs']);

    grunt.task.run(['development', 'connect:livereload', 'open', 'watch', ]);
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
    grunt.registerTask('production', [
        'clean:dist',
        'concat',
        'sass',
        'cssmin',
        'clean:devcss',
        'copy:img',
        'copy:js',
        'transport:seajs',
        'concat:seajs',
        'uglify:seajs',
        'clean:devjs',
        'copy:html',
        'assemble:production'
    ]);

    grunt.registerTask('development', [
        'clean:dist',
        'concat',
        'sass',
        'copy:img',
        'copy:js',
        'transport:seajs',
        'concat:seajs',
        'uglify:seajs',
        'copy:html',
        'assemble:development'
    ]);

    grunt.registerTask('dev', ['development']);

    grunt.registerTask('default', ['production']);

};
