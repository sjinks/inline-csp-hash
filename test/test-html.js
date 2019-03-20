/* eslint no-sync: "off" */
/* global describe, it, __dirname */
const path       = require('path');
const fs         = require('fs');
const hashstream = require('..');
const expect     = require('chai').expect;
const vinyl      = require('vinyl');

function fixtures(glob)
{
	return path.join(__dirname, 'fixtures', glob);
}

function run(name, hash, what, done)
{
	let srcFile = new vinyl({
		path: fixtures(name + '.html'),
		cwd: 'test/',
		base: fixtures(''),
		contents: fs.readFileSync(fixtures(name + '.html'))
	});

	let hashes;
	const sha  = fs.readFileSync(fixtures(name + '.' + hash), { encoding: "utf8" }).split("\n").filter((s) => s.length > 0);
	let stream = hashstream({
		hash, what,
		replace_cb: (s, h) => {
			hashes = h.map((x) => x.replace(/'/g, ''));
			return s;
		}
	});

	stream.on('error', (err) => {
		expect(err).to.not.exist;
		done(err);
	});

	stream.on('data', (newFile) => {
		expect(hashes).to.have.length(sha.length);
		for (let i=0; i<sha.length; ++i) {
			expect(hashes[i]).to.equal(sha[i]);
		}

		done();
	});

	stream.write(srcFile);
	stream.end();
}

describe('hashing', function() {
	describe('should hash scripts correctly', function() {
		const name = "single-script";
		it('#sha256', function(done) { run(name, 'sha256', 'script', done); });
		it('#sha384', function(done) { run(name, 'sha384', 'script', done); });
		it('#sha512', function(done) { run(name, 'sha512', 'script', done); });
	});

	describe('should hash styles correctly', function() {
		const name = "single-style";
		it('#sha256', function(done) { run(name, 'sha256', 'style', done); });
		it('#sha384', function(done) { run(name, 'sha384', 'style', done); });
		it('#sha512', function(done) { run(name, 'sha512', 'style', done); });
	});

	describe('should hash multiple script tags', function() {
		const name = "multiple-scripts";
		it('#sha256', function(done) { run(name, 'sha256', 'script', done); });
		it('#sha384', function(done) { run(name, 'sha384', 'script', done); });
		it('#sha512', function(done) { run(name, 'sha512', 'script', done); });
	});

	describe('should ignore scripts with src attribute', function() {
		const name = "script-src";
		it('#sha256', function(done) { run(name, 'sha256', 'script', done); });
		it('#sha384', function(done) { run(name, 'sha384', 'script', done); });
		it('#sha512', function(done) { run(name, 'sha512', 'script', done); });
	});
});
