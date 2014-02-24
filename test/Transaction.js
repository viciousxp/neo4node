var assert = require('assert')
  , neo4node = require('../lib/index')
  , db = new neo4node('neo4node.sb01.stations.graphenedb.com', '24789', 'neo4node', 'cL4IxXL7xCHY3pTYEKoS')
  , Transaction = neo4node.Transaction
  , should = require('should');

describe('Transaction', function (){
    var transaction = new Transaction();
    it('should add statement to a transaction', function (done) {
        var query = 'CREATE (n {props}) RETURN n',
            params = {
                props : {
                    name : "My Node"
                }
            };

        transaction.addStatement(query, params);
        transaction.statements[0].statement.should.eql(query);
        transaction.statements[0].parameters.should.eql(params);
        done()
    });
    it('should begin transaction', function (done) {
        transaction.begin(function (err, results) {
            should.not.exist(err);
            transaction.id.should.be.a.Number;
            done();
        })
    });
    it('should keep transaction alive', function (done) {
        transaction.keepAlive(function (err) {
            should.not.exist(err);
            done();
        })
    });
    it('should commit transaction', function (done) {
        transaction.commit(function (err, results) {
            should.not.exist(err);
            done();
        })
    });
});