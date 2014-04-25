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
          'src/widgets/widgets.js',
          'src/widgets/{,*/}*.js',
          'template/templates.js'
        ],
        dest: 'dist/malhar-angular-widgets.js'
      }
    },
    watch: {
      files: [
        'src/**/*.*',
        'template/*.html'
      ],
      tasks: ['ngtemplates', 'concat', 'copy:dist']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'demo/*.js',
        'src/{,*/}*.js'
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
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      demo: {
        options: {
          open: true,
          base: [
            'bower_components',
            'dist',
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

  grunt.registerTask('demo', ['connect:demo:keepalive']);

  grunt.registerTask('default', [
    'clean:dist',
    'jshint',
    'ngtemplates',
    'karma',
    'concat',
    'clean:templates'
  ]);
};
