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


//config
QueryBuilder.prototype.config = function(configs) {
    if (configs.parse)
        this._transaction.parse = (configs.parse == true) ? true : false;

    if (configs.format)
        this._transaction.format = configs.format;

    return this;
}

//transaction methods
QueryBuilder.prototype.execute = function (callback) {
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

    this._transaction.commit(function (err, results) {
        if (err)
            return callback('Error encountered: ' + JSON.stringify(err));
        callback(null, results)
    })
}

//query methods
QueryBuilder.prototype.addStatement = function(statement, parameters) {
    if (typeof parameters === 'undefined')
        parameters = {};

    if (typeof statement !== 'string')
        throw new Error('Statement is require and must be a string')

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.getNodeById = function(id) {
    if (typeof id === 'undefined')
        throw new Error('delete node requires and ID to be provided');

    var statement = [
        'START node = node({id})',
        'RETURN node',
    ].join('\n');

    var parameters = {
        id: Number(id)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.createNode = function(parameters) {
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

QueryBuilder.prototype.deleteNode = function(id, force) {
    if (typeof id === 'undefined')
        throw new Error('delete node requires and ID to be provided');

    var statement;

    if (force) {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node -[relationships]- ()',
            'DELETE relationships, node'
        ].join('\n');        
    } else {
        statement = [
            'START node = node({id})',
            'DELETE node'
        ].join('\n');
    }

    var parameters = {
        id: Number(id)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.setLabel = function(id, label) {
    if (typeof id === 'undefined')
        throw new Error('Requires an ID to be provided');

    if (typeof label === 'undefined')
        throw new Error('Requires a label to be provided');

    var statement = [
            'START node = node({id})',
            'SET node:`LABEL`'
        ].join('\n')
            .replace('LABEL', label);

    var parameters = {
        id: Number(id)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.removeLabel = function(id, label) {
    if (typeof id === 'undefined')
        throw new Error('Requires an ID to be provided');

    if (typeof label === 'undefined')
        throw new Error('Requires a label to be provided');

    var statement = [
            'START node = node({id})',
            'REMOVE node:`LABEL`'
        ].join('\n')
            .replace('LABEL', label);

    var parameters = {
        id: Number(id)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.setProperty = function(id, property, value) {
    if (typeof id === 'undefined')
        throw new Error('Requires an ID to be provided');

    if (typeof property !== 'string')
        throw new Error('A property name is required');

    var statement;

    if (typeof value !== 'string') {
        statement = [
            'START node = node({id})',
            'REMOVE node.PROPERTY'
        ].join('\n')
            .replace('PROPERTY', property);
    } else {
        statement = [
            'START node = node({id})',
            'SET node.PROPERTY = {value}'
        ].join('\n')
            .replace('PROPERTY', property);
    }

    var parameters = {
        id: Number(id),
        value: value
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.setProperties = function(id, properties) {
    if (typeof id === 'undefined')
        throw new Error('Requires an ID to be provided');

    if (typeof properties !== 'object')
        throw new Error('Properties must be an object');

    var statement = [
        'START node = node({id})',
        'SET node = {properties}'
    ].join('\n');

    var parameters = {
        id: Number(id),
        properties: properties
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.createRelationship = function(fromId, toId, type) {
    if (typeof fromId === 'undefined')
        throw new Error('Requires from ID to be provided');

    if (typeof toId === 'undefined')
        throw new Error('Requires to ID to be provided');

    if (typeof type === 'undefined')
        throw new Error('Requires a relationship type to be provided');

    var statement = [
        'START fromNode = node({fromId}), toNode = node({toId})',
        'CREATE fromNode -[:TYPE]-> toNode'
    ].join('\n')
        .replace('TYPE', type);

    var parameters = {
        fromId: Number(fromId),
        toId: Number(toId)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.getRelationships = function(id, type) {
    if (typeof id === 'undefined')
        throw new Error('Requires an ID to be provided');

    var statement;

    if (typeof type !== 'undefined') {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node -[relationships:TYPE]- ()',
            'RETURN relationships'
        ].join('\n')
            .replace('TYPE', type);
    } else {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node -[relationships]- ()',
            'RETURN relationships'
        ].join('\n')
    }

    var parameters = {
        id: Number(id)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.getIncomingRelationships = function(id, type) {
    if (typeof id === 'undefined')
        throw new Error('Requires an ID to be provided');

    var statement;

    if (typeof type !== 'undefined') {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node <-[relationships:TYPE]- ()',
            'RETURN relationships'
        ].join('\n')
            .replace('TYPE', type);
    } else {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node <-[relationships]- ()',
            'RETURN relationships'
        ].join('\n')
    }

    var parameters = {
        id: Number(id)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.getOutgoingRelationships = function(id, type) {
    if (typeof id === 'undefined')
        throw new Error('Requires an ID to be provided');

    var statement;

    if (typeof type !== 'undefined') {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node -[relationships:TYPE]-> ()',
            'RETURN relationships'
        ].join('\n')
            .replace('TYPE', type);
    } else {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node -[relationships]-> ()',
            'RETURN relationships'
        ].join('\n')
    }

    var parameters = {
        id: Number(id)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.getAdjacentNodes = function(id, type) {
    if (typeof id === 'undefined')
        throw new Error('Requires an ID to be provided');

    var statement;

    if (typeof type !== 'undefined') {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node -[:TYPE]- (nodes)',
            'RETURN nodes'
        ].join('\n')
            .replace('TYPE', type);
    } else {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node -[]- (nodes)',
            'RETURN nodes'
        ].join('\n')
    }

    var parameters = {
        id: Number(id)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.getIncomingNodes = function(id, type) {
    if (typeof id === 'undefined')
        throw new Error('Requires an ID to be provided');

    var statement;

    if (typeof type !== 'undefined') {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node <-[:TYPE]- (nodes)',
            'RETURN nodes'
        ].join('\n')
            .replace('TYPE', type);
    } else {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node <-[]- (nodes)',
            'RETURN nodes'
        ].join('\n')
    }

    var parameters = {
        id: Number(id)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.getOutgoingNodes = function(id, type) {
    if (typeof id === 'undefined')
        throw new Error('Requires an ID to be provided');

    var statement;

    if (typeof type !== 'undefined') {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node -[:TYPE]-> (nodes)',
            'RETURN nodes'
        ].join('\n')
            .replace('TYPE', type);
    } else {
        statement = [
            'START node = node({id})',
            'OPTIONAL MATCH node -[]-> (nodes)',
            'RETURN nodes'
        ].join('\n')
    }

    var parameters = {
        id: Number(id)
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.createIndexOn = function (label, property) {
    if (typeof label === 'undefined')
        throw new Error('Requires a label to be provided');

    if (typeof property === 'undefined')
        throw new Error('Requires an indexed property to be provided');

    var statement = [
        'CREATE INDEX ON :LABEL(PROPERTY)'
    ].join('\n')
        .replace('LABEL', label)
        .replace('PROPERTY', property);

    var parameters = {
        property: property
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.DropIndexOn = function (label, property) {
    if (typeof label === 'undefined')
        throw new Error('Requires a label to be provided');

    if (typeof property === 'undefined')
        throw new Error('Requires an indexed property to be provided');

    var statement = [
        'DROP INDEX ON :LABEL(PROPERTY)'
    ].join('\n')
        .replace('LABEL', label)
        .replace('PROPERTY', property);

    var parameters = {
        property: property
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}

QueryBuilder.prototype.useIndex = function (label, property, value) {
    if (typeof label === 'undefined')
        throw new Error('Requires a label to be provided');

    if (typeof property === 'undefined')
        throw new Error('Requires an indexed property to be provided');

    if (typeof value === 'undefined')
        throw new Error('Requires a value to be provided');

    var statement = [
        'MATCH (nodes:LABEL {props})',
        'RETURN nodes'
    ].join('\n')
        .replace('LABEL', label);

    var parameters = {
        property: value
    };

    this._transaction.addStatement(statement, parameters);
    return this;
}