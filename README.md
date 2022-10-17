# inline-csp-hash

![Build and Test CI](https://github.com/sjinks/inline-csp-hash/workflows/Build%20and%20Test%20CI/badge.svg)
[![npm version](https://img.shields.io/npm/v/inline-csp-hash.svg)](https://www.npmjs.com/package/inline-csp-hash)

Plugin to generate hash for inline scripts and styles for CSP.

This plugin is insipred by [hash-csp](https://github.com/chrahunt/hash-csp), and operates mostly the same way.

## Installation

```bash
npm install inline-csp-hash --save
```

## Usage

```javascript
const gulp = require('gulp');
const hashstream = require('inline-csp-hash');

gulp.task('inline-hash', () => {
  return gulp.src('src/*.html')
    .pipe(hashstream({
      what: 'script',
      replace_cb: (s, hashes) => s.replace(/script-src 'self'[^;]*/, "script-src 'self' " + hashes.join(" "))
    }))
    .pipe(hashstream({
      what: 'style',
      replace_cb: (s, hashes) => s.replace(/style-src 'self'[^;]*/, "style-src 'self' " + hashes.join(" "))
    }))
    .pipe(gulp.dest('dist/'))
  ;
});
```

## Options

* what: `script` (default) or `style`: which tags to process (scripts and styles are processed separately because they are controlled by different CSP directives: `script-src` and `style-src`)
* attrs: `false` (default) or `true`: pick up and include script or style inline attributes in hashes
* hash: `sha256` (default), `sha384`, or `sha512`: hash algorithm to use. SHA family is the only one according to [the specification](https://w3c.github.io/webappsec-csp/2/#source-list-valid-hashes)
* replace_cb: callback to inject gathered hashes into the source file

## Tests

Have [mocha](https://mochajs.org/) installed and run `npm test`
