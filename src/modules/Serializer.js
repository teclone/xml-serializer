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
     * records the namespace information for an element
     *@param {Element} elem - the element node
     *@param {Map} prefixMap - element prefix to namespace map
     *@param {Array} elmPrefixList - element current prefix list
     *@returns {string}
     *@see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-record-namespace-info
    */
    recordElementNSInfo(elem, prefixMap, elmPrefixList) {
        //STEP 1
        let defNSAttrValue = null, attributes = elem.attributes, i = -1,
        len = attributes.length;

        //STEP 2
        while (++i < len) {
            //STEP 2. 1, 2
            let attr = attributes[i], attrNS = attr.namespaceURI, attrPrefix = attr.prefix;
            //STEP 2.3
            if (attrNS === XMLNS_NS) {
                //STEP 2.3.1
                if (attrPrefix === null) {
                    defNSAttrValue = attr.value;
                    continue;
                }

                // STEP 2.3.2
                //STEP 2.3.2.1 & 2.3.2.2
                let prefixDef = attr.localName, nsDef = attr.value;

                //STEP 2.3.2.3
                if (typeof prefixMap[nsDef] !== 'undefined' && prefixMap[nsDef] === prefixDef)
                    this.dupPrefixDef.push(prefixDef);

                //STEP 2.3.2.4 & 2.3.2.5 combined
                else
                    prefixMap[nsDef] = prefixDef;

                //STEP 2.3.3.6
                elmPrefixList.push(prefixDef);
            }
        }
        return defNSAttrValue;
    }

    /**
     * runs the XML serialization algorithm on an element node
     *@param {Element} node - the element node.
     *@param {string} namespace - context namespace
     *@param {Map} prefixMap - a namespace prefix map
     *@param {boolean} requireWellFormed - a require well-formed flag
     *@returns {string}
     *@see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-xml-serialization-algorithm
    */
    serializeElement(node, namespace, prefixMap, requireWellFormed) {
        let localName = node.localName; //get element local name

        // STEP 1: if require well formed is true, and local name is not a valid xml tag name, throw error
        /* istanbul ignore if */
        if(requireWellFormed && !this.validateXMLTagName(localName))
            throw new Error(localName + ' is not a valid xml element local name');

        //STEP 2, 3, 4, 5, 6, 7
        //declare markup, element qualified tag name, skip end tag boolean value, ignore
        //namespace definition attribute, prefix map copy, element prefix list and
        //duplicate prefix definition variables
        let markup = '<', qualifiedName = '', skipEndTag = false, ignoreNSDefAttr = false,
        map = Object.assign(Object.create(null), prefixMap), elmPrefixList = [];

        //STEP 8
        this.dupPrefixDef = [];

        //STEP 9:
        //get local definition namespace, update map copy and add any new element prefixes
        let localDefNS = this.recordElementNSInfo(node, map, elmPrefixList, this.dupPrefixDef),

        //STEP 10, 11
        //delcare inherited namespace as parent namespace, and ns as node namespace uri
        inheritedNS = namespace,
        ns = node.namespaceURI;
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