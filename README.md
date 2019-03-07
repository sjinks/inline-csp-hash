# inline-csp-hash

Plugin to generate hash for inline scripts and styles for CSP.

This plugin is insipred by [hash-csp](https://github.com/chrahunt/hash-csp), and operates the same way.

Example:

```javascript
const gulp       = require('gulp');
const hashstream = require('inline-csp-hash');
const replace    = require('gulp-replace');

gulp.task('inline-hash:scripts', (done) => {
	gulp.src('dist/*.html')
		.pipe(hashmap({ what: 'script' }, (hashes) => {
			let fragment = hashes.map(h => `'${h}'`).join(" ");
			gulp.src('dist/*.html')
				.pipe(replace(/script-src 'self'[^;]*/, "script-src 'self' " + fragment))
				.pipe(gulp.dest('dist/'))
			;

			done();
		}))
	;
});

gulp.task('inline-hash:styles', (done) => {
	gulp.src('dist/*.html')
		.pipe(hashmap({ what: 'style' }, (hashes) => {
			let fragment = hashes.map(h => `'${h}'`).join(" ");
			gulp.src('dist/*.html')
				.pipe(replace(/style-src 'self'[^;]*/, "style-src 'self' " + fragment))
				.pipe(gulp.dest('dist/'))
			;

			done();
		}))
	;
});
```
