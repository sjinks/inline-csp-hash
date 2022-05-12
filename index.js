const cheerio = require('cheerio');
const crypto = require('crypto');
const through2 = require('through2');

const defaults = {
  what: 'script',
  hash: 'sha256',
  replace_cb: null
};

function mapItems (html, what, callback) {
  const $ = cheerio.load(html);
  return $(what + ':not([src])').map((i, el) => callback($(el).html())).toArray();
}

function hashstream (opts) {
  opts = Object.assign({}, defaults, opts);

  if (!/^sha(256|384|512)$/.test(opts.hash)) {
    throw new Error('Only sha256/384/512 hashes are supported.');
  }

  const hash = (s) => crypto.createHash(opts.hash).update(s).digest('base64');

  return through2.obj((file, enc, callback) => {
    const content = file.contents;
    const hashes = mapItems(content, opts.what, hash).map(h => `'${opts.hash}-${h}'`);

    if (typeof opts.replace_cb === 'function') {
      const s = opts.replace_cb(content.toString(), hashes);
      file.contents = Buffer.from(s, enc);
    }

    callback(null, file);
  });
}

module.exports = hashstream;
