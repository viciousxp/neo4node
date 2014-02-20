var assert = require('assert')
  , neo4node = require('../lib/index')
  , db = new neo4node('neo4node.sb01.stations.graphenedb.com', '24789', 'neo4node', 'cL4IxXL7xCHY3pTYEKoS')
  , should = require('should');



describe('QueryBuilder tests', function (){
  describe('QueryBuilder test graph setup', function () {
    var nodes = [],
        nodeObjects = [];

    it('Should create four new nodes', function (done) {
      var query = db.newQueryBuilder();
      
      query .config({format: ['rest']})
            .createNode()
            .createNode({name: 'Trinity', gender: 'female'})
            .createNode({name: 'Morpheus', role: 'El capitain'})
            .createNode({name: 'Smith'})
            .commit(function (err, results) {
              should.not.exist(err);
              results.rest.map(function (result) {
                var node = db.Node(result.node);
                nodes.push(node.id);
                nodeObjects.push(node);
              })
              done()
            })
    })
    it('Should get node by id', function (done) {
      var query = db.newQueryBuilder();

      query .getNodeById(nodes[0])
            .commit(function (err, result) {
              should.not.exist(err);
              var node = db.Node(result.rest[0].node);
              done();
            })
    });
    it('Should add labels to node', function (done) {
      var query = db.newQueryBuilder();

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
      var query = db.newQueryBuilder();

      query .setProperty(nodes[0], 'name', 'Neo')
            .setProperty(nodes[0], 'age', '29')
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    });
    it('Should remove label from Smith node', function (done) {
      var query = db.newQueryBuilder();

      query .removeLabel(nodes[3], 'PERSON')
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should add and remove a bunch of labels in one go', function (done) {
      var query = db.newQueryBuilder();

      query .setLabel(nodes[0], 'CHOSEN ONE')
            .setLabel(nodes[0], 'MAN')
            .setLabel(nodes[1], 'WOMAN')
            .setLabel(nodes[1], 'HOT')
            .setLabel(nodes[2], 'CAPTAIN')
            .setLabel(nodes[2], 'MAN')
            .setLabel(nodes[2], 'PERSON')
            .removeLabel(nodes[3], 'PERSON')
            .setLabel(nodes[3], 'PROGRAMM')
            .setLabel(nodes[3], 'AGENT')
            .setLabel(nodes[3], 'MAN')
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should remove property age from Neo node', function (done) {
      var query = db.newQueryBuilder();

      query .setProperty(nodes[0], 'Age')
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should update all of Neo\'s properties', function (done) {
      var query = db.newQueryBuilder();

      query .setProperties(nodes[0], {age: 31, name: 'The chosen one'})
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should create relationships between nodes', function (done) {
      var query = db.newQueryBuilder();

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
      var query = db.newQueryBuilder();

      query .getIncomingRelationships(nodes[0])
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should get all of Neo\'s outgoing relationships', function (done) {
      var query = db.newQueryBuilder();

      query .getOutgoingRelationships(nodes[0])
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should get all of Neo\'s incoming LOVES relationships', function (done) {
      var query = db.newQueryBuilder();

      query .getIncomingRelationships(nodes[0], 'LOVES')
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should get all of Neo\'s outgoing KILLS relationships', function (done) {
      var query = db.newQueryBuilder();

      query .getOutgoingRelationships(nodes[0], 'KILLS')
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should get all of Neo\'s relationships', function (done) {
      var query = db.newQueryBuilder();

      query .getRelationships(nodes[0])
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })

    it('Should get all of Neo\'s adjacent nodes', function (done) {
      var query = db.newQueryBuilder();

      query .getAdjacentNodes(nodes[0])
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should get all of Neo\'s incoming nodes', function (done) {
      var query = db.newQueryBuilder();

      query .getIncomingNodes(nodes[0])
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should get all of Neo\'s outgoing nodes', function (done) {
      var query = db.newQueryBuilder();

      query .getOutgoingNodes(nodes[0])
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should delete all test nodes', function (done) {
      var query = db.newQueryBuilder();

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
  describe('Schema', function () {
    var nodes = [];
    it('Should create all test nodes and add labels and properties to all test nodes', function (done) {
      var query = db.newQueryBuilder();

      query .createNode({name: 'one'})
            .createNode({name: 'two'})
            .createNode({name: 'three'})
            .createNode({name: 'four'})
            .execute(function (err, results) {
              should.not.exist(err)
              results.rest.map(function (result) {
                var node = db.Node(result.node);
                nodes.push(node.id);
              })
              query .setLabel(nodes[0], 'PERSON')
                    .setLabel(nodes[1], 'PERSON')
                    .setLabel(nodes[2], 'PERSON')
                    .setLabel(nodes[0], 'CHOSEN ONE')
                    .setLabel(nodes[0], 'MAN')
                    .setLabel(nodes[1], 'WOMAN')
                    .setLabel(nodes[1], 'HOT')
                    .setLabel(nodes[2], 'CAPTAIN')
                    .setLabel(nodes[2], 'MAN')
                    .setLabel(nodes[2], 'PERSON')
                    .setLabel(nodes[3], 'PROGRAMM')
                    .setLabel(nodes[3], 'AGENT')
                    .setLabel(nodes[3], 'MAN')
                    .createRelationship(nodes[0], nodes[1], 'KNOWS')
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
    })
    it('Should create index on label PERSON and MAN', function (done) {
      var query = db.newQueryBuilder();

      query .createIndexOn('PERSON', 'name')
            .createIndexOn('MAN', 'name')
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should use Index PERSON', function (done) {
      var query = db.newQueryBuilder();

      query .useIndex('PERSON', 'name', 'two')
            .commit(function (err, results) {
              should.not.exist(err)
              results.rest.map(function (result) {
                var node = db.Node(result.nodes);
                nodes.indexOf(node.id).should.not.eql(-1);
              })
              done();
            })
    })
    it('Should use Index MAN', function (done) {
      var query = db.newQueryBuilder();

      query .useIndex('MAN', 'name', 'one')
            .commit(function (err, results) {
              should.not.exist(err)
              results.rest.map(function (result) {
                var node = db.Node(result.nodes);
                nodes.indexOf(node.id).should.not.eql(-1);
              })
              done();
            })
    })
    it.skip('Should add contraints on PERSON', function (done) {
      var query = db.newQueryBuilder();

      query .createConstraint(nodes[0], 'PERSON', 'username')
            .commit(function (err, results) {
              should.not.exist(err)
              done();
            })
    })
    it.skip('Should create new PERSON which obeys contraints and succede')
    it.skip('Should create new PERSON which doesnt obey constraints and fail')
    it.skip('Should remove constraints on PERSON')
    it.skip('Should create new PERSON which doesnt obey constraints and succede')
    it('Should drop index on PERSON', function (done) {
      var query = db.newQueryBuilder();

      query .DropIndexOn('PERSON', 'name')
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('Should drop index on MAN', function (done) {
      var query = db.newQueryBuilder();

      query .DropIndexOn('MAN', 'name')
            .commit(function (err, results) {
              should.not.exist(err);
              done();
            })
    })
    it('should delete all test nodes', function (done) {
      var query = db.newQueryBuilder();
      
      query .deleteNode(nodes[0], true)
            .deleteNode(nodes[1], true)
            .deleteNode(nodes[2], true)
            .deleteNode(nodes[3], true)
            .addStatement('START nodes = node(*) OPTIONAL MATCH nodes -[rels]- () DELETE rels, nodes')
            .commit(function (err) {
              should.not.exist(err)
              done();
            })
    })
  })
});