var assert = require('assert')
  , neo4node = require('../index')
  , should = require('should');

describe('GraphDB', function(){
  describe('Graph static methods - neo4node.Graph', function(){
    it('Should get server version - neo4node.Graph.getVersion()', function(done) {
      neo4node.Graph.getVersion(function(err, version) {
        should.not.exist(err);
        done();
      });
    });
  });
});