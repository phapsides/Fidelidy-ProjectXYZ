var gulp = require('gulp');

var sass = require('gulp-sass');

var cleanCSS = require('gulp-clean-css');

var uglify = require('gulp-uglify');

var pump = require('pump');

var autoprefixer = require('gulp-autoprefixer');

var nunjucksRender = require('gulp-nunjucks-render');

var clean = require('gulp-clean');

var connect = require('gulp-connect');

var concat = require('gulp-concat');

var modernizr = require('gulp-modernizr');

var sourcemaps = require('gulp-sourcemaps');

var imagemin = require('gulp-imagemin');



/**

 * Compile SASS into dist folder

 */

gulp.task('sass', function() {

    return gulp.src('./source/scss/main.scss')

    .pipe(sass({

        includePaths: ['./source/scss', './bower_components/foundation-sites/scss']

    }).on('error', sass.logError))

    .pipe(autoprefixer({

        browsers: ['last 3 versions'],

        cascade: false

    }))

    .pipe(sourcemaps.write())

    // .pipe(cleanCSS())

    .pipe(gulp.dest('./dev/assets/css'))

    .pipe(connect.reload());

});



/**

 * Remove old files in the dist

 * directory

 */

gulp.task('clean', function() {

    return gulp.src('dev/*.html', {
        read: false
    })

    .pipe(clean());

});



/**

 * Render the nunjucks templates

 * into dist folder

 */

gulp.task('nunjucks', function() {

    return gulp.src('source/html_templates/nunjucks/pages/**/*.html')

    .pipe(nunjucksRender({

        path: ['source/html_templates/nunjucks']

    }))

    .pipe(gulp.dest('dev'))

    .pipe(connect.reload());

});



/**

 * Move fonts

 */

gulp.task('fonts', function() {

    return gulp.src('./source/fonts/**/*')

    .pipe(gulp.dest('./dev/assets/fonts'));

});



/**

 * Move and optimize images

 */

gulp.task('images', function() {

    return gulp.src('./source/images/**/*')

    // .pipe(imagemin())

    .pipe(gulp.dest('./dev/assets/images'));

});



/**

 * Watch SASS files for changes and recompile

 */

gulp.task('watch-sass', function() {

    return gulp.watch('source/scss/**/*.scss', ['sass']);

});



/**

 * Watch HTML files for changes and recompile

 */

gulp.task('watch-html', function() {

    return gulp.watch('source/html_templates/**/*.html', ['nunjucks']);

});



/**

 * Watch JS files for changes and recompile

 */

gulp.task('watch-js', function() {

    return gulp.watch('./source/js/custom/*.js', ['custom-js']);

});



/**

 * Serve the dist folder

 */

gulp.task('serve', function() {

    connect.server({

        root: 'dev',

        livereload: {
            port: 38000
        },

        port: 4000

    });

});



/**

* Concatenate and minify vendor javascript

* We should check that all of these are actively used

*/

gulp.task('vendor-js', function() {

    return gulp.src([

        'bower_components/jquery/dist/jquery.min.js',

        'bower_components/foundation-sites/dist/foundation.js',

        'bower_components/owl-carousel/owl-carousel/owl.carousel.min.js',

        'bower_components/chartist/dist/chartist.min.js',

        'bower_components/chartist-plugin-axistitle/dist/chartist-plugin-axistitle.min.js',

    ])

    .pipe(concat('vendor.js'))

    .pipe(gulp.dest('dev/assets/js'));

});



/**

* Concatenate and minify vendor javascript

* We should check that all of these are actively used

*/

gulp.task('vendor-css', function() {

    return gulp.src([

        'bower_components/owl-carousel/owl-carousel/owl.carousel.css',

        'bower_components/owl-carousel/owl-carousel/owl.theme.css',

        'bower_components/chartist/chartist/chartist.css',

    ])

    .pipe(concat('vendor.css'))

    .pipe(gulp.dest('dev/assets/css'));

});



/**

* Concatenate and minify vendor javascript

* We should check that all of these are actively used

*/

gulp.task('custom-js', function() {

    return gulp.src('./source/js/custom/*.js')

    .pipe(concat('custom.js'))

    .pipe(gulp.dest('dev/assets/js'))

    .pipe(connect.reload());

});



/**

 * Looks through our javascript files and detects which

 * features of modernizr we are using and generates a custom

 * modernizr build using only those

 */

gulp.task('modernizr', function() {

    gulp.src('./dev/assets/js/**/*.js')

    .pipe(modernizr({

        "options": [

            "setClasses",

            "addTest",

            "html5printshiv",

            "testProp",

            "fnBind",

            "prefixed"

        ],

    }))

    .pipe(gulp.dest("./dev/assets/js/"))

});



/**

 * Build everything from the dev folder to the dist folder

 */

gulp.task('build', function() {

    gulp.src('./dev/**/*')

    .pipe(gulp.dest('./dist'));

});





gulp.task('default', ['sass', 'nunjucks', 'vendor-js', 'vendor-css', 'custom-js', 'fonts', 'images', 'watch-sass', 'watch-html', 'watch-js', 'serve']);
