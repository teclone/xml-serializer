import Util from './Util.js';

const XML_NS = 'http://www.w3.org/XML/1998/namespace',
  XMLNS_NS = 'http://www.w3.org/2000/xmlns/',
  HTML_NS = 'http://www.w3.org/1999/xhtml';

export default class Serializer {
  /**
   * creates an xml serializer
   *@param {boolean} [preserveWhiteSpace=false] - boolean value indicating if it should preserve
   * white spaces. defaults to false
   */
  constructor(preserveWhiteSpace) {
    this.prefixIndex = 1;
    this.dupPrefixDef = [];
    this.preserveWhiteSpace = preserveWhiteSpace === false ? false : true;
  }

  /**
   * tests if the given text value is a valid xml name production
   *@param {string} value - the text value
   *@returns {boolean}
   */
  validateXMLNameProduction(value) {
    let nameStart =
        '[a-z]|[:]|[_]|[\\u00C0-\\u00D6]|[\\u00D8-\\u00F6]|[\\u00F8-\\u02FF]|' +
        '[\\u0370-\\u037D]|[\\u037F-\\u1FFF]|[\\u200C-\\u200D]|[\\u2070-\\u218F]|' +
        '[\\u2C00-\\u2FEF]|[\\u3001-\\uD7FF]|[\\uF900-\\uFDCF]|[\\uFDF0-\\uFFFD]|' +
        '[\\uD800-\\uDBFF]|[\\uDC00-\\uDFFF]',
      nameChar =
        nameStart + '|[\\-]|[.]|[0-9]|\\u00B7|[\\u0300-\\u036F]|[\\u203F-\\u2040]';

    let regex = new RegExp(`^(${nameStart})(${nameChar})*`, 'i');
    return typeof value === 'string' && regex.test(value);
  }

  /**
   * tests if the given text value is a valid xml tag name
   *@param {string} value - the text value
   *@returns {boolean}
   */
  validateXMLTagName(value) {
    return this.validateXMLNameProduction(value) && !/^xml/i.test(value);
  }

  /**
   * tests if the given text value is a valid xml attribute name
   *@param {string} value - the text value
   *@param {string} attrNS - attribute namespace value
   *@returns {boolean}
   */
  validateXMLAttrName(value, attrNS) {
    return (
      this.validateXMLNameProduction(value) &&
      (value.toLowerCase() !== 'xmlns' || attrNS !== null)
    );
  }

  /**
   * validates xml char
   *@param {string} value - char to validate
   *@returns {boolean}
   */
  validateChar(value) {
    let char =
      '[\\u0009]|[\\u000A]|[\\u000D]|[\\u0020-\uD7FF]|[\\uE000-\\uFFFD]|' +
      '[\\uD800-\\uDBFF]|[\\uDC00-\\uDFFF]';

    let regex = new RegExp(`^(${char})*$`);
    return typeof value === 'string' && regex.test(value);
  }

  /**
   * validates xml comment
   *@param {string} comment - the xml comment
   *@returns {boolean}
   */
  validateComment(comment) {
    return (
      this.validateChar(comment) &&
      comment.indexOf('--') < 0 &&
      comment.charAt(comment.length - 1) !== '-'
    );
  }

  /**
   * tests if the public id given is valid
   *@param {string} pubId - the public id
   *@returns {boolean}
   */
  validatePublicId(pubId) {
    let pubIdChar = "[\\u0020]|[\\u000D]|[\\u000A]|[a-zA-Z0-9]|[\\-\\'()+,./:=?;!*#@$_%]";

    let regex = new RegExp(`^(${pubIdChar})*$`);
    return typeof pubId === 'string' && regex.test(pubId);
  }

  /**
   * tests if the systemId given is valid
   *@param {string} systemId - the systemId
   *@returns {boolean}
   */
  validateSystemId(systemId) {
    return this.validateChar(systemId);
  }

