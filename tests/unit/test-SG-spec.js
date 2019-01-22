const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const SG = require('../../lib/SG');
it('should find an existing SG', function () {
    SG.findSG({sgName: SG.defaults().DEFAULT_SG_NAME})
        .then((res) => {
            console.log(res);
            expect(res).to.be.ok;
        })
        .catch((err) => {
            expect(err).to.be.undefined;
        })
});
it('should construct valid ingress rules', function () {
    var constructedRules = SG.constructSGIngressRule([ { protocol: 'tcp', IP: '8.8.8.8', port: 443 } ]);
    console.log(constructedRules);
    expect(constructedRules).to.be.an('array')
    .and.to.have.lengthOf(1);
});
it('should create or update SG with rules', function () {
    SG.createOrupdateSGRule(SG.defaults().DEFAULT_SG_NAME, [ { protocol: 'tcp', IP: '8.8.8.8', port: 443 } ])
        .then((res) => {
            console.log(res);
            expect(res).to.be.ok;
        })
        .catch((err) => {
            expect(err).to.be.undefined;
        })
});
it.only('should revoke all ingress rules', function () {
    SG.removeSG(SG.defaults().DEFAULT_SG_NAME)
        .then((res) => {
            console.log(res);
            expect(res).to.be.ok;
        })
        .catch((err) => {
            expect(err).to.be.undefined;
        })
});