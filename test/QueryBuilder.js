var assert = require('assert')
  , QueryBuilder = require('../lib/QueryBuilder')
  , Transaction = require('../lib/Transaction')
  , neo4node = require('../index')
  , db = new neo4node.Neo4j()
  , should = require('should');



describe('Node', function (){
    describe('Node graph setup', function () {
      var nodes = [];
      it('Should create four new nodes', function (done) {
          var query = new QueryBuilder();
          
          query.config({format: ['rest']})
                .createNode()
                .createNode({name: 'Trinity', gender: 'female'})
                .createNode({name: 'Morpheus', role: 'El capitain'})
                .createNode({name: 'Smith'})
                .commit(function (err, results) {
                  results.rest.map(function (result) {
                    var node = new neo4node.Node(result.node);
                    //save node ids in array for tests
                    nodes.push(node.id);
                  })
                  done()
                })
      })
      it('Should get node by id', function (done) {
        var query = new QueryBuilder();

        query .getNodeById(nodes[0])
              .commit(function (err, result) {
                should.not.exist(err);
                var node = new neo4node.Node(result.rest[0].node);
                done();
              })
      });
      it('Should add labels to node', function (done) {
        var query = new QueryBuilder();

        query .setLabel(nodes[0], 'PERSON')
              .setLabel(nodes[1], 'PERSON')
              .setLabel(nodes[2], 'PERSON')
              .setLabel(nodes[3], 'PERSON')
              .commit(function (err, result) {
                should.not.exist(err);
                done();
              })
      });
      it('Should set properties to Neo', function (done) {
        var query = new QueryBuilder();

        query .setProperty(nodes[0], 'name', 'Neo')
              .setProperty(nodes[0], 'age', '29')
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      });
      it('Should remove label from Smith node', function (done) {
        var query = new QueryBuilder();

        query .setLabel(nodes[3])
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })
      it('Should remove property age from Neo node', function (done) {
        var query = new QueryBuilder();

        query .setProperty(nodes[0], 'Age')
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })
      it('Should update all of Neo\'s properties', function (done) {
        var query = new QueryBuilder();

        query .setProperties(nodes[0], {age: 29, name: 'The chosen one'})
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })
      it('Should create relationships between nodes', function (done) {
        var query = new QueryBuilder();

        query .createRelationship(nodes[0], nodes[1], 'KNOWS')
              .createRelationship(nodes[0], nodes[2], 'KNOWS')
              .createRelationship(nodes[0], nodes[3], 'KNOWS')
              .createRelationship(nodes[1], nodes[0], 'LOVES')
              .createRelationship(nodes[3], nodes[0], 'HATES')
              .createRelationship(nodes[0], nodes[3], 'KILLS')
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })
      it('Should get all of Neo\'s incoming relationships', function (done) {
        var query = new QueryBuilder();

        query .getIncomingRelationships(nodes[0])
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })
      it('Should get all of Neo\'s outgoing relationships', function (done) {
        var query = new QueryBuilder();

        query .getOutgoingRelationships(nodes[0])
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })
      it('Should get all of Neo\'s incoming LOVES relationships', function (done) {
        var query = new QueryBuilder();

        query .getIncomingRelationships(nodes[0], 'LOVES')
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })
      it('Should get all of Neo\'s outgoing KILLS relationships', function (done) {
        var query = new QueryBuilder();

        query .getOutgoingRelationships(nodes[0], 'KILLS')
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })
      it('Should get all of Neo\'s relationships', function (done) {
        var query = new QueryBuilder();

        query .getRelationships(nodes[0])
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })

      it('Should get all of Neo\'s adjacent nodes', function (done) {
        var query = new QueryBuilder();

        query .getAdjacentNodes(nodes[0])
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })
      it('Should get all of Neo\'s incoming nodes', function (done) {
        var query = new QueryBuilder();

        query .getIncomingNodes(nodes[0])
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })
      it('Should get all of Neo\'s outgoing nodes', function (done) {
        var query = new QueryBuilder();

        query .getOutgoingNodes(nodes[0])
              .commit(function (err, results) {
                should.not.exist(err);
                done();
              })
      })
      after(function (done) {
        var query = new QueryBuilder();

        query .deleteNode(nodes[0], true)
              .deleteNode(nodes[1], true)
              .deleteNode(nodes[2], true)
              .deleteNode(nodes[3], true)
              .commit(function (err, results) {
                should.not.exist(err);
                done()
              })
      })
    });
});