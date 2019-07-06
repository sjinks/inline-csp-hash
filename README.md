# inline-csp-hash

[![Build Status](https://travis-ci.com/sjinks/inline-csp-hash.svg?branch=master)](https://travis-ci.com/sjinks/inline-csp-hash)

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
    .pipe(hashmap({
      what: 'script',
      replace_cb: (s, hashes) => s.replace(/script-src 'self'[^;]*/, "script-src 'self' " + hashes.join(" "))
    }))
    .pipe(hashmap({
      what: 'style',
      replace_cb: (s, hashes) => s.replace(/style-src 'self'[^;]*/, "style-src 'self' " + hashes.join(" "))
    }))
    .pipe(gulp.dest('dist/'))
  ;
});
```

## Options

* what: `script` (default) or `style`: which tags to process (scripts and styles are processed separately because they are controlled by different CSP directives: `script-src` and `style-src`)
* hash: `sha256` (default), `sha384`, or `sha512`: hash algorithm to use. SHA family is the only one according to [the specification](https://w3c.github.io/webappsec-csp/2/#source-list-valid-hashes)
* replace_cb: callback to inject gathered hashes into the source file

## Tests

Have [mocha](https://mochajs.org/) installed and run `npm test`
