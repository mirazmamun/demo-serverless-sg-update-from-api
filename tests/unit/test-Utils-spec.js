const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const Utils = require('../../lib/Utils');
const _ = require('lodash');
it('should validate IP', function () {
    var validIps = [ '0.0.0.0', '1.2.3.4' ];
    _.each(validIps, (vip) => {
        expect(Utils.validateIP(vip)).to.be.true;
    })
    var invalidIps = [ '0.0.0.0.3', '1.2.3.300', '1.4.78' ];
    _.each(invalidIps, (ivip) => {
        expect(Utils.validateIP(ivip)).to.be.false;
    })
});
it('should validate SG name', function () {
    var validSGNames = [ 'test-sg-name', 'Test-SG-Name' ];
    _.each(validSGNames, (sgName) => {
        expect(Utils.validateSGName(sgName)).to.be.true;
    })
});

it('should get valid response from API', function (done) {
    Utils.getResponseFromAPI()
        .then((res) => {
            console.log(res);
            expect(res).to.be.an('string');
            done();
        })
        .catch((err) => {
            expect(err).to.be.undefined;
        })
});
it('should get formulated response from Github API', function (done) {
    Utils.getIPFromGithubAPI()
        .then((res) => {
            console.log(res);
            expect(res).to.be.an('array');
            done();
        })
        .catch((err) => {
            expect(err).to.be.undefined;
        })
});