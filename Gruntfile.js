module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            'js/fyp.js': ['src/intervals.js', 'src/notes.js', 'src/scales.js', 'src/index.js', 'src/settings.js'],
            options: {
                browserifyOptions: {
                    debug: true
                }
            }
        },

        watch: {
            files: ['src/**/*.js'],
            tasks: ['browserify']
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');

}
