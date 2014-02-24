/**
@module SoCo
@submodule graphDB
**/

/**
* Represents a node in Neo4j graph database
* 
* @class Node
* @constructor
*/

var Transaction = require('./Transaction')
  , Relationship = require('./Relationship')
  , db;

function Node(_node) {
    this._node = _node;
}

module.exports = Node;

// properties

Object.defineProperties(Node.prototype, {

    /**
    * Node ID, extracted from node data.
    * 
    * @attribute id
    * @type Int
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    id: {
        get: function () { 
            id = /(?:node|relationship)\/(\d+)$/.exec(this._node.self);
            return parseInt(id[1]);
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Node data
    * 
    * @attribute data
    * @type Object
    * @default {}
    * @readOnly
    **/

    data: {
        get: function () { 
            return this._node.data;
        },
        enumerable: true,
        configurable: true
    }
});

Node.prototype.delete = function(force, callback) {
    if (typeof force === 'function') {
        callback = force;
        force = false;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!force) {
        query = [
            'START node = node({id})',
            'DELETE node',
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH node -[relationships]- ()',
            'DELETE relationships, node',
        ].join('\n');
    }

    var params = {
        id: this.id,
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        callback(null);
    })
}

Node.prototype.save = function(callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query = [
        'START node = node({id})',
        'SET node = {props}'
    ].join('\n');

    var params = {
        id: this.id,
        props:this._node.data
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        callback(null);
    })
}

Node.prototype.index = function(index, key, value, callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback required');

    if (typeof index === 'object')
        index = index.name;

    if (typeof index === 'undefined' || typeof key === 'undefined' || typeof value === 'undefined')
        callback('index, key and value are required parameters.');

    if (typeof this._node.self === 'undefined')
        callback('This node has been improperly instantiated');

    var uri = '/index/node/' + index,
    data = {
        key: key, 
        value: value,
        uri: this._node.self
    }

    db.REST('POST', uri, data, function (err, status, response) {
        if (err) callback(err)
        if (status !== 201) return callback('Unknown error, receive status ' + status)
        return callback(null);
    })
}

Node.prototype.unindex = function(index, key, value, callback) {
    if (typeof key === 'function') {
        callback = key;
        key = null;
    }

    if (typeof value === 'function') {
        callback = value;
        value = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required');

    if (typeof index === 'object')
        index = index.name;

    if (typeof index === 'undefined')
        callback('index is a required parameters.');

    if (typeof this.id === 'undefined')
        callback('This node has been improperly instantiated');

    var uri = '/index/node/' + index + '/' + this.id;
    if (key !== null && typeof key !== 'undefined')
        uri = '/index/node/' + index + '/' + key + '/' + this.id;
    if (value !== null && typeof value !== 'undefined')
        uri = '/index/node/' + index + '/' + key + '/' + value + '/' + this.id;

    db.REST('DELETE', uri, function (err, status, response) {
        if (err) callback(err)
        if (status !== 204) return callback('Unknown error, receive status ' + status)
        return callback(null);
    })
}

Node.prototype.setProperty = function(property, value, autoSave, callback) {
    if (typeof autoSave == 'function') {
        callback = autoSave;
        autoSave = false;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    if (typeof property !== 'string') return callback('Property must be string');

    this._node.data[property] = value;

    if (autoSave) {
        this.save(function(err) {
            if (err) return callback('Save error: ' + err);
            callback(null)
        })
    } else {
        callback(null)
    }
}

Node.prototype.getProperty = function(property) {
    if (typeof this._node.data[property] === 'undefined')
        return undefined;
    return this._node.data[property];
}

Node.prototype.createRelationshipTo = function(toNode, type, props, callback) {
    if (typeof props === 'function') {
        callback = props;
        props = {};
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    if (typeof type !== 'string')
        return callback('Type is required')

    if (!toNode instanceof Node)
        callback('toNode must be an instance of Node.class')

    var query = [
        'START node = node({id}), toNode = node({toNode})',
        'CREATE (node)-[relationship:RELTYPE {props}]->(toNode)',
        'SET node = {props}',
        'RETURN relationship'
    ].join('\n')
        .replace('RELTYPE', type);

    var params = {
        id: this.id,
        toNode: toNode.id,
        props: props
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        var relationship = new Relationship(response.rest[0].relationship)
        callback(err, response);
    })
}

Node.prototype.createRelationshipFrom = function(fromNode, type, props, callback) {
    if (typeof props === 'function') {
        callback = props;
        props = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    if (typeof type !== 'string')
        return callback('Type is required')

    if (!fromNode instanceof Node)
        callback('toNode must be an instance of Node.class')

    var query = [
        'START node = node({id}), toNode = node({toNode})',
        'CREATE (node)-[relationship:RELTYPE {props}]->(toNode)',
        'SET node = {props}',
        'RETURN relationship'
    ].join('\n')
        .replace('RELTYPE', type);

    var params = {
        id: fromNode.id,
        toNode: this.id,
        props: props
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        var relationship = new Relationship(response.rest[0].relationship)
        callback(err, response);
    })
}

Node.prototype.getRelationships = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) -[relationships]- ()',
            'RETURN relationships'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) -[relationships:RELTYPE]- ()',
            'RETURN relationships'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        results = response.rest.map(function (result) {
            return new Relationship(result.relationships)
        });
        callback(err, results);
    })
}

Node.prototype.getIncomingRelationships = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) <-[relationships]- ()',
            'RETURN relationships'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) <-[relationships:RELTYPE]- ()',
            'RETURN relationships'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        results = response.rest.map(function (result) {
            return new Relationship(result.relationships)
        });
        callback(err, results);
    })
}

Node.prototype.getOutgoingRelationships = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) -[relationships]-> ()',
            'RETURN relationships'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) -[relationships:RELTYPE]-> ()',
            'RETURN relationships'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        results = response.rest.map(function (result) {
            return new Relationship(result.relationships)
        });
        callback(err, results);
    })
}

Node.prototype.getAdjacentNodes = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) -[]- (nodes)',
            'RETURN nodes'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) -[:RELTYPE]- (nodes)',
            'RETURN nodes'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        nodes = response.rest.map(function (result) {
            return new Node(result.nodes)
        });
        callback(err, nodes);
    })
}

Node.prototype.getIncomingNodes = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) <-[]- (nodes)',
            'RETURN nodes'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) <-[:RELTYPE]- (nodes)',
            'RETURN nodes'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        nodes = response.rest.map(function (result) {
            return new Node(result.nodes)
        });
        callback(err, nodes);
    })
}

Node.prototype.getOutgoingNodes = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) -[]-> (nodes)',
            'RETURN nodes'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'OPTIONAL MATCH (node) -[:RELTYPE]-> (nodes)',
            'RETURN nodes'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        nodes = response.rest.map(function (result) {
            return new Node(result.nodes)
        });
        callback(err, nodes);
    })
}

Node.prototype.createConstraint = function(label, property, callback) {
    if (typeof label !== 'undefined')
        throw new Error('Label is required')

    if (typeof property !== 'undefined')
        throw new Error('Property is required')

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query = [
        'START node = node({id})',
        'CREATE CONSTRAINT ON (node:LABEL) ASSERT node.PROPERTY IS UNIQUE'
    ].join('\n')
        .replace('LABEL', label)
        .replace('PROPERTY', property);

    var params = {
        id: this.id
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        var relationship = new Relationship(response.rest[0].relationship)
        callback(err, response);
    })
}

Node.prototype.deleteConstraint = function(label, property, callback) {
    if (typeof label !== 'undefined')
        throw new Error('Label is required')

    if (typeof property !== 'undefined')
        throw new Error('Property is required')

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query = [
        'START node = node({id})',
        'DROP CONSTRAINT ON (node:LABEL) ASSERT node.PROPERTY IS UNIQUE'
    ].join('\n')
        .replace('LABEL', label)
        .replace('PROPERTY', property);

    var params = {
        id: this.id
    };

    var transaction = new Transaction();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        var relationship = new Relationship(response.rest[0].relationship)
        callback(err, response);
    })
}