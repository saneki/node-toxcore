module.exports = function(grunt) {
  grunt.initConfig({
    jsdoc: {
      dist: {
        src: [
          'lib/events.js',
          'lib/tox.js',
          'lib/toxoptions.js',
          'lib/tox_old.js'
        ],
        options: {
          destination: 'doc',
          template : 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
          configure : 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('default', ['jsdoc']);
};