  /**
   * validates xml processing instruction target value
   *@param {string} target - the target text
   *@returns {boolean}
   */
  validatePITarget(target) {
    return (
      this.validateChar(target) &&
      target.indexOf(':') < 0 &&
      target.toLowerCase() !== 'xml'
    );
  }

  /**
   * validates xml processing instruction data value
   *@param {string} data - the data value
   *@returns {boolean}
   */
  validatePIData(data) {
    return this.validateChar(data) && data.indexOf('?>') < 0;
  }

  /**
   * checks if the given tuple consisting of namespaceURI and localName pair exists in the records
   *@param {Array} records - tuple records
   *@param {Array} tuple - the tuple to check
   *@returns {boolean}
   */
  tupleExists(records, tuple) {
    let exists = false,
      len = tuple.length;
    for (let record of records) {
      if (len === record.length) {
        exists = true;
        let i = -1;
        while (++i < len) {
          if (record[i] !== tuple[i]) {
            exists = false;
            break;
          }
        }
      }
      if (exists) break;
    }
    return exists;
  }

  /**
   * generate a element prefix
   *@param {Map} map - namespace prefix map,
   *@param {string} ns - the new namespace
   *@returns {string}
   *@see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-generate-prefix
   */
  generatePrefix(map, ns) {
    let generatedPrefix = 'ns' + this.prefixIndex++;
    map[ns] = generatedPrefix;

    return generatedPrefix;
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
    let defNSAttrValue = null,
      attributes = elem.attributes,
      i = -1,
      len = attributes.length;

    //STEP 2
    while (++i < len) {
      //STEP 2. 1, 2
      let attr = attributes[i],
        attrNS = attr.namespaceURI,
        attrPrefix = attr.prefix;
      //STEP 2.3
      if (attrNS === XMLNS_NS) {
        //STEP 2.3.1
        if (attrPrefix === null) {
          defNSAttrValue = attr.value;
          continue;
        }

        // STEP 2.3.2
        //STEP 2.3.2.1 & 2.3.2.2
        let prefixDef = attr.localName,
          nsDef = attr.value;

        //STEP 2.3.2.3
        if (typeof prefixMap[nsDef] !== 'undefined' && prefixMap[nsDef] === prefixDef)
          this.dupPrefixDef.push(prefixDef);
        //STEP 2.3.2.4 & 2.3.2.5 combined
        else prefixMap[nsDef] = prefixDef;

        //STEP 2.3.3.6
        elmPrefixList.push(prefixDef);
      }
    }
    return defNSAttrValue;
  }

  /**
   * serializes an attribute value given an attribute value and require well-formed flag
   *@param {string} value - the attribute value
   *@param {boolean} requireWellFormed - boolean value indicating if well formedness is a
   * requirement
   *@returns {string}
   *@see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-attr-value
   */
  serializeAttrValue(value, requireWellFormed) {
    if (requireWellFormed && !this.validateChar(value))
      throw new Error(value + ' is not a valid attribute value');

    if (value === null) return '';

    return value
      .replace('"', '&quot;')
      .replace('&', '&amp;')
      .replace('<', '&lt;')
      .replace('>', '&gt;');
  }

  /**
   * produces the XML serialization of the attributes of an element
   *@param {Element} node - the element node
   *@param {Map} map - namespace prefix map,
   *@param {boolean} ignoreNSDefAttr - a boolean ignore namespace definition attribute flag,
   *@param {string} dupPrefixDef - a duplicate prefix definition value
   *@param {boolean} requireWellFormed - a boolean require well-formed xml flag
   *@returns {string}
   *@see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml-attributes
   */
  serializeAttributes(node, map, ignoreNSDefAttr, requireWellFormed) {
    //STEP 1, 2
    let result = '',
      localNameSet = [];

    let attributes = node.attributes,
      i = -1,
      len = attributes.length;

    //STEP 3
    while (++i < len) {
      let attr = attributes[i],
        nsURI = attr.namespaceURI,
        localName = attr.localName,
        prefix = attr.prefix;

      let tuple = [nsURI, localName];
      //STEP 3.1
      /* istanbul ignore if */
      if (requireWellFormed && this.tupleExists(localNameSet, tuple))
        throw new Error(
          'element cannot have two attributes with the same namespaceURI and localName',
        );

      //STEP 3.2
      localNameSet.push(tuple);

      //STEP 3. 3, 4
      let attrNS = nsURI,
        candidatePrefix = null;
      //STEP 3.5
      /* istanbul ignore else */
      if (attrNS !== null) {
        //STEP 3.5.1
        if (
          attrNS === XMLNS_NS &&
          ((prefix === null && ignoreNSDefAttr) ||
            (prefix !== null && this.dupPrefixDef.includes(localName)))
        ) {
          continue;
        } else if (prefix === null) {
          candidatePrefix = null;
        }

        //STEP 3.5.2
        else if (typeof map[attrNS] !== 'undefined') {
          candidatePrefix = map[attrNS];
        }

        //STEP 3.5.3
        else {
          candidatePrefix = this.generatePrefix(map, attrNS);
          result += ` xmlns:${candidatePrefix}="${this.serializeAttrValue(attrNS)}"`;
        }
      }

      //STEP 3.6
      result += ' ';

      //STEP 3.7
      if (candidatePrefix !== null) result += candidatePrefix + ':';

      //STEP 3.8
      /* istanbul ignore if */
      if (requireWellFormed && !this.validateXMLAttrName(localName, attrNS))
        throw new Error(localName + ' is not a valid xml attribute name');

      //STEP 3.9
      result += `${localName}="${this.serializeAttrValue(attr.value)}"`;
    }

    //STEP 4
    return result;
  }

  /**
   * serializes processing instruction node
   *@param {ProcessingInstruction} node - the processing instruction node
   *@param {boolean} requireWellFormed - boolean value indicating if well formedness is a
   * requirement
   *@returns {string}
   */
  serializeProcessingInstruction(node, requireWellFormed) {
    //STEP 1
    if (requireWellFormed && !this.validatePITarget(node.target))
      throw new Error(
        node.target + ' is not a valid processing instruction target value',
      );

    //STEP 2
    if (requireWellFormed && !this.validatePIData(node.data))
      throw new Error(
        node.data + ' contains invalid processing instruction character values',
      );

    let target = this.preserveWhiteSpace ? node.target : node.target.trim(),
      data = this.preserveWhiteSpace ? node.data : node.data.trim();
    //STEP 4
    let markup = `<?${target} ${data}?>`;

    //STEP 4
    return markup;
  }

  /**
   * generate document type serialization
   *@param {DocumentType} docType - the document type node
   *@param {boolean} requireWellFormed - boolean value indicating if well formedness is a
   * requirement
   *@returns {string}
   *@see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-doctype
   */
  serializeDocumentType(docType, requireWellFormed) {
    //STEP 1
    if (requireWellFormed && !this.validatePublicId(docType.publicId))
      throw new Error(
        docType.publicId + ' contains invalid xml document pubId character value',
      );

    //STEP 2
    if (requireWellFormed && !this.validateSystemId(docType.systemId))
      throw new Error(
        docType.systemId + ' contains invalid xml document systemId character value',
      );

    //STEP 3, 4, 5
    let markup = '<!DOCTYPE ',
      publicId = this.preserveWhiteSpace ? docType.publicId : docType.publicId.trim(),
      systemId = this.preserveWhiteSpace ? docType.systemId : docType.systemId.trim();

    if (publicId === '' && systemId === '' && /^html$/i.test(docType.name))
      markup += docType.name.toLowerCase();
    else markup += docType.name;

    //STEP 7
    if (publicId !== '') markup += ` PUBLIC "${publicId}"`;

    //STEP 8
    if (systemId !== '' && publicId === '') markup += ` SYSTEM`;

    //STEP 9
    if (systemId !== '') markup += ` "${systemId}"`;

    //STEP 10
    markup += '>';

    return markup;
  }

