const path = require('path');
const fs = require('fs');
const hashstream = require('..');
const Vinyl = require('vinyl');
const { expect } = require('chai');

function fixtures (glob) {
  return path.join(__dirname, 'fixtures', glob);
}

let hashes, sha;

/* istanbul ignore next */
function onStreamError (err) {
  expect.fail(err.message)
}

function onStreamFinish (done) {
  expect(hashes.length).to.equal(sha.length);
  for (let i = 0; i < sha.length; ++i) {
    expect(hashes[i]).to.equal(sha[i]);
  }

  done();
}

function run (name, hash, { what, attrs, hashName = false }, done) {
  const srcFile = new Vinyl({
    path: fixtures(`${name}.html`),
    cwd: 'test/',
    base: fixtures(''),
    contents: fs.readFileSync(fixtures(`${name}.html`))
  });

  const hashFixture = hashName ? fixtures(`${hashName}.${hash}`) : fixtures(`${name}.${hash}`);
  sha = fs.readFileSync(hashFixture, { encoding: 'utf8' }).split('\n').filter((s) => s.length > 0);
  const stream = hashstream({
    hash,
    what,
    attrs,
    replace_cb: (s, h) => {
      hashes = h.map((x) => x.replace(/'/g, ''));
      return s;
    }
  });

  stream.on('error', onStreamError);
  stream.on('finish', onStreamFinish.bind(null, done));

  stream.write(srcFile);
  stream.end();
}

function runWithoutCallback (name, hash, what, done) {
  const srcFile = new Vinyl({
    path: fixtures(`${name}.html`),
    cwd: 'test/',
    base: fixtures(''),
    contents: fs.readFileSync(fixtures(`${name}.html`))
  });

  const stream = hashstream({
    hash,
    what,
    replace_cb: null
  });

  stream.on('error', onStreamError.bind(null, done));

  stream.on('finish', (/* newFile */) => {
    done();
  });

  stream.write(srcFile);
  stream.end();
}

const optsScriptOnly = {
  what: 'script'
};
const optsStyleOnly = {
  what: 'style'
};
const optsScriptAttr = {
  what: 'script',
  attrs: true
};
const optsStyleAttr = {
  what: 'style',
  attrs: true
};

describe('should hash scripts correctly', () => {
  const name = 'single-script';
  it('#sha256', done => { run(name, 'sha256', optsScriptOnly, done); });
  it('#sha384', done => { run(name, 'sha384', optsScriptOnly, done); });
  it('#sha512', done => { run(name, 'sha512', optsScriptOnly, done); });
});

describe('should hash styles correctly', () => {
  const name = 'single-style';
  it('#sha256', done => { run(name, 'sha256', optsStyleOnly, done); });
  it('#sha384', done => { run(name, 'sha384', optsStyleOnly, done); });
  it('#sha512', done => { run(name, 'sha512', optsStyleOnly, done); });
});

describe('should hash multiple script tags', () => {
  const name = 'multiple-scripts';
  it('#sha256', done => { run(name, 'sha256', optsScriptOnly, done); });
  it('#sha384', done => { run(name, 'sha384', optsScriptOnly, done); });
  it('#sha512', done => { run(name, 'sha512', optsScriptOnly, done); });
});

describe('should hash multiple script tags and attributes', () => {
  const name = 'multiple-scripts-attr';
  it('#sha256', done => { run(name, 'sha256', optsScriptAttr, done); });
  it('#sha384', done => { run(name, 'sha384', optsScriptAttr, done); });
  it('#sha512', done => { run(name, 'sha512', optsScriptAttr, done); });
});

describe('should hash multiple script tags (no attribute scripts) with `attrs` option', () => {
  const name = 'multiple-scripts';
  it('#sha256', done => { run(name, 'sha256', optsScriptAttr, done); });
  it('#sha384', done => { run(name, 'sha384', optsScriptAttr, done); });
  it('#sha512', done => { run(name, 'sha512', optsScriptAttr, done); });
});

describe('should hash multiple script tags and ignore style attributes', () => {
  const name = 'multiple-scripts-attr'; // includes attr script
  const opts = {                  // scripts only, no attr
    ...optsScriptOnly,            // attrs == false
    hashName: 'multiple-scripts'  // no attr hash
  };
  it('#sha256', done => { run(name, 'sha256', opts, done); });
  it('#sha384', done => { run(name, 'sha384', opts, done); });
  it('#sha512', done => { run(name, 'sha512', opts, done); });
});

describe('should hash multiple style tags', () => {
  const name = 'multiple-style';
  it('#sha256', done => { run(name, 'sha256', optsStyleOnly, done); });
  it('#sha384', done => { run(name, 'sha384', optsStyleOnly, done); });
  it('#sha512', done => { run(name, 'sha512', optsStyleOnly, done); });
});

describe('should hash multiple style tags and attributes', () => {
  const name = 'multiple-style-attr';
  it('#sha256', done => { run(name, 'sha256', optsStyleAttr, done); });
  it('#sha384', done => { run(name, 'sha384', optsStyleAttr, done); });
  it('#sha512', done => { run(name, 'sha512', optsStyleAttr, done); });
});

describe('should hash multiple style tags (no attribute styles) with `attrs` option', () => {
  const name = 'multiple-style';
  it('#sha256', done => { run(name, 'sha256', optsStyleAttr, done); });
  it('#sha384', done => { run(name, 'sha384', optsStyleAttr, done); });
  it('#sha512', done => { run(name, 'sha512', optsStyleAttr, done); });
});

describe('should hash multiple style tags and ignore style attributes', () => {
  const name = 'multiple-style-attr'; // includes attr style
  const opts = {                // styles only, no attr
    ...optsStyleOnly,           // attrs == false
    hashName: 'multiple-style'  // no attr hash
  };
  it('#sha256', done => { run(name, 'sha256', opts, done); });
  it('#sha384', done => { run(name, 'sha384', opts, done); });
  it('#sha512', done => { run(name, 'sha512', opts, done); });
});

describe('should ignore scripts with src attribute', () => {
  const name = 'script-src';
  it('#sha256', done => { run(name, 'sha256', optsScriptOnly, done); });
  it('#sha384', done => { run(name, 'sha384', optsScriptOnly, done); });
  it('#sha512', done => { run(name, 'sha512', optsScriptOnly, done); });
});

it('should throw an exception on invalid hash', () => {
  expect(() => hashstream({ hash: 'invalid' })).to.throw();
});

it('should handle invalid callbacks', done => {
  const name = 'script-src';
  runWithoutCallback(name, 'sha256', 'script', done);
});
