/**
@module Neo4Node
**/

/**
* Transaction object
* 
* @class Transaction
* @constructor
*/

var Neo4j = require('./Neo4j')
  , db;

function Transaction(url, port, user, pass) {
    this.url = url || global.neo4node.url || process.env.NEO4J_URL || 'localhost';
    this.port = port || global.neo4node.port || process.env.NEO4J_PORT || 7474;
    this.user = user || global.neo4node.user || process.env.NEO4J_USER || null;
    this.pass = pass || global.neo4node.pass || process.env.NEO4J_PASS || null;
    
    this._transaction = {
        statements: [],
        open: true,
        format: ["rest"],
        parse: true
    };

    db = new Neo4j(this.url, this.port, this.user, this.pass);
}
    
module.exports = Transaction;

Object.defineProperties(Transaction.prototype, {

    id: {
        get: function () { 
            if (typeof this._transaction.commitURI !== 'undefined')
                id = this._transaction.commitURI.slice(this._transaction.commitURI.indexOf('/transaction') +13, -7);
            else 
                return 'undefined';
            return parseInt(id);
        },
        enumerable: true,
        configurable: true
    },

    commitURI: {
        get: function () { 
            return this._transaction.commitURI;
        },
        set: function(commit) {
            this._transaction.commitURI = commit;
        },
        enumerable: true,
        configurable: true
    },

    open: {
        get: function () { 
            return this._transaction.open;
        },
        set: function(open) {
            this._transaction.open = open;
        },
        enumerable: true,
        configurable: true
    },

    expires: {
        get: function () { 
            return this._transaction.expires;
        },
        set: function(expires) {
            this._transaction.expires = expires;
        },
        enumerable: true,
        configurable: true
    },

    format: {
        get: function () { 
            return this._transaction.format;
        },
        set: function(formats) {
            if (!Array.isArray(formats))
                formats = [formats]
            
            var format = [];
            for (var i = 0; i < formats.length; i++) {
                if (['rest', 'row', 'graph'].indexOf(formats[i].toLowerCase()) > -1)
                    format.push(formats[i]);
            }
            if (format.length > 0)
                this._transaction.format = format
        },
        enumerable: true,
        configurable: true
    },

    statements: {
        get: function () { 
            return this._transaction.statements;
        },
        set: function(statements) {
            this._transaction.statements = statements
        },
        enumerable: true,
        configurable: true
    },

    parse: {
        get: function () { 
            return this._transaction.parse || 'RAW';
        },
        set: function(parse) {
            this._transaction.parse = parse
        },
        enumerable: true,
        configurable: true
    }

});

Transaction.prototype.addStatement = function(statement, parameters) {
    var statement = {
        statement: statement,
        parameters: parameters,
        resultDataContents : this._transaction.format
    }

    this._transaction.statements.push(statement);
    return this;
}