  /**
   * runs the XML serialization algorithm on a document fragment node
   *@param {DocumentFragment} node - the document fragment node.
   *@param {string} namespace - context namespace
   *@param {Map} prefixMap - a namespace prefix map
   *@param {boolean} requireWellFormed - a require well-formed flag
   *@returns {string}
   *@see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-xml-serialization-algorithm
   */
  serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed) {
    let markup = '',
      childNodes = node.childNodes,
      len = childNodes.length,
      i = -1;

    while (++i < len) {
      markup += this.runSerialization(
        childNodes[i],
        namespace,
        prefixMap,
        requireWellFormed,
      );
    }
    return markup;
  }

  /**
   * produces the XML serialization of a comment node
   *@param {Text} node - the text node
   *@param {boolean} requireWellFormed - a boolean require well-formed xml flag
   *@returns {string}
   */
  serializeText(node, requireWellFormed) {
    if (requireWellFormed && !this.validateChar(node.data))
      throw new Error(node.data + ' is not a valid xml text data');

    let data = this.preserveWhiteSpace ? node.data : node.data.trim();
    return data
      .replace(/\&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * produces the XML serialization of a comment node
   *@param {Comment} node - the comment node
   *@param {boolean} requireWellFormed - a boolean require well-formed xml flag
   *@returns {string}
   */
  serializeComment(node, requireWellFormed) {
    if (requireWellFormed && !this.validateComment(node.data))
      throw new Error(node.data + ' is not a valid xml comment data');

    return '<!--' + node.data + '-->';
  }

  /**
   * runs the XML serialization algorithm on a document node
   *@param {Element} node - the element node.
   *@param {string} namespace - context namespace
   *@param {Map} prefixMap - a namespace prefix map
   *@param {boolean} requireWellFormed - a require well-formed flag
   *@returns {string}
   *@see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-xml-serialization-algorithm
   */
  serializeDocument(node, namespace, prefixMap, requireWellFormed) {
    if (requireWellFormed && node.documentElement === null)
      throw new Error('document has no document element root');

    let serializeDocument = `<?xml version="1.0" encoding="${node.characterSet}"?>`;

    let childNodes = node.childNodes,
      len = childNodes.length,
      i = -1;

    while (++i < len) {
      serializeDocument += this.runSerialization(
        childNodes[i],
        namespace,
        prefixMap,
        requireWellFormed,
      );
    }
    return serializeDocument;
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
    if (requireWellFormed && !this.validateXMLTagName(localName))
      throw new Error(localName + ' is not a valid xml element local name');

    //STEP 2, 3, 4, 5, 6, 7
    //declare markup, element qualified tag name, skip end tag boolean value, ignore
    //namespace definition attribute, prefix map copy, element prefix list and
    //duplicate prefix definition variables
    let markup = '<',
      qualifiedName = '',
      skipEndTag = false,
      ignoreNSDefAttr = false,
      map = Object.assign(Object.create(null), prefixMap),
      elmPrefixList = [];

    //STEP 8
    this.dupPrefixDef = [];

    //STEP 9:
    //get local definition namespace, update map copy and add any new element prefixes
    let localDefNS = this.recordElementNSInfo(
        node,
        map,
        elmPrefixList,
        this.dupPrefixDef,
      ),
      //STEP 10, 11
      //delcare inherited namespace as parent namespace, and ns as node namespace uri
      inheritedNS = namespace,
      ns = node.namespaceURI;

    //STEP 12
    if (inheritedNS === ns) {
      //STEP 12.1
      /* istanbul ignore if */
      if (localDefNS !== null) ignoreNSDefAttr = true;

      //STEP 12.2
      /* istanbul ignore if */
      if (ns === XML_NS) qualifiedName = 'xml:' + localName;
      //STEP 12.3
      else qualifiedName = localName;

      //STEP 12.4
      markup += qualifiedName;
    }

    //STEP 13
    else {
      //STEP 13. 1, 2
      let prefix = node.prefix,
        candidatePrefix = typeof map[ns] !== 'undefined' ? map[ns] : null;

      //STEP 13.3
      /* istanbul ignore else */
      if (candidatePrefix !== null) {
        //STEP 13.3.1
        qualifiedName = candidatePrefix + ':' + localName;

        //STEP 13.3.2
        /* istanbul ignore if */
        if (localDefNS !== null) inheritedNS = ns;

        //STEP 13.3.3
        markup += qualifiedName;
      }

      //STEP 13.4
      else if (prefix !== null && localDefNS === null) {
        //STEP 13.4.1
        if (elmPrefixList.includes(prefix)) {
          // it will use the prefixIndex instance variable. as js can't pass values by reference
          prefix = this.generatePrefix(map, ns);
        }
        //STEP 13.4.2
        else {
          map[ns] = prefix;
        }

        //STEP 13.4.3
        qualifiedName = prefix + ':' + localName;
        //STEP 13.4.4
        markup += qualifiedName;

        //STEP 13.4.5. 1, 2, 3, 4, 5, 6
        markup += ` xmlns:${prefix}="${this.serializeAttrValue(ns, requireWellFormed)}"`;
      }

      //STEP 13.5
      else if (localDefNS === null || localDefNS !== ns) {
        //STEP 13.5. 1, 2, 3
        ignoreNSDefAttr = true;
        qualifiedName = localName;
        inheritedNS = ns;

        //STEP 13.5.4
        markup += qualifiedName;

        //STEP 13.5.5. 1, 2, 3, 4, 5, 6
        markup += ` xmlns="${this.serializeAttrValue(ns, requireWellFormed)}"`;
      }

      //STEP 13.6
      else {
        qualifiedName = localName;
        inheritedNS = ns;
        markup += qualifiedName;
      }
    }

    //STEP 14
    markup += this.serializeAttributes(node, map, ignoreNSDefAttr, requireWellFormed);

    //STEP 15
    if (
      ns === HTML_NS &&
      !node.hasChildNodes() &&
      /^(area|base|basefont|bgsound|br|col|embed|frame|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i.test(
        localName,
      )
    ) {
      markup += ' /';
      skipEndTag = true;
    }

    //STEP 16
    if (ns !== HTML_NS && !node.hasChildNodes()) {
      markup += '/';
      skipEndTag = true;
    }

    //STEP 17
    markup += '>';

    //STEP 18
    if (skipEndTag) return markup;

    //STEP 19
    if (ns === HTML_NS && localName.toLowerCase() === 'template') {
      markup += this.runSerialization(node.content, inheritedNS, map, requireWellFormed);
    }

    //STEP 20
    else {
      let len = node.childNodes.length,
        i = -1;
      while (++i < len) {
        markup += this.runSerialization(
          node.childNodes[i],
          inheritedNS,
          map,
          requireWellFormed,
        );
      }
    }

    //STEP 21
    markup += '</' + qualifiedName + '>';

    return markup;
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
      return this.serializeElement(
        node,
        contextNamespace,
        namespacePrefixes,
        requireWellFormed,
      );

    if (Util.isDocumentNode(node))
      return this.serializeDocument(
        node,
        contextNamespace,
        namespacePrefixes,
        requireWellFormed,
      );

    if (Util.isCommentNode(node)) return this.serializeComment(node, requireWellFormed);

    if (Util.isTextNode(node)) return this.serializeText(node, requireWellFormed);

    if (Util.isDOMFragmentNode(node))
      return this.serializeDocumentFragment(
        node,
        contextNamespace,
        namespacePrefixes,
        requireWellFormed,
      );

    if (Util.isDocTypeNode(node))
      return this.serializeDocumentType(node, requireWellFormed);

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

    requireWellFormed = requireWellFormed ? true : false;

    return this.runSerialization(
      root,
      contextNamespace,
      namespacePrefixes,
      requireWellFormed,
    );
  }
}
