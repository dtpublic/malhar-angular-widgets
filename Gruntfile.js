'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    ngtemplates: {
      dashboard: {
        options: {
          module: 'ui.widgets'
        },
        src: 'template/widgets/{,*/}*.html',
        dest: 'template/templates.js'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    concat: {
      dist: {
        src: [
          'src/modules.js',
          'src/**/*.js',
          'template/templates.js'
        ],
        dest: 'dist/malhar-angular-widgets.js'
      }
    },
    watch: {
      files: [
        'src/**/*.js',
        'template/widgets/{,*/}*.html'
      ],
      tasks: ['ngtemplates', 'concat'],
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          'demo/{,*/}*.html',
          'demo/{,*/}*.css',
          'demo/{,*/}*.js',
          'dist/*.js'
        ]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        ignores: [
          'src/vendor/{,*/}*.js'
        ]
      },
      all: [
        'Gruntfile.js',
        'demo/*.js',
        'src/**/*.js'
      ]
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          flatten: true,
          src: ['src/angular-ui-dashboard.css'],
          dest: 'dist'
        }]
      }
    },
    clean: {
      dist: {
        files: [{
          src: [
            'dist/*'
          ]
        }]
      },
      templates: {
        src: ['<%= ngtemplates.dashboard.dest %>']
      }
    },
    connect: {
      options: {
        port: 9001,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35739
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.',
            'demo'
          ]
        }
      }
    }
  });

  grunt.registerTask('test', [
    'ngtemplates',
    'karma'
  ]);

  grunt.registerTask('demo', [
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('default', [
    'clean:dist',
    'jshint',
    'ngtemplates',
    'karma',
    'concat',
    'clean:templates'
  ]);
};
