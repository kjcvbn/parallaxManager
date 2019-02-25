var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    config = {
        js: {
            name: 'pxm.jquery',
            src: 'src/**/*.js',
            dest: 'dist'
        }
    };

gulp.task('js', function(){

    return gulp.src([config.js.src])
        .pipe(concat(config.js.name+'.js'))
        .pipe(gulp.dest(config.js.dest))
        .pipe(uglify())
        .pipe(rename(config.js.name+'.min.js'))
        .pipe(gulp.dest(config.js.dest));
});

gulp.task('watch', function(){
    gulp.watch(config.js.src,['js']);
});
