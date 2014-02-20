var Neo4j = require('./Neo4j'),
	QueryBuilder = require('./QueryBuilder'),
	Transaction = require('./Transaction'),

	Node = require('./Node'),
	Relationship = require('./Relationship'),
	Index = require('./Index'),

	db;

function neo4node(url, port, user, pass) {
    this.config = {
    	url: url || process.env.NEO4J_URL || 'localhost',
    	port: port || process.env.NEO4J_PORT || 7474,
    	user: user || process.env.NEO4J_USER || null,
    	pass: pass || process.env.NEO4J_PASS || null
    }

    db = new Neo4j(this.config.url, this.config.port, this.config.user, this.config.pass);
}

exports = module.exports = neo4node;

neo4node.prototype.newTransaction = function() {
	return new Transaction(this.config.url, this.config.port, this.config.user, this.config.pass)
}

neo4node.prototype.newQueryBuilder = function() {
	var transaction = new Transaction(this.config.url, this.config.port, this.config.user, this.config.pass)
	return new QueryBuilder(transaction)
}

neo4node.prototype.newNeo4j = function() {
	return new Neo4j(this.config.url, this.config.port, this.config.user, this.config.pass)
}

neo4node.prototype.Node = function(_node) {
	return new Node(_node, this.config.url, this.config.port, this.config.user, this.config.pass);
}

neo4node.prototype.Relationship = function(_relationship) {
	return new Relationship(_relationship, this.config.url, this.config.port, this.config.user, this.config.pass);
}

neo4node.prototype.Index = function(object) {
	return new Index(object, this.config.url, this.config.port, this.config.user, this.config.pass);
}

//INDEX

neo4node.prototype.queryNodeIndex = function (index, query, callback) {
    if (typeof query === 'function') {
        callback = query;
        query = '*:*';
    }

    if (typeof callback !== 'function') 
        throw 'A callback is required but missing';

    if (typeof index === 'object')
        index = index.name;

    if (typeof index === 'undefined')
        callback('index is a required param')

    var query = [
        'START nodes = node:INDEX("QUERY")',
        'RETURN nodes'
    ].join('\n')
        .replace('INDEX', index)
        .replace('QUERY', query);

    db.cypher(query, {}, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        results = results.nodes.map(function (node) {
            return new Node(node);
        })
        return callback(null, results);
    })
}

neo4node.prototype.matchNodeIndex = function (index, key, value, callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback required');

    if (typeof index === 'object')
        index = index.name;

    if (typeof index === 'undefined' || typeof key === 'undefined' || typeof value === 'undefined')
        callback('Missing required params');

    var query = [
        'START nodes = node:INDEX(KEY="VALUE")',
        'RETURN nodes'
    ].join('\n')
        .replace('INDEX', index)
        .replace('KEY', key)
        .replace('VALUE', value);

    db.cypher(query, {}, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        results = results.nodes.map(function (node) {
            return new Node(node);
        })
        return callback(null, results);
    })
}

neo4node.prototype.listNodeIndexes = function (callback) {

    /**
    * Returns array of <Index>
    *
    * @method listNodeIndexes
    * @param {Function} callback callback(err, indexes)
    */

    var indexes = [];

    db.REST('GET', '/index/node/', function (err, status, results) {
        if (err)
            return callback(err);
        
        for (index in results) {
            if (typeof results[index] !== 'undefined') {
                var index = new Index({
                    name: index,
                    index: results[index]
                });
                indexes.push(index);
            }
        }
        callback(null, indexes);
    });
}

neo4node.prototype.createNodeIndex = function (object, callback) {

    /**
    * Returns <Index>
    *
    * @method createNodeIndex
    * @param {object} object Index informations
    * @param {String} object.name New Index name
    * @param {String} object.type Index type ('exact' || 'fulltext')
    * @param {Function} callback callback(err, index)
    * @return object Index
    */

    if (typeof callback === 'undefined' || typeof callback !== 'function') throw 'A callback is required but missing'

    if (typeof object === 'undefined' ||
        typeof object.name === 'undefined' ||
        typeof object.type === 'undefined') return callback('Missing params');

    if (['fulltext', 'exact'].indexOf(object.type) === -1) return callback('invalid index type');

    var data = {
        name: object.name,
        config: {
            type: object.type,
            provider: object.provider || 'lucene'
        }
    }

    db.REST('POST', '/index/node/', data, function (err, status, index) {
        var index = new Index({
            name: object.name,
            index: index,
            indexType: 'node'
        });
        if (err) return callback(err);
        callback(null, index);
    });
}

