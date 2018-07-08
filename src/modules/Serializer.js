import Util from './Util.js';

const XML_NS = 'http://www.w3.org/XML/1998/namespace',
XMLNS_NS = 'http://www.w3.org/2000/xmlns/',
HTML_NS = 'http://www.w3.org/1999/xhtml';

export default class Serializser {

    /**
     * creates an xml serializer
     *@param {boolean} [preserveWhiteSpace=false] - boolean value indicating if it should preserve
     * white spaces. defaults to false
    */
    constructor(preserveWhiteSpace) {
        this.prefixIndex = 1;
        this.dupPrefixDef = [];
        this.preserveWhiteSpace = preserveWhiteSpace === false? false : true;
    }

    /**
     * runs the XML serialization algorithm on depending on the node type
     *@param {Element} node - the element node.
     *@param {string} contextNamespace - context namespace
     *@param {Map} namespacePrefixes - a namespace prefix map
     *@param {boolean} requireWellFormed - a require well-formed flag
     *@returns {string}
     *@see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml
    */
    runSerialization(node, contextNamespace, namespacePrefixes, requireWellFormed) {
        if (Util.isElementNode(node))
            return this.serializeElement(node, contextNamespace, namespacePrefixes,
                requireWellFormed);

        if (Util.isDocumentNode(node))
            return this.serializeDocument(node, contextNamespace, namespacePrefixes,
                requireWellFormed);

        if (Util.isCommentNode(node))
            return this.serializeComment(node, requireWellFormed);

        if (Util.isTextNode(node))
            return this.serializeText(node, requireWellFormed);

        if (Util.isDOMFragmentNode(node))
            return this.serializeDocumentFragment(node, contextNamespace, namespacePrefixes,
                requireWellFormed);

        if(Util.isDocTypeNode(node))
            return this.serializeDocumentType(node, requireWellFormed);

        if (Util.isProcessingInstructionNode(node))
            return this.serializeProcessingInstruction(node, requireWellFormed);
    }

    /**
     * produces an XML serialization of root passing a value of false for the
     * require well-formed parameter, and return the result.
     *@see https://www.w3.org/TR/DOM-Parsing/#the-xmlserializer-interface
     *@param {Node} root - the root node
     *@param {boolean} [requireWellFormed=false] - boolean value indicating if it should require xml
     * well formedness
     *@returns {string}
    */
    serializeToString(root, requireWellFormed) {
        //STEP 1, 2
        let contextNamespace = null,
        namespacePrefixes = Object.create(null); //use object.create to help support older browsers

        //STEP 3
        //initialize the namspace prefix with xml namspace
        namespacePrefixes[XMLNS_NS] = 'xmlns';

        //STEP 4
        this.prefixIndex = 1;

        requireWellFormed = requireWellFormed? true : false;

        return this.runSerialization(root, contextNamespace, namespacePrefixes, requireWellFormed);
    }
}