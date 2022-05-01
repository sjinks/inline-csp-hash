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

function run (name, hash, what, done) {
  const srcFile = new Vinyl({
    path: fixtures(name + '.html'),
    cwd: 'test/',
    base: fixtures(''),
    contents: fs.readFileSync(fixtures(name + '.html'))
  });

  sha = fs.readFileSync(fixtures(name + '.' + hash), { encoding: 'utf8' }).split('\n').filter((s) => s.length > 0);
  const stream = hashstream({
    hash,
    what,
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
    path: fixtures(name + '.html'),
    cwd: 'test/',
    base: fixtures(''),
    contents: fs.readFileSync(fixtures(name + '.html'))
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

describe('should hash scripts correctly', function () {
  const name = 'single-script';
  it('#sha256', function (done) { run(name, 'sha256', 'script', done); });
  it('#sha384', function (done) { run(name, 'sha384', 'script', done); });
  it('#sha512', function (done) { run(name, 'sha512', 'script', done); });
});

describe('should hash styles correctly', function () {
  const name = 'single-style';
  it('#sha256', function (done) { run(name, 'sha256', 'style', done); });
  it('#sha384', function (done) { run(name, 'sha384', 'style', done); });
  it('#sha512', function (done) { run(name, 'sha512', 'style', done); });
});

describe('should hash multiple script tags', function () {
  const name = 'multiple-scripts';
  it('#sha256', function (done) { run(name, 'sha256', 'script', done); });
  it('#sha384', function (done) { run(name, 'sha384', 'script', done); });
  it('#sha512', function (done) { run(name, 'sha512', 'script', done); });
});

describe('should hash multiple style tags', function () {
  const name = 'multiple-style';
  it('#sha256', function (done) { run(name, 'sha256', 'style', done); });
  it('#sha384', function (done) { run(name, 'sha384', 'style', done); });
  it('#sha512', function (done) { run(name, 'sha512', 'style', done); });
});

describe('should ignore scripts with src attribute', function () {
  const name = 'script-src';
  it('#sha256', function (done) { run(name, 'sha256', 'script', done); });
  it('#sha384', function (done) { run(name, 'sha384', 'script', done); });
  it('#sha512', function (done) { run(name, 'sha512', 'script', done); });
});

it('should throw an exception on invalid hash', function () {
  expect(() => hashstream({ hash: 'invalid' })).to.throw();
});

it('should handle invalid callbacks', function (done) {
  const name = 'script-src';
  runWithoutCallback(name, 'sha256', 'script', done);
});