neo4node.prototype.queryRelationshipIndex = function (index, query, callback) {
    if (typeof query === 'function') {
        callback = query;
        query = '*:*';
    }

    if (typeof callback !== 'function') 
        throw 'A callback is required but missing';

    if (typeof index === 'object')
        index = index.name;

    if (typeof index === 'undefined')
        callback('index is a required param')

    var query = [
        'START relationships = relationship:INDEX("QUERY")',
        'RETURN relationships'
    ].join('\n')
        .replace('INDEX', index)
        .replace('QUERY', query);

    db.cypher(query, {}, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        results = results.relationships.map(function (relationship) {
            return new Relationship(relationship);
        })
        return callback(null, results);
    })
}

neo4node.prototype.matchRelationshipIndex = function (index, key, value, callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback required');

    if (typeof index === 'object')
        index = index.name;

    if (typeof index === 'undefined' || typeof key === 'undefined' || typeof value === 'undefined')
        callback('Missing required params');

    var query = [
        'START relationships = relationship:INDEX(KEY="VALUE")',
        'RETURN relationships'
    ].join('\n')
        .replace('INDEX', index)
        .replace('KEY', key)
        .replace('VALUE', value);

    db.cypher(query, {}, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        results = results.relationships.map(function (relationship) {
            return new Relationship(relationship);
        })
        return callback(null, results);
    })
}

neo4node.prototype.listRelationshipIndexes = function (callback) {

    /**
    * Returns array of <Index>
    *
    * @method listRelationshipIndexes
    * @param {Function} callback callback(err, indexes)
    */

    var indexes = [];

    db.REST('GET', '/index/relationship/', function (err, status, results) {
        if (err) return callback(err);
        for (index in results) {
            if (typeof results[index] !== 'undefined') {
                var index = new Index({
                    name: index,
                    index: results[index]
                });
                indexes.push(index);
            }
        }
        callback(null, indexes);
    });
}

neo4node.prototype.createRelationshipIndex = function (object, callback) {
    
    /**
    * Returns <Index>
    *
    * @method createRelationshipIndex
    * @param {object} object Index informations
    * @param {String} object.name New Index name
    * @param {String} object.type Index type ('exact' || 'fulltext')
    * @param {Function} callback callback(err, index)
    * @return object Index
    */

    if (typeof callback === 'undefined' || typeof callback !== 'function') throw 'A callback is required but missing'

    if (typeof object === 'undefined' ||
        typeof object === 'undefined' ||
        typeof object.name === 'undefined' ||
        typeof object.type === 'undefined') return callback('Missing params');

    if (['fulltext', 'exact'].indexOf(object.type) === -1) return callback('invalid index type');

    var data = {
        name: object.name,
        config: {
            type: object.type,
            provider: object.provider || 'lucene'
        }
    }

    db.REST('POST', '/index/relationship/', data, function (err, status, index) {
        var index = new Index({
            name: object.name,
            index: index,
            indexType: 'relationship'
        });
        if (err) return callback(err);
        callback(null, index);
    });
}


//Node

neo4node.prototype.create = function(properties, callback) {

    /**
    * Create a new node in Neo4j graph db
    *
    * @method create
    * @param {object} properties JSON representation of node properties (optional)
    * @param {Function} callback callback(err, node)
    */

    if (typeof properties === 'function') {
        callback = properties;
        properties = {};        
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var props = _parseProperties(properties);

    function _parseProperties(properties) {
        var parsedProperties = {};
        if (properties !== null) {
            for (property in properties) {
                if (properties.hasOwnProperty(property)) {
                    parsedProperties[property] = properties[property];
                }
            }
        }
        return parsedProperties
    }

    var query = [
        'CREATE (node {props})',
        'RETURN node',
    ].join('\n');

    var params = {
        props: props
    };

    var transaction = new Transaction(this.config.url, this.config.port, this.config.user, this.config.pass)();
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        callback(err, response);
    })
}

neo4node.prototype.getNodeById = function(id, callback) {
    
    var self = this;

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    if (Array.isArray(id))
        id = id.toString();

    var query = [
        'START node = node({id})',
        'RETURN node',
    ].join('\n');

    var params = {
        id: Number(id),
    };

    var transaction = new Transaction(self.config.url, self.config.port, self.config.user, self.config.pass);
    transaction.commit(query, params, function (err, response) {
        if (err) return callback(err);
        var node = new Node(response.rest[0].node, self.config.url, self.config.port, self.config.user, self.config.pass)
        callback(err, node);
    })
}