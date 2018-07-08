import Serializer from './modules/Serializer.js';

export default class {
    /**
     *@param {boolean} [preserveWhiteSpace=true] - boolean value indicating if white spaces
     * should be preserved as it is in the source
    */
    constructor(preserveWhiteSpace) {
        this.serializer = new Serializer(preserveWhiteSpace);
    }

    /**
     * produces an XML serialization of root passing a value of false for the
     * require well-formed parameter, and return the result.
     *@param {Node} root - the root node
     *@param {boolean} [requireWellFormed=false] - boolean value indicating if it should require xml
     * well formedness
     *@returns {string}
    */
    serializeToString(root, requireWellFormed) {
        return this.serializer.serializeToString(root, requireWellFormed);
    }
}