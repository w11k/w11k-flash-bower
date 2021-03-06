'use strict';

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig({
    clean: {
      release: ['dist/**/*', 'bower.json' ]
    },
    copy: {
      release: {
        files: [
          {
            expand: true,
            cwd: '../w11k-flash/dist/',
            src: '**/*',
            dest: 'dist/'
          },
          {
            src: '../w11k-flash/bower.json',
            dest: './bower.json'
          }
        ]
      }
    }
  });

  grunt.registerTask('default', ['release']);
  grunt.registerTask('release', ['clean:release', 'copy:release']);
};