Transaction.prototype.begin = function(queries, params, callback) {
    if (typeof queries === 'function') {
        callback = queries;
        queries = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback is required');

    // if (this._transaction.open)
    //     callback('This transaction is already open, use execute or commit')

    if (Array.isArray(queries) && Array.isArray(params)) {
        for (var i = 0; i < queries.length; i++) {
            if (typeof params[i] !== 'undefined')
                this.addStatement(queries[i], params[i])
            else
                return callback('Error parsing queries and params');
        }
    }

    if (typeof queries === 'string') {
        if (!typeof params === 'object')
            params = {};
        this.addStatement(queries, params);
    }

    var that = this,
        uri = '/transaction/';
        data = {
            statements: this._transaction.statements
        };

    db.REST('POST', '/transaction/', data, function (err, status, results) {
        if (err)
            return callback(err);
        if (status !== 200 && status !== 201)
            return callback('Unknown error, received status ' + status);
        if (results.errors.length > 0)
            return callback(results.errors)
        that._transaction.open = true;
        that._transaction.commitURI = results.commit;
        that._transaction.expires = results.transaction.expires;
        that._transaction.statements = [];
        callback(null, _parseResults(that._transaction.parse, results.results));
    });
}

Transaction.prototype.keepAlive = function(callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback is required');

    if (!this._transaction.open)
        callback('This transaction is closed')

    var that = this,
        data = {
            statements: []
        };

    db.REST('POST', '/transaction/', data, function (err, status, results) {
        if (err)
            return callback(err);
        if (status !== 200 && status !== 201)
            return callback('Unknown error, received status ' + status);
        if (results.errors.length > 0)
            return callback(results.errors)
        that._transaction.expires = results.transaction.expires;
        callback(null);
    });
}

Transaction.prototype.execute = function(queries, params, callback) {
    var self = this;

    if (typeof queries === 'function') {
        callback = queries;
        queries = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback is required');

    if (Array.isArray(queries) && Array.isArray(params)) {
        for (var i = 0; i < queries.length; i++) {
            if (typeof params[i] !== 'undefined')
                self.addStatement(queries[i], params[i])
            else
                return callback('Error parsing queries and params');
        }
    }

    if (typeof queries === 'string') {
        if (!typeof params === 'object')
            params = {};
        self.addStatement(queries, params);
    }

    var uri = (self.id !== 'undefined') ? '/transaction/' + self.id : '/transaction/';
        data = {
            statements: self._transaction.statements
        };

    console.log('execute uri: ' + uri)

    db.REST('POST', uri, data, function (err, status, results) {
        if (err)
            return callback(err);
        if (status !== 200 && status !== 201)
            return callback('Unknown error, received status ' + status);
        if (results.errors.length > 0)
            return callback(results.errors)
        self._transaction.open = true;
        self._transaction.commitURI = results.commit;
        self._transaction.expires = results.transaction.expires;
        self._transaction.statements = [];
        callback(null, _parseResults(self._transaction.parse, results.results));
    });
}

Transaction.prototype.commit = function(queries, params, callback) {
    if (typeof queries === 'function') {
        callback = queries;
        queries = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback is required');

    if (!this.open)
        return callback('This transaction was already commited');

    if (Array.isArray(queries) && Array.isArray(params)) {
        for (var i = 0; i < queries.length; i++) {
            if (typeof params[i] !== 'undefined')
                this.addStatement(queries[i], params[i])
            else
                return callback('Error parsing queries and params');
        }
    }

    if (typeof queries === 'string') {
        if (!typeof params === 'object')
            params = {};
        this.addStatement(queries, params);
    }

    var that = this,
        uri = (that.id !== 'undefined') ? '/transaction/' + that.id + '/commit': '/transaction/commit';
        data = {
            statements: this._transaction.statements
        };

    db.REST('POST', uri, data, function (err, status, results) {
        if (err)
            return callback(err);
        if (status !== 200 && status !== 201)
            return callback('Unknown error, received status ' + status);
        if (results.errors.length > 0)
            return callback(results.errors)
        that._transaction.commitURI = results.commit;
        that._transaction.open = false;
        that._transaction.statements = [];
        callback(null, _parseResults(that._transaction.parse, results.results));
    });
}

function _parseResults(parse, results) {
    if (!parse)
        return results

    var parsedResults = {
        rest: [],
        graph: []
    };

    if (results.length > 0) {
        var columns = results[0].columns.map(function (column) {
            return column;
        });
    }

    for (var j = 0; j < results.length; j++) {
        results[j].data.map(function (row) {
            if (typeof row.graph !== 'undefined') {
                var resultRow = {
                    nodes: row.graph.nodes,
                    relationships: row.graph.relationships
                }
                parsedResults.graph.push(resultRow)
            }
            if (typeof row.rest !== 'undefined') {
                if (row.rest[0] !== null) {
                    var resultRow = {};
                    for (var i = 0; i < row.rest.length; i++) {
                            if (!Array.isArray(resultRow[results[0].columns[i]]))
                                resultRow[results[0].columns[i]] = []
                            
                            resultRow[results[0].columns[i]] = row.rest[i];
                    }
                    parsedResults.rest.push(resultRow)
                }
            }
        });
    }

    return parsedResults
}