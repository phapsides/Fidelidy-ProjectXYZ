var gulp         = require( 'gulp' );
var sass         = require( 'gulp-sass' );
var compass      = require( 'gulp-compass' );
var autoprefixer = require( 'gulp-autoprefixer' );
var concat       = require( 'gulp-concat' );
var serve        = require( 'gulp-serve' );
var browserSync  = require( 'browser-sync' ).create();
var rjs          = require( 'gulp-requirejs' );
var uglify       = require( 'gulp-uglify' );
var minifyCss    = require( 'gulp-minify-css' );
var imagemin     = require( 'gulp-imagemin' );
var pngquant     = require( 'imagemin-pngquant' );
var minifyHTML   = require( 'gulp-minify-html' );

// Concatenate vendor css into one file
gulp.task( 'vendorcss', function() {
  return gulp.src( [
        './bower_components/chartist/dist/chartist.min.css',
        './bower_components/owl.carousel/dist/assets/owl.carousel.min.css',
        './bower_components/owl.carousel/dist/assets/owl.theme.default.min.css'
    ] ).pipe( concat( 'vendor.css' ) )
    .pipe( gulp.dest( './css/' ) )
    .pipe( browserSync.stream() );
} );

// Compile sass into CSS & auto-inject into browsers
gulp.task( 'compass', function() {
    return gulp.src( './scss/**/**/*.scss' )
        .pipe( compass( {
            css:  './css',
            sass: './scss'
        } ) )
        .pipe( autoprefixer( {
            browsers: [ 'last 5 versions', 'ie > 9' ],
            cascade: false
        } ) )
        .pipe( gulp.dest( './css' ) )
        .pipe( browserSync.stream() );
});

// Create a local server
gulp.task( 'serve', [ 'compass' ], function() {
    browserSync.init( {
        server: {
            baseDir: './'
        }
    } );

    gulp.watch( './scss/**/*.scss', [ 'compass' ] );
    gulp.watch( './*.html' ).on( 'change', browserSync.reload );
} );

// Build the app for production
gulp.task( 'build', function() {
    // Copy accross fonts
    gulp.src( './fonts/*' )
        .pipe( gulp.dest( './dist/fonts' ) );

    // Copy accross images
    gulp.src( './images/**/*' )
        .pipe( imagemin( {
            progressive: true,
            use: [ pngquant() ]
        } ) )
        .pipe( gulp.dest( './dist/images' ) );

    // Copy the requirejs script to load the others
    gulp.src( './bower_components/requirejs/require.js' )
        .pipe( uglify() )
        .pipe( gulp.dest( './dist/bower_components/requirejs/' ) );

    // Copy the placeholder shim for ie
    gulp.src( './bower_components/placeholders/dist/placeholders.min.js' )
        .pipe( uglify() )
        .pipe( gulp.dest( './dist/bower_components/placeholders/dist/' ) );

    // Copy the matchMedia shim for ie
    gulp.src( './bower_components/matchMedia/matchMedia.js' )
        .pipe( uglify() )
        .pipe( gulp.dest( './dist/bower_components/matchMedia/' ) );

    // Minify and copy js
    rjs( {
        name: "learn.main",
        baseUrl: './js',
        mainConfigFile: 'js/learn.main.js',
        out: 'learn.main.js',
        shim: {
            // standard require.js shim options
        },
    } )
        .pipe( uglify() )
        .pipe( gulp.dest( './dist/js/' ) );

    rjs( {
        name: "home.main",
        baseUrl: './js',
        mainConfigFile: 'js/home.main.js',
        out: 'home.main.js',
        shim: {
            // standard require.js shim options
        },
    } )
        .pipe( uglify() )
        .pipe( gulp.dest( './dist/js/' ) );

    rjs( {
        name: "account.main",
        baseUrl: './js',
        mainConfigFile: 'js/account.main.js',
        out: 'account.main.js',
        shim: {
            // standard require.js shim options
        },
    } )
        .pipe( uglify() )
        .pipe( gulp.dest( './dist/js/' ) );

    // Copy and minify css
    gulp.src( './css/*.css' )
        .pipe( minifyCss() )
        .pipe( gulp.dest( './dist/css' ) );

    // Copy html
    gulp.src( "./**/*.html" )
        .pipe( minifyHTML( {} ) )
        .pipe( gulp.dest( './dist' ) );

} );

gulp.task( 'default', [ 'compass', 'vendorcss' ] );
