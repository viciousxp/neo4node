var assert = require('assert')
  , Transaction = require('../lib/Transaction')
  , neo4node = require('../index')
  , should = require('should');



describe('Node', function (){
    var nodes = [],
        nodeObjects = [];
    describe('Node graph setup', function () {
      before(function (done) {
          var args = {
            name: 'Matrix',
            type: 'exact',
            provider: 'lucene'
          }
          neo4node.Index.createNodeIndex(args, function (err, index) {
              should.not.exist(err);
              done();
          });
      });
      it('should create test nodes', function (done) {
        var transaction = new Transaction();
        transaction.format = 'REST';
        transaction.addStatement('CREATE (node {props}) RETURN node', {props: {}});
        transaction.addStatement('CREATE (node {props}) RETURN node', {props: {name: 'Trinity', gender: 'female'}});
        transaction.addStatement('CREATE (node {props}) RETURN node', {props: {name: 'Morpheus', role: 'El capitain'}});
        transaction.addStatement('CREATE (node {props}) RETURN node', {props: {name: 'Smith'}});
        transaction.commit(function (err, results) {
          should.not.exist(err);
          results.rest.map(function (result) {
            var node = new neo4node.Node(result.node);
            nodes.push(node.id);
            nodeObjects.push(node);
          })
          done()
        })
      })
    });
    describe('Node methods tests on graph', function (done) {
      it('Should get Neo node and add properties', function (done) {
        neo4node.Node.getById(nodes[0], function (err, node) {
          should.not.exist(err);
          node.setProperty('name', 'Neo', function (err) {
            should.not.exist(err);
            node.setProperty('age', 29, true, function (err) {
              should.not.exist(err);
              done();
            });
          });
        });
      });
      it('Should add "KNOWS" relationship from Neo to Morpheus, and Trinity', function (done) {
        neo4node.Node.getById(nodes[0], function (err, neo) {
          should.not.exist(err);
          neo4node.Node.getById(nodes[2], function (err, morpheus) {
            should.not.exist(err);
            neo.createRelationshipTo(nodeObjects[1], 'KNOWS', {}, function (err) {
              should.not.exist(err);
              neo.createRelationshipTo(morpheus, 'KNOWS', {}, function (err) {
                should.not.exist(err);
                done();
              });
            });
          });
        });
      });
      it('Should add "LOVES" relationship from Trinity to Neo', function (done) {
        neo4node.Node.getById(nodes[0], function (err, neo) {
          should.not.exist(err);
          neo4node.Node.getById(nodes[1], function (err, trinity) {
            should.not.exist(err);
            neo.createRelationshipFrom(trinity, 'LOVES', {since: '1998'}, function (err) {
              should.not.exist(err);
              done();
            });
          });
        });
      });
      it('Should get all of Neo\'s relationships', function (done) {
        neo4node.Node.getById(nodes[0], function (err, neo) {
          should.not.exist(err);
          neo.getRelationships(function (err, relationships) {
            should.not.exist(err);
            relationships.length.should.eql(3)
            for (var i = 0; i < relationships.length; i++) {
              relationships[i].id.should.be.a.Number
              relationships[i].startNode.should.be.a.Number
              relationships[i].endNode.should.be.a.Number
            }
            done();
          })
        });
      });
      it('Should get all of Neo\'s incoming relationships', function (done) {
        neo4node.Node.getById(nodes[0], function (err, neo) {
          should.not.exist(err);
          neo.getIncomingRelationships(function (err, relationships) {
            should.not.exist(err);
            relationships.length.should.eql(1)
            for (var i = 0; i < relationships.length; i++) {
              relationships[i].id.should.be.a.Number
              relationships[i].startNode.should.be.a.Number
              relationships[i].endNode.should.be.a.Number
            }
            done();
          })
        });
      });
      it('Should get all of Neo\'s outgoing relationships', function (done) {
        neo4node.Node.getById(nodes[0], function (err, neo) {
          should.not.exist(err);
          neo.getOutgoingRelationships(function (err, relationships) {
            should.not.exist(err);
            relationships.length.should.eql(2)
            for (var i = 0; i < relationships.length; i++) {
              relationships[i].id.should.be.a.Number
              relationships[i].startNode.should.be.a.Number
              relationships[i].endNode.should.be.a.Number
            }
            done();
          })
        });
      });
      it('Should get all of Neo\'s incoming "LOVES" relationships', function (done) {
        neo4node.Node.getById(nodes[0], function (err, neo) {
          should.not.exist(err);
          neo.getIncomingRelationships('LOVES', function (err, relationships) {
            should.not.exist(err);
            relationships.length.should.eql(1)
            for (var i = 0; i < relationships.length; i++) {
              relationships[i].id.should.be.a.Number
              relationships[i].startNode.should.be.a.Number
              relationships[i].endNode.should.be.a.Number
            }
            done();
          })
        });
      });
      it('Should get all of Neo\'s outgoing "KNOWS" relationships', function (done) {
        neo4node.Node.getById(nodes[0], function (err, neo) {
          should.not.exist(err);
          neo.getOutgoingRelationships('KNOWS', function (err, relationships) {
            should.not.exist(err);
            relationships.length.should.eql(2)
            for (var i = 0; i < relationships.length; i++) {
              relationships[i].id.should.be.a.Number
              relationships[i].startNode.should.be.a.Number
              relationships[i].endNode.should.be.a.Number
            }
            done();
          })
        });
      });
      it('Should get all of Smith\'s relationship, and return none', function (done) {
        nodeObjects[3].getRelationships(function (err, relationships) {
          should.not.exist(err);
          relationships.length.should.eql(0)
          done();
        })
      });
      it('Should get all of Neo\'s adjacent Nodes', function (done) {
        nodeObjects[0].getAdjacentNodes(function (err, nodes) {
          should.not.exist(err);
          nodes.length.should.eql(3)
          done();
        })
      });
      it('Should get all of Neo\'s adjacent Nodes with a relationship type "LOVES"', function (done) {
        nodeObjects[0].getAdjacentNodes('LOVES', function (err, nodes) {
          should.not.exist(err);
          nodes.length.should.eql(1)
          done();
        })
      });
      it('Should get all of Neo\'s incoming adjacent Nodes', function (done) {
        nodeObjects[0].getIncomingNodes(function (err, nodes) {
          should.not.exist(err);
          nodes.length.should.eql(1)
          done();
        })
      });
      it('Should get all of Neo\'s outgoing adjacent Nodes', function (done) {
        nodeObjects[0].getOutgoingNodes(function (err, nodes) {
          should.not.exist(err);
          nodes.length.should.eql(2)
          done();
        })
      });
      it('Should get all of Neo\'s outgoing adjacent Nodes by "LOVES" and find that Neo loves no one', function (done) {
        nodeObjects[0].getOutgoingNodes('LOVES', function (err, nodes) {
          should.not.exist(err);
          nodes.length.should.eql(0)
          done();
        })
      });
    });
    describe('Node graph teardown', function () {
      it('should delete test nodes', function (done) {
        var transaction = new Transaction();
        transaction.format = 'REST';
        transaction.addStatement('START node = node({id}) OPTIONAL MATCH node -[relationships]- () DELETE relationships, node', {id: nodes[0]});
        transaction.addStatement('START node = node({id}) OPTIONAL MATCH node -[relationships]- () DELETE relationships, node', {id: nodes[1]});
        transaction.addStatement('START node = node({id}) OPTIONAL MATCH node -[relationships]- () DELETE relationships, node', {id: nodes[2]});
        transaction.addStatement('START node = node({id}) OPTIONAL MATCH node -[relationships]- () DELETE relationships, node', {id: nodes[3]});
        transaction.commit(function (err, results) {
          should.not.exist(err);
          done()
        })
      })
    });
});