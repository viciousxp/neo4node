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
  , db = new Neo4j();

function Transaction() {
    this._transaction = {
        statements: [],
        open: true,
        format: ["row"],
        parse: true
    };
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

    parse: {
        get: function () { 
            return this._transaction.parse;
        },
        set: function(parse) {
            this._transaction.parse = parse;
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

    console.log('formats: ' + this._transaction.format)

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

    if (this._transaction.open)
        callback('This transaction is already open, use execute or commit')

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

    console.log('debug: ' + this.open)

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
        uri = (this._transaction.open) ? '/transaction/' + this.id + '/commit' : '/transaction/commit';
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

Transaction.prototype.abandone = function(callback) {

}

function _parseResults(parse, results) {
    if (!parse)
        return results

    //console.log('unParsed results:' + JSON.stringify(results))

    var parsedResults = {};

    var columns = results[0].columns.map(function (column) {
        return column;
    });

    parsedResults = results[0].data.map(function (result) {
        for (var i = 0; i < result.rest.length; i++) {
            parsedResults.push({column[i]: result.rest[i]});
        }
    });

    console.log('parsedResults:' + JSON.stringify(parsedResults))

    return results

}