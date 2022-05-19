const cheerio = require('cheerio');
const crypto = require('crypto');
const through2 = require('through2');

const defaults = {
  what: 'script',
  hash: 'sha256',
  replace_cb: null
};

function mapItems (html, { what, attrs = false }, callback) {
  const $ = cheerio.load(html);
  const inlineElementHashes = $(what + ':not([src])').map((i, el) => callback($(el).html())).toArray();

  if (attrs) {
    const inlineAttributeHashes = [];
    if (what === 'style') {
      inlineAttributeHashes.push(...$('[style]').map((i, el) => callback($(el).attr('style'))).toArray());
    } else if (what === 'script') {
      const eventHandlerRe = /^on/i;
      const jsUrlRe = /^javascript\:/i;
      $('*').each(function (i, el) {
        for (const attrName in el.attribs) {
          // event handler
          if (eventHandlerRe.test(attrName)) {
            inlineAttributeHashes.push(callback(el.attribs[attrName]));
          }
          // javscript url
          if (jsUrlRe.test(el.attribs[attrName])) {
            inlineAttributeHashes.push(callback(el.attribs[attrName].split(jsUrlRe)[1]));
          }
        }
      });
    }
    return inlineElementHashes.concat(inlineAttributeHashes);
  }

  return inlineElementHashes;
}

function hashstream (opts) {
  opts = Object.assign({}, defaults, opts);

  if (!/^sha(256|384|512)$/.test(opts.hash)) {
    throw new Error('Only sha256/384/512 hashes are supported.');
  }

  const hash = s => crypto.createHash(opts.hash).update(s).digest('base64');

  return through2.obj((file, enc, callback) => {
    const content = file.contents;
    const hashes = mapItems(content, opts, hash).map(h => `'${opts.hash}-${h}'`);

    if (typeof opts.replace_cb === 'function') {
      const s = opts.replace_cb(content.toString(), hashes);
      file.contents = Buffer.from(s, enc);
    }

    callback(null, file);
  });
}

module.exports = hashstream;
