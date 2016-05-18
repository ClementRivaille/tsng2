var lr			= require('tiny-lr'),
	gulp		= require('gulp'),
	pug			= require('gulp-pug'),
	livereload	= require('gulp-livereload'),
	csso		= require('gulp-csso'),
	imagemin	= require('gulp-imagemin'),
	uglify		= require('gulp-uglify'),
	concat		= require('gulp-concat'),
	connect		= require('connect'),
	static		= require('serve-static'),
	ts			= require('gulp-typescript'),
	tsProject	= ts.createProject('tsconfig.json', {typescript: require('typescript')}),
	server		= lr(),
	send		= require('send'),
	sass		= require('gulp-sass'),
	sourcemaps	= require('gulp-sourcemaps');

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('vendor', function() {
	gulp.src([
		'./node_modules/angular2/bundles/angular2-polyfills.js',
		'./node_modules/systemjs/dist/system.src.js',
		'./node_modules/rxjs/bundles/Rx.js',
		'./node_modules/angular2/bundles/angular2.dev.js',
		'./node_modules/angular2/bundles/router.dev.js',
	]).pipe(gulp.dest('./build/vendor/'));
});

gulp.task('pug', function() {
	gulp.src(['./src/pug/**/*.pug', '!./src/pug/_*.pug'])
		.pipe(pug({
			pretty: true
		}))
		.on('error', console.log)
	.pipe(gulp.dest('./build/'))
	.pipe(livereload(server));
});

gulp.task('js', function() {
	gulp.src(['./src/js/**/*.js', '!./src/js/vendor/**/*.js'])
		.pipe(gulp.dest('./build/js'))
		.pipe(livereload(server));
});

gulp.task('ts', function() {
	gulp.src(['./src/ts/**/*.ts'])
	  .pipe(ts(tsProject))
	  .pipe(gulp.dest('build/ts'))
	  .pipe(livereload(server));	
});

gulp.task('electron', function() {
	gulp.src(['./src/electron/**/*'])
		.pipe(gulp.dest('./build'))
		.pipe(livereload(server));
});

gulp.task('images', function() {
	gulp.src('./src/img/**/*')
		.pipe(imagemin())
		.pipe(gulp.dest('./build/img'))
});

// TODO Don't fail on error
gulp.task('sass', function() {
  gulp.src('./src/scss/{,*/}*.{scss,sass}')
	.pipe(sourcemaps.init())
	.pipe(sass({
	  errLogToConsole: true
	}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('./build/css'));
})

gulp.task('http-server', function() {
	connect()
		.use(require('connect-livereload')())
		.use(static('./build'))
		.use(function(req, res, next) {
			send(req, './build/index.html').pipe(res);
		})
		.listen('9000');

	console.log('Server listening on http://localhost:9000');
});

// Use watch to continious building
gulp.task('watch', function() {
	gulp.run('build');

	server.listen(35729, function(err) {
		if (err) return console.log(err);

		gulp.watch('src/pug/**/*.pug', ['pug']);
		gulp.watch('src/img/**/*', ['images']);
		gulp.watch('src/js/**/*', ['js']);
		gulp.watch('src/ts/**/*', ['ts']);
		gulp.watch('src/electron/**/*', ['electron']);
		gulp.watch('src/scss/{,*/}*.{scss,sass}', ['sass']);
	});
	gulp.run('http-server');
});

// Not ready...
gulp.task('build', function() {
	gulp.run('pug');
	gulp.run('images');
	gulp.run('js');
	gulp.run('ts');
	gulp.run('electron');
	gulp.run('vendor');
	gulp.run('sass');

	// TODO Minify, uglify, etc.
});
