module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      jade: {
        files: ['views/**'],
        options: {
          livereload: true
        }
      },
      js: {
        files: ['public/js/**', 'models/**/*.js', 'schemas/**/*.js'],
        //tasks: ['jshint'],
        options: {
          livereload: true
        }
      }
    },

    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          args: [],
          nodeArgs: ['--debug'],
          ignore: ['README.md', 'node_modules/**'],
          ext: 'js',
          watch: ['./'],
          delay: 1000,
          env: {
            PORT: 3000
          },
          cwd: __dirname
        }
      }
    },

    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          'public/build/index.css': 'public/less/index.less'
        }
      }
    },

    uglify: {
      development: {
        files: {
          'public/build/admin.min.js': 'public/js/admin.js',
          'public/build/detail.min.js': [
            'public/js/detail.js'
          ]
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        ignores: ['public/libs/**/*.js']
      },
      all: ['public/libs/*.js', 'test/**/*.js', 'app/**/*.js']
    },

    mochaTest: {
      options: {
        reporter: 'spec',
      },
      src: ['test/**/*.js']
    },

    concurrent: {
      tasks: ['watch', 'nodemon', 'less', 'uglify', 'jshint'],
      options: {
        logConcurrentOutput: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.option('force', true);
  grunt.registerTask('default', ['concurrent']);
  grunt.registerTask('test', ['mochaTest']);
}
