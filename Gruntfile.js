module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            dev: {
                'js/index.js': ['src/index.js'],
                'js/intervals.js': ['src/intervals.js'],
                'js/notes.js': ['src/notes.js'],
                'js/scales.js': ['src/scales.js'],
                'js/settings.js': ['src/settings.js'],
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                }
            },
            build: {
                'js/index.js': ['src/index.js'],
                'js/intervals.js': ['src/intervals.js'],
                'js/notes.js': ['src/notes.js'],
                'js/scales.js': ['src/scales.js'],
                'js/settings.js': ['src/settings.js']
            }
        },

        watch: {
            files: ['src/**/*.js'],
            tasks: ['browserify:dev']
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');

}
