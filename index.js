const cheerio  = require('cheerio');
const writable = require('readable-stream').Writable;
const crypto   = require('crypto');

let defaults = {
	what: 'script',
	hash: 'sha256'
};

function mapItems(html, what, callback)
{
	const $ = cheerio.load(html);
	return $(what + ':not([src])').map((i, el) => callback($(el).text())).toArray();
}

function hashstream(opts, cb)
{
	if (typeof opts === 'function') {
		cb   = opts;
		opts = {};
	}

	opts = Object.assign({}, defaults, opts);

	if (!/^sha(256|384|512)$/.test(opts.hash)) {
		throw new Error("Only sha256/384/512 hashes are supported.");
	}

	const hash = function(s) {
		return crypto.createHash(opts.hash).update(s).digest('base64');
	};

	let hashes = [];
	let rcv    = new writable({ objectMode: true });
	rcv._write = (file, enc, next) => {
		let result = mapItems(file.contents, opts.what, hash).map(h => `${opts.hash}-${h}`);
		hashes.push(...result);
		next();
	};

	if (cb) {
		rcv.on('finish', () => cb(hashes));
	}

	return rcv;
}

module.exports = hashstream;
