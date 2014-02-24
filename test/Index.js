var assert = require('assert')
  , neo4node = require('../lib/index')
  , db = new neo4node('neo4node.sb01.stations.graphenedb.com', '24789', 'neo4node', 'cL4IxXL7xCHY3pTYEKoS')
  , should = require('should');

//required vars for tests
createIndexArgs = [
  {
    name: 'testExactIndex',
    type: 'exact',
    provider: 'lucene'
  },{
    name: 'testFulltextIndex',
    type: 'fulltext',
    provider: 'lucene'
  },{
    name: 'testIndex',
    type: 'something'
  },{
    type: 'exact'
  },{
    name: 'testIndex'
  },{

  }
]

describe('Index', function () {
  describe('Creating, Deleting and Listing', function () {
    it('Should add exact index "testExactIndex" - db.createNodeIndex()', function (done) {
      db.createNodeIndex(createIndexArgs[0], function (err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testExactIndex')
        index.should.have.property('type', 'exact');
        done();
      });
    });
    it('Should add fulltext index "testFulltextIndex" - db.createNodeIndex()', function (done) {
      db.createNodeIndex(createIndexArgs[1], function (err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testFulltextIndex')
        index.should.have.property('type', 'fulltext');
        done();
      });
    });
    for (var i = 2; i < createIndexArgs.length; i++) {
      it('Should add index and fail - db.createNodeIndex()', function (done) {
        db.createNodeIndex(createIndexArgs[i], function (err, index) {
          err.should.not.be.eql(null);
          done();
        })
      });
    }
    it('Should get array of node indexes and find "testExactIndex" and "testFulltextIndex" - db.listNodeIndexes()', function (done) {
      db.listNodeIndexes(function (err, indexes) {
        should.not.exist(err);
        indexes.should.be.instanceof(Array);

        //check for created indexes
        var testExactIndex = false,
            testFulltextIndex = false;
        for (var i = 0; i < indexes.length; i++) {
          if (indexes[i].name === 'testExactIndex') testExactIndex = true;
          if (indexes[i].name === 'testFulltextIndex') testFulltextIndex = true;
        }
        testExactIndex.should.be.true;
        testFulltextIndex.should.be.true;
        done();
      });
    });
    it('Should delete Node indexes "testExactIndex" and "testFulltextIndex" and ensure dont exist', function (done) {
      db.deleteNodeIndex('testExactIndex', function (err) {
        should.not.exist(err);
        db.deleteNodeIndex('testFulltextIndex', function (err) {
          should.not.exist(err);
          db.listNodeIndexes(function (err, indexes) {
            should.not.exist(err);
            indexes.should.be.instanceof(Array);

            //check for created indexes
            var testExactIndex = false,
                testFulltextIndex = false;
            for (var i = 0; i < indexes.length; i++) {
              if (indexes[i].name === 'testExactIndex') testExactIndex = true;
              if (indexes[i].name === 'testFulltextIndex') testFulltextIndex = true;
            }
            testExactIndex.should.not.be.true;
            testFulltextIndex.should.not.be.true;
            done();
          });
        });          
      });
    });
    it('Should add exact relationship index "testExactIndex" - db.createRelationshipIndex()', function (done) {
      db.createRelationshipIndex(createIndexArgs[0], function (err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testExactIndex')
        index.should.have.property('type', 'exact');
        done();
      });
    });
    it('Should add relationship fulltext index "testFulltextIndex" - db.createRelationshipIndex()', function (done) {
      db.createRelationshipIndex(createIndexArgs[1], function (err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testFulltextIndex')
        index.should.have.property('type', 'fulltext');
        done();
      });
    });
    for (var i = 2; i < createIndexArgs.length; i++) {
      it('Should add index and fail - db.createRelationshipIndex()', function (done) {
        db.createRelationshipIndex(createIndexArgs[i], function (err, index) {
          err.should.not.be.eql(null);
          done();
        })
      });
    }
    it('Should get array of relationship indexes and find "testExactIndex" and "testFulltextIndex" - db.listRelationshipIndexes()', function (done) {
      db.listRelationshipIndexes(function (err, indexes) {
        should.not.exist(err);
        indexes.should.be.instanceof(Array);
        var testExactIndex = false,
            testFulltextIndex = false;
        for (var i = 0; i < indexes.length; i++) {
          if (indexes[i].name === 'testExactIndex') testExactIndex = true;
          if (indexes[i].name === 'testFulltextIndex') testFulltextIndex = true;
        }
        testExactIndex.should.be.true;
        testFulltextIndex.should.be.true;
        done();
      });
    });
    it('Should delete Relationship indexes "testExactIndex" and "testFulltextIndex" and ensure dont exist', function (done) {
      db.deleteRelationshipIndex('testExactIndex', function (err) {
        should.not.exist(err);
        db.deleteRelationshipIndex('testFulltextIndex', function (err) {
          should.not.exist(err);
          db.listRelationshipIndexes(function (err, indexes) {
            should.not.exist(err);
            indexes.should.be.instanceof(Array);

            //check for created indexes
            var testExactIndex = false,
                testFulltextIndex = false;
            for (var i = 0; i < indexes.length; i++) {
              if (indexes[i].name === 'testExactIndex') testExactIndex = true;
              if (indexes[i].name === 'testFulltextIndex') testFulltextIndex = true;
            }
            testExactIndex.should.not.be.true;
            testFulltextIndex.should.not.be.true;
            done();
          });
        });
      });
    });
    it('Should return error on invalid index delete - Index.prototype.delete()', function (done) {
      (function () {
        db.deleteNodeIndex(function (err) {})
      }).should.throwError();
      done();
    });
    it('Should try to delete non-existing Node index and return error', function (done) {
      db.deleteNodeIndex('some random index which doesnt exist', function (err) {
        should.exist(err);
        done();
      });
    });
    it('Should create and then delete index', function (done) {
      var index = {
        name: 'testIndex',
        type: 'exact',
        provider: 'lucene'
      }
      db.createNodeIndex(index, function (err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testIndex')
        index.should.have.property('type', 'exact');

        db.deleteNodeIndex(index.name, function (err) {
          should.not.exist(err);
          done();
        });
      });
    });
  });
  describe('Indexing nodes and querying legacy indexes', function () {
    it.skip('Should create 4 new nodes and relationships between them')
    it.skip('Should create one legacy node index and one legacy relationship index')
    it.skip('Should index all four nodes and all relationships')
    it.skip('Should perform several queries on the legacy node index')
    it.skip('Should perform several queries on the legacy relationship index')
    it.skip('should remove some nodes and some relationships from legacy indexes')
    it.skip('should delete all nodes, relationships and test legacy indexes')
  })
});