var assert = require('assert')
  , neo4node = require('../index')
  , db = new neo4node.Neo4j()
  , should = require('should');

//TODO More complex tests on db.cypher and db.REST. However, since we are testing Depracted functions
//this is of low priority.

//note: db.REST is the same method used by Transaction and QueryBuilder classes, therefore it is thoroughly
//tested for the transactional http ReST endpoint.

describe('Neo4J', function (){
    describe('Neo4J constructor method REST - require(\'soco\').Neo4j', function (){
        it('Should get server version - db.REST()', function (done) {
            db.REST('GET', '/', function (err, status, body) {
                should.not.exist(err);
                body.neo4j_version.should.be.String
                done();
            });
        });
    });
    describe('Node constructor method cypher - new soco.Node()', function (){
        it('Create a node', function (done) {
            db.cypher('CREATE (n {props}) RETURN n', {props: {name: 'this is a name'}}, function (err, status, body) {
                status.should.equal(200);
                var node = new neo4node.Node(body.n[0]);
                db.cypher('START n = node({id}) DELETE n', {id: node.id}, function (err, status, body) {
                    status.should.equal(200);
                    should.not.exist(err);
                    done()
                })
            });
        });
    }); 
});