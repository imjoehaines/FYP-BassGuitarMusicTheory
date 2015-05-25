module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            'js/index.js': ['src/index.js'],
            'js/intervals.js': ['src/intervals.js'],
            'js/notes.js': ['src/notes.js'],
            'js/scales.js': ['src/scales.js'],
            'js/settings.js': ['src/settings.js']
        },

        watch: {
            files: ['src/**/*.js'],
            tasks: ['browserify']
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');

}
