/* eslint no-sync: "off" */
/* global describe, it, __dirname */
const path       = require('path');
const vfs        = require('vinyl-fs');
const fs         = require('fs');
const hashstream = require('..');
const expect     = require('chai').expect;

function fixtures(glob)
{
	return path.join(__dirname, 'fixtures', glob);
}

function run(name, hash, what, done)
{
	const sha = fs.readFileSync(fixtures(name + '.' + hash), { encoding: "utf8" }).split("\n");
	vfs.src(fixtures(name + '.html'))
		.pipe(
			hashstream({hash, what}, (h) => {
				expect(h).to.have.length(sha.length);
				for (let i=0; i<sha.length; ++i) {
					expect(h[i]).to.equal(sha[i]);
				}

				done();
			})
		)
	;
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
});
