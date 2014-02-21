var assert = require('assert')
  , neo4node = require('../lib/index')
  , db = new neo4node('neo4node.sb01.stations.graphenedb.com', '24789', 'neo4node', 'cL4IxXL7xCHY3pTYEKoS')
  , should = require('should');

describe('GraphDB', function(){
  describe('Graph static methods - neo4node.Graph', function(){
    it('Should get server version - neo4node.Graph.getVersion()', function(done) {
      db.getVersion(function(err, version) {
        should.not.exist(err);
        done();
      });
    });
  });
});