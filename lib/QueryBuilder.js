/**
@module Neo4Node
**/

/**
* Transaction object
* 
* @class Transaction
* @constructor
*/

var Transaction = require('./Transaction');

function QueryBuilder() {
    this._transaction = new Transaction();
}

module.exports = QueryBuilder;

Object.defineProperties(QueryBuilder.prototype, {
    statements: {
        get: function () { 
            return this._transaction.statements;
        },
        enumerable: true,
        configurable: true
    },

    parse: {
        get: function () { 
            return this._transaction.parse;
        },
        enumerable: true,
        configurable: true
    },

    format: {
        get: function () { 
            return this._transaction.format;
        },
        enumerable: true,
        configurable: true
    }
});

QueryBuilder.prototype.config = function(configs) {
    if (configs.parse)
        this._transaction.parse = (configs.parse == true) ? true : false;

    if (configs.format)
        this._transaction.format = configs.format;

    return this;
}

QueryBuilder.prototype.execute = function (callback) {
    console.log('callback: ' + JSON.stringify(callback))

    if (typeof callback !== 'function')
        throw new Error('A callback is required when executing transaction')

    this._transaction.execute(function (err, results) {
        if (err)
            return callback('Error encountered: ' + JSON.stringify(err));
        callback(null, results)
    })
}

QueryBuilder.prototype.commit = function (callback) {
    if (typeof callback !== 'function')
        throw new Error('A callback is required when commiting transaction')

    this._transaction.execute(function (err, results) {
        if (err)
            return callback('Error encountered: ' + JSON.stringify(err));
        callback(null, results)
    })
}

QueryBuilder.prototype.addStatement = function(statement, parameters) {
    if (typeof parameters === 'undefined')
        parameters = {};

    if (typeof statement !== 'string')
        throw new Error('Statement is require and must be a string')

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.addNode = function(parameters) {
    console.log('adding node')
    if (typeof parameters === 'undefined')
        parameters = {};

    var statement = [
        'CREATE (node {props})',
        'RETURN node',
    ].join('\n');

    var parameters = {
        props: parameters
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.deleteNode = function(id) {
    if (typeof id === 'undefined')
        throw new Error('delete node requires and ID to be provided');

    var statement = [
        'START node = ({id})',
        'DELETE node'
    ].join('\n');

    var parameters = {
        id: Number(id)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}