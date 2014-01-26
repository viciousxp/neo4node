var assert = require('assert')
  , Transaction = require('../lib/Transaction')
  , neo4node = require('../index')
  , db = new neo4node.Neo4j()
  , should = require('should');



describe('Node', function (){
    describe('Node graph setup', function () {
      var nodes = [],
          nodeObjects = [];
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
      before(function (done) {
          var transaction = new Transaction();
          transaction.format = 'REST';
          transaction.addStatement('CREATE (node {props}) RETURN node', {props: {}});
          transaction.addStatement('CREATE (node {props}) RETURN node', {props: {name: 'Trinity', gender: 'female'}});
          transaction.addStatement('CREATE (node {props}) RETURN node', {props: {name: 'Morpheus', role: 'El capitain'}});
          transaction.addStatement('CREATE (node {props}) RETURN node', {props: {name: 'Smith'}});
          transaction.commit(function (err, results) {
            should.not.exist(err);
          })
          done()
      })
      describe('Node tests on graph', function (done) {
          it.skip('should index all nodes by name', function (done) {
              nodeObjects[0].index('Matrix', 'name', 'Neo', function (err) {
                should.not.exist(err);
                nodeObjects[1].index('Matrix', 'name', 'Trinity', function (err) {
                  should.not.exist(err);
                  nodeObjects[2].index('Matrix', 'name', 'Morpheus', function (err) {
                    should.not.exist(err);
                    nodeObjects[3].index('Matrix', 'name', 'Smith', function (err) {
                      should.not.exist(err);
                      done();
                    })
                  })
                })
              })
          });
          it.skip('Should query node index "MATRIX" and return indexed nodes', function (done) {
              neo4node.Index.queryNodeIndex('Matrix', function (err, results) {
                  should.not.exist(err);
                  results.length.should.eql(4);
                  done();
              })
          });
          it.skip('Should query node index "MATRIX" with lucene syntax for "name:Neo" and return Neo node', function (done) {
              neo4node.Index.queryNodeIndex('Matrix', 'name:Neo', function (err, results) {
                  should.not.exist(err);
                  results[0].should.eql(nodeObjects[0]);
                  done();
              })
          });
          it.skip('Should query node index "MATRIX" by exact match for key "name" and value "Morpheus" and return Morpheus node', function (done) {
              neo4node.Index.matchNodeIndex('Matrix', 'name', 'Morpheus', function (err, results) {
                  should.not.exist(err);
                  results[0].should.eql(nodeObjects[2]);
                  done();
              })
          });
          it.skip('Should get Neo node and add properties', function (done) {
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
          it.skip('Should add "KNOWS" relationship from Neo to Morpheus, and Trinity', function (done) {
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
          it.skip('Should add "LOVES" relationship from Trinity to Neo', function (done) {
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
          it.skip('Should get all of Neo\'s relationships', function (done) {
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
          it.skip('Should get all of Neo\'s incoming relationships', function (done) {
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
          it.skip('Should get all of Neo\'s outgoing relationships', function (done) {
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
          it.skip('Should get all of Neo\'s incoming "LOVES" relationships', function (done) {
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
          it.skip('Should get all of Neo\'s outgoing "KNOWS" relationships', function (done) {
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
          it.skip('Should get all of Smith\'s relationship, and return none', function (done) {
              nodeObjects[3].getRelationships(function (err, relationships) {
                  should.not.exist(err);
                  relationships.length.should.eql(0)
                  done();
              })
          });
          it.skip('Should get all of Neo\'s adjacent Nodes', function (done) {
              nodeObjects[0].getAdjacentNodes(function (err, nodes) {
                  should.not.exist(err);
                  nodes.length.should.eql(3)
                  done();
              })
          });
          it.skip('Should get all of Neo\'s adjacent Nodes with a relationship type "LOVES"', function (done) {
              nodeObjects[0].getAdjacentNodes('LOVES', function (err, nodes) {
                  should.not.exist(err);
                  nodes.length.should.eql(1)
                  done();
              })
          });
          it.skip('Should get all of Neo\'s incoming adjacent Nodes', function (done) {
              nodeObjects[0].getIncomingNodes(function (err, nodes) {
                  should.not.exist(err);
                  nodes.length.should.eql(1)
                  done();
              })
          });
          it.skip('Should get all of Neo\'s outgoing adjacent Nodes', function (done) {
              nodeObjects[0].getOutgoingNodes(function (err, nodes) {
                  should.not.exist(err);
                  nodes.length.should.eql(2)
                  done();
              })
          });
          it.skip('Should get all of Neo\'s outgoing adjacent Nodes by "LOVES" and find that Neo loves no one', function (done) {
              nodeObjects[0].getOutgoingNodes('LOVES', function (err, nodes) {
                  should.not.exist(err);
                  nodes.length.should.eql(0)
                  done();
              })
          });
          it.skip('Should remove Neo from node index "MATRIX"', function (done) {
              nodeObjects[0].unindex('Matrix', function (err) {
                should.not.exist(err);
                done();
              })
          });
          it.skip('Should remove Trinity from node index "MATRIX" by matching node and key', function (done) {
              nodeObjects[1].unindex('Matrix', 'name', function (err) {
                should.not.exist(err);
                done();
              })
          });
          it.skip('Should remove Morpheus from node index "MATRIX" by matching node, key and property', function (done) {
              nodeObjects[2].unindex('Matrix', 'name', 'Morpheus', function (err) {
                should.not.exist(err);
                done();
              })
          });
          it.skip('Should delete "Matrix" index', function (done) {
              var matrixIndex = new neo4node.Index({
                name: 'Matrix',
                indexType: 'node'
              })
              matrixIndex.delete(function (err) {
                should.not.exist(err);
                done();
              })
          });
      });
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