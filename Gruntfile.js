module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            build: {
                files: {
                    'js/fyp.js': ['src/intervals.js', 'src/notes.js', 'src/scales.js', 'src/index.js', 'src/settings.js']
                }
            },
            develop: {
                files: {
                    'js/fyp.js': ['src/intervals.js', 'src/notes.js', 'src/scales.js', 'src/index.js', 'src/settings.js']
                },
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                }
            }
        },

        watch: {
            files: ['src/**/*.js'],
            tasks: ['browserify:develop']
        },

        uglify: {
            build: {
                files: {
                    'js/fyp.min.js': ['js/fyp.js']
                }
            }
        }

    });

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['browserify:build', 'uglify:build']);

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

}
