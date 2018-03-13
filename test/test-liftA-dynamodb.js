let arw = require('liftA')();
let env = require('./dev.env.json');
let should = require('should');
let dyna = require('../liftA-dynamodb');

describe('liftA-dynamodb', function () {
  describe('documentClient ', function () {
    let doc = (dyna(arw, env['aws-Dynamo-config'])).documentClient();
    describe('getA', function () {
      it('should get an item for an existing known id', function(done) {
        let testGetA = doc.getA.thenA(function (x) {
          x.should.not.be.instanceof(arw.Error);
          x.should.have.property('Item');
          x.Item.should.have.property('testValue');
          x.Item.testValue.should.be.equal('xyzzy');
          done();
        });
        testGetA.runA({ TableName: env['test-table-name'], Key: { id: 'xxx'} });
      });
      it('should not get an item for a non-existing id', function(done) {
        let testGetA = doc.getA.thenA(function (x) {
          console.log(x);
          x.should.not.be.instanceof(arw.Error);
          x.should.not.have.property('Item');
          done();
        });
        testGetA.runA({ TableName: env['test-table-name'], Key: { id: 'zzz'} });
      });
    });
  });
  describe('dynamo ', function () {
    let dynamo = dyna(arw, env['aws-Dynamo-config']);
    describe('getItemA', function () {
      it('should get an item for an existing known id', function(done) {
        let testGetItemA = dynamo.getItemA.thenA(function (x) {
          x.should.not.be.instanceof(arw.Error);
          x.should.have.property('Item');
          x.Item.should.have.property('testValue');
          x.Item.testValue.should.have.property('S');
          x.Item.testValue.S.should.be.equal('xyzzy');
          done();
        });
        testGetItemA.runA({ TableName: env['test-table-name'], Key: { id: { S: 'xxx' } } });
      });
      it('should not get an item for a non-existing id', function(done) {
        let testGetItemA = dynamo.getItemA.thenA(function (x) {
          console.log(x);
          x.should.not.be.instanceof(arw.Error);
          x.should.not.have.property('Item');
          done();
        });
        testGetItemA.runA({ TableName: env['test-table-name'], Key: { id: { S: 'zzz' } } });
      });
    });
  });
}) ;
