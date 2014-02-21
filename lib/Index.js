/**
@module SoCo
@submodule graphDB
**/

/**
* Represents a node or relationship index in Neo4j graph database
* 
* @class Index
* @constructor
*/

function Index(object) {
    object = (typeof object !== 'undefined') ? object : {};
    if (typeof object.index === 'undefined') object.index = {};
    this.index = {
      name: (typeof object.name !== 'undefined') ? object.name : null,
      template: (typeof object.index.template !== 'undefined') ? object.index.template : null,
      provider: (typeof object.index.provider !== 'undefined') ? object.index.provider : null,
      type: (typeof object.index.type !== 'undefined') ? object.index.type : null,
      indexType: (typeof object.indexType !== 'undefined') ? object.indexType : null
    }
    if (this.index.name !== null && this.index.indexType !== null) {
        //initialization successfull
        this.index.initialized = true;
    }
};

Object.defineProperties(Index.prototype, {

    /**
    * Index name, required to be provided when instantiating Class
    * 
    * @attribute name
    * @type String
    * @default null
    * @readOnly
    * @required
    **/

    name: {
        get: function () { 
            return this.index.name;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Index template to query index
    * 
    * @attribute template
    * @type String
    * @default null
    * @readOnly
    **/

    template: {
        get: function () { 
            return this.index.template;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Index provider, typicaly lucene
    * 
    * @attribute provider
    * @type String
    * @default null
    * @readOnly
    **/

    provider: {
        get: function () { 
            return this.index.provider;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Index type, exact or fulltext
    * 
    * @attribute type
    * @type String
    * @default null
    * @readOnly
    **/

    type: {
        get: function () { 
            return this.index.type;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Indicates node or relationship index
    * 
    * @attribute indexType
    * @type String
    * @default null
    * @readOnly
    * @required
    **/

    indexType: {
        get: function () {
            return this.index.indexType;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Indicates if this object has gone through the initialization lifecycle successfully
    * 
    * @attribute initialized
    * @type String
    * @default false
    * @readOnly
    **/

    initialized: {
        get: function () {
            return this.index.initialized;
        },
        enumerable: true,
        configurable: true
    }
});

module.exports = Index;
