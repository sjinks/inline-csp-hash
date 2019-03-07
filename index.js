const cheerio  = require('cheerio');
const crypto   = require('crypto');
const through2 = require('through2');

let defaults = {
	what:       'script',
	hash:       'sha256',
	replace_cb: null
};

function mapItems(html, what, callback)
{
	const $ = cheerio.load(html);
	return $(what + ':not([src])').map((i, el) => callback($(el).text())).toArray();
}

function hashstream(opts)
{
	opts = Object.assign({}, defaults, opts);

	if (!/^sha(256|384|512)$/.test(opts.hash)) {
		throw new Error("Only sha256/384/512 hashes are supported.");
	}

	const hash = function(s) {
		return crypto.createHash(opts.hash).update(s).digest('base64');
	};

	let hashes = [];
	return through2.obj((file, enc, callback) => {
		let content = file.contents;
		let result  = mapItems(content, opts.what, hash).map(h => `${opts.hash}-${h}`);
		hashes.push(...result);

		if (typeof opts.replace_cb === 'function') {
			let s = content.toString();
			s     = opts.replace_cb(s, hashes);
			file.contents = new Buffer(s, enc);
		}

		callback(null, file);
	});
}

module.exports = hashstream;
