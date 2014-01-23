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
        open: false,
        format: "row"
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
        set: function(format) {
            this._transaction.format = format;
        },
        enumerable: true,
        configurable: true
    },

    statements: {
        get: function () { 
            return this._transaction.statements;
        },
        enumerable: true,
        configurable: true
    }

});

Transaction.prototype.addStatement = function(statement, parameters) {
    var statement = {
        statement: statement,
        parameters: parameters,
        resultDataContents : [ this._transaction.format ]
    }
    console.log('statement: ' + JSON.stringify(statement))
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
        that._transaction.open = true;
        that._transaction.expires = results.transaction.expires;
        that._transaction.statements = [];
        callback(null, results.results);
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
    if (typeof queries === 'function') {
        callback = queries;
        queries = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback is required');

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
        uri = '/transaction/' + this.id;
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
        that._transaction.open = true;
        that._transaction.expires = results.transaction.expires;
        that._transaction.statements = [];
        callback(null, results.results);
    });
}

Transaction.prototype.commit = function(queries, params, callback) {
    if (typeof queries === 'function') {
        callback = queries;
        queries = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback is required');

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

    console.log('data: ' + JSON.stringify(data))

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
        callback(null, JSON.stringify(results));
    });
}