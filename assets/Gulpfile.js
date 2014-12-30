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
    gutil = require('gulp-util'),
    cssUrlVersion = require('gulp-css-urlversion'),
    inlineImage = require('gulp-inline-imgurl'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    mock = require('fed-mock'),
    connect = require('gulp-connect');

var env = gutil.env.type
var build = env == 'component' ? './build' : './build/assets'

gulp.task('connect', function() {
    connect.server({
        root: '/newCode',
        port: 3000,
        livereload: true,
        middleware: function(connect, opt) {
            var middlewares = [];
            middlewares.push(connectSSI({
                ext: '.html',
                baseDir: '/newCode',
                payload: {
                    ENV_TYPE: 'dev',
                    https: false,
                    channel: '',
                    page: 'package.json'
                }
            }))

            return middlewares;
        }
    });
});

gulp.task('mock', function() {
    connect.server({
        root: '/newCode',
        port: 3001,
        livereload: true,
        middleware: function(connect, opt) {
            var middlewares = [];
            middlewares.push(mock(
                '', ''
            ))
            return middlewares
        }
    })
})

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

gulp.task('copy', ['image', 'sass', 'script'], function() {
    gulp.src(['./src/**/*.html'])
        .pipe(inlineImage({
            list: ['src', 'data-src'] // 默认只更改src 和 data-src，如果其他需要构建，可以在此添加属性。
        }))
        .pipe(useref())
        .pipe(gulp.dest('build'))
    gulp.src(['./src/temp/**'])
        .pipe(gulp.dest('./build/temp'))

})

gulp.task('image', function() {
    gulp.src('./src/images/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }]
        }))
        .pipe(gulp.dest(build + '/images'))
    gulp.src('./src/css/images/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }]
        }))
        .pipe(gulp.dest(build + '/css/images'))

})

gulp.task('script', function() {
    gulp.src('./src/js/**.js')
        .pipe(jshint({
            strict: false
        }))
        .pipe(jshint.reporter(stylish))
        .pipe(gulp.dest(build + '/js'))
})

gulp.task('sass', function() {
    gulp.src('./src/css/**.scss')
        .pipe((env == 'prd' || env == 'component') ? gutil.noop() : sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cssmin())
        .pipe(cssUrlVersion())
        .pipe((env == 'prd' || env == 'component') ? gutil.noop() : sourcemaps.write('./'))
        .pipe(gulp.dest(build + '/css'))
});

gulp.task('watch', function() {
    gulp.watch(['./src/**'], ['copy'])
    gulp.watch([build + '/**'], ['livereload']);
});

gulp.task('default', ['copy']);

gulp.task('serve', ['copy', 'connect', 'watch']);
