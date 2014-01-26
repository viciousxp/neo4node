var assert = require('assert')
  , QueryBuilder = require('../lib/QueryBuilder')
  , Transaction = require('../lib/Transaction')
  , neo4node = require('../index')
  , db = new neo4node.Neo4j()
  , should = require('should');



describe('Node', function (){
    describe('Node graph setup', function () {
      var nodes = [],
          nodeObjects = [];
      it('Should create four new nodes', function (done) {
          var query = new QueryBuilder();
          
          query.config({format: ['rest', 'graph']})
               //.addNode()
               //.addNode({name: 'Trinity', gender: 'female'})
               .addStatement('START node = node(59) OPTIONAL MATCH node -[r]- () RETURN node, r')
               .execute(function (err, results) {
                  console.log('err1: ' + err);
                  // query.addNode({name: 'Morpheus', role: 'El capitain'})
                  //      .addNode({name: 'Smith'})
                  //      .commit(function (err, results) {
                  //        console.log('err2: ' + err);
                         done()
                       // })
               })
      })
      after(function (done) {
          var transaction = new Transaction();
          transaction.format = 'REST';
          transaction.addStatement('START node = node(*) DELETE node');
          transaction.commit(function (err, results) {
            should.not.exist(err);
          })
          done()
      })
    });
});