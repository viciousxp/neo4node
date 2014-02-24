/**
@module SoCo
@submodule graphDB
**/

/**
* Represents a relationship in Neo4j graph database
* 
* @class Relationship
* @constructor
*/

var Neo4j = require('./Neo4j')
  , db;

function Relationship(_relationship) {
    this._relationship = _relationship;

    var url = global.neo4node.url || process.env.NEO4J_URL || 'localhost';
    var port = global.neo4node.port || process.env.NEO4J_PORT || 7474;
    var user = global.neo4node.user || process.env.NEO4J_USER || null;
    var pass = global.neo4node.pass || process.env.NEO4J_PASS || null;

    db = new Neo4j(url, port, user, pass);
}

module.exports = Relationship;

// properties

Object.defineProperties(Relationship.prototype, {

    /**
    * Relationship ID, extracted from node data.
    * 
    * @attribute id
    * @type Int
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    id: {
        get: function () { 
            id = /(?:node|relationship)\/(\d+)$/.exec(this._relationship.self);
            return parseInt(id[1]);
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Start node Id.
    * 
    * @attribute startNode
    * @type Int
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    startNode: {
        get: function () { 
            id = /(?:node|relationship)\/(\d+)$/.exec(this._relationship.start);
            return parseInt(id[1]);
        },
        enumerable: true,
        configurable: true
    },

    /**
    * End node Id.
    * 
    * @attribute endNode
    * @type Int
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    endNode: {
        get: function () { 
            id = /(?:node|relationship)\/(\d+)$/.exec(this._relationship.end);
            return parseInt(id[1]);
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Relationship type.
    * 
    * @attribute type
    * @type String
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    type: {
        get: function () { 
            return this._relationship.type;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Relationship properties.
    * 
    * @attribute data
    * @type String
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    data: {
        get: function () { 
            return JSON.stringify(this._relationship.data);
        },
        enumerable: true,
        configurable: true
    }
});

Relationship.prototype.save = function(callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query = [
        'START relationship = relationship({id})',
        'SET relationship = {props}'
    ].join('\n');

    var params = {
        id: this.id,
        props:this._relationship.data
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        return callback(null)
    })
}

Relationship.prototype.setProperty = function(property, value, autoSave, callback) {
    if (typeof autoSave == 'function') {
        callback = autoSave;
        autoSave = false;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    if (typeof property !== 'string') return callback('Property must be string');

    this._relationship.data[property] = value;

    if (autoSave) {
        this.save(function(err) {
            if (err) return callback('Save error: ' + err);
            callback(null)
        })
    } else {
        callback(null)
    }
}

Relationship.prototype.getProperty = function (property) {
    if (typeof this._relationship.data[property] === 'undefined')
        return undefined;
    return this._relationship.data[property];
}

Relationship.prototype.delete = function(callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query = [
            'START relationship = relationship({id})',
            'DELETE relationship',
        ].join('\n');

    var params = {
        id: this.id,
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        return callback(null)
    })
}