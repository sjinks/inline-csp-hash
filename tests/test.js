const path = require('path');
const fs = require('fs');
const hashstream = require('..');
const Vinyl = require('vinyl');
const tap = require('tap');

function fixtures (glob) {
  return path.join(__dirname, 'fixtures', glob);
}

let hashes, sha;

/* istanbul ignore next */
function onStreamError (t, err) {
  t.fail(err);
  t.end();
}

function onStreamFinish (t) {
  t.equals(hashes.length, sha.length);
  for (let i = 0; i < sha.length; ++i) {
    t.equals(hashes[i], sha[i]);
  }

  t.end();
}

function run (name, hash, what, t) {
  let srcFile = new Vinyl({
    path: fixtures(name + '.html'),
    cwd: 'test/',
    base: fixtures(''),
    contents: fs.readFileSync(fixtures(name + '.html'))
  });

  sha = fs.readFileSync(fixtures(name + '.' + hash), { encoding: 'utf8' }).split('\n').filter((s) => s.length > 0);
  let stream = hashstream({
    hash,
    what,
    replace_cb: (s, h) => {
      hashes = h.map((x) => x.replace(/'/g, ''));
      return s;
    }
  });

  stream.on('error', onStreamError.bind(null, t));
  stream.on('finish', onStreamFinish.bind(null, t));

  stream.write(srcFile);
  stream.end();
}

function runWithoutCallback (name, hash, what, t) {
  let srcFile = new Vinyl({
    path: fixtures(name + '.html'),
    cwd: 'test/',
    base: fixtures(''),
    contents: fs.readFileSync(fixtures(name + '.html'))
  });

  let stream = hashstream({
    hash,
    what,
    replace_cb: null
  });

  stream.on('error', onStreamError.bind(null, t));

  stream.on('finish', (/* newFile */) => {
    t.pass();
    t.end();
  });

  stream.write(srcFile);
  stream.end();
}

tap.test('should hash scripts correctly', function (t) {
  const name = 'single-script';
  t.test('#sha256', function (t) { run(name, 'sha256', 'script', t); });
  t.test('#sha384', function (t) { run(name, 'sha384', 'script', t); });
  t.test('#sha512', function (t) { run(name, 'sha512', 'script', t); });
  t.end();
});

tap.test('should hash styles correctly', function (t) {
  const name = 'single-style';
  t.test('#sha256', function (t) { run(name, 'sha256', 'style', t); });
  t.test('#sha384', function (t) { run(name, 'sha384', 'style', t); });
  t.test('#sha512', function (t) { run(name, 'sha512', 'style', t); });
  t.end();
});

tap.test('should hash multiple script tags', function (t) {
  const name = 'multiple-scripts';
  t.test('#sha256', function (t) { run(name, 'sha256', 'script', t); });
  t.test('#sha384', function (t) { run(name, 'sha384', 'script', t); });
  t.test('#sha512', function (t) { run(name, 'sha512', 'script', t); });
  t.end();
});

tap.test('should ignore scripts with src attribute', function (t) {
  const name = 'script-src';
  t.test('#sha256', function (t) { run(name, 'sha256', 'script', t); });
  t.test('#sha384', function (t) { run(name, 'sha384', 'script', t); });
  t.test('#sha512', function (t) { run(name, 'sha512', 'script', t); });
  t.end();
});

tap.test('should throw an exception on invalid hash', function (t) {
  t.throws(() => hashstream({ hash: 'invalid' }));
  t.end();
});

tap.test('should handle invalid callbacks', function (t) {
  const name = 'script-src';
  runWithoutCallback(name, 'sha256', 'script', t);
});
