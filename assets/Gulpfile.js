var gulp = require('gulp'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-minify-css'),
    clean = require('gulp-clean'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    rev = require('gulp-rev'),
    useref = require('gulp-useref'),
    connectSSI = require('fed-ssi'),
    sourcemaps = require('gulp-sourcemaps'),
    cssUrlVersion = require('gulp-css-urlversion'),
    inlineImage = require('gulp-inline-imgurl'),
    connect = require('gulp-connect');

var build = './build/assets'

gulp.task('connect', function() {
    connect.server({
        root: '/codeDev',
        port: 3000,
        livereload: true,
        middleware: function() {
            return [connectSSI({
                ext: '.html',
                baseDir: '/codeDev',
                payload: {
                    ENV_TYPE: 'dev',
                    https: false,
                    channel:'',
                    page:''
                }
            })];
        }
    });
});

gulp.task('livereload', function() {
    gulp.src(build)
        .pipe(connect.reload());
});

gulp.task('clean', function(cb) {
    gulp.src('./build', {
            read: false
        })
        .pipe(clean())
});

gulp.task('copy', ['imagemin', 'sass', 'script'], function() {
    gulp.src(['./src/**/*.html', ])
        .pipe(inlineImage({list:['src','data-src']}))
        .pipe(useref())
        .pipe(gulp.dest('build'))
    gulp.src(['./src/temp/**', ])
        .pipe(gulp.dest('./build/temp'))

})

gulp.task('imagemin', function() {
    gulp.src('./src/images/**')
        .pipe(gulp.dest(build + '/images'))
    gulp.src('./src/css/images/**')
        .pipe(gulp.dest(build + '/css/images'))

})

gulp.task('script', function() {
    gulp.src('./src/js/**.js')
        .pipe(jshint({
            strict: true
        }))
        .pipe(jshint.reporter(stylish))
        .pipe(gulp.dest(build + '/js'))
})

gulp.task('sass', function() {
    gulp.src('./src/css/**.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({errLogToConsole: true}))
        .pipe(cssmin())
        .pipe(cssUrlVersion())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(build + '/css'))
});

gulp.task('watch', function() {
    gulp.watch(['./src/**'], ['copy'])
    gulp.watch([build + '/**'], ['livereload']);
});

gulp.task('default', ['copy']);

gulp.task('serve', ['copy', 'connect', 'watch']);
