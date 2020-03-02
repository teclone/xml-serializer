/**
 * Utility module
 * this module defines a bunch of utility functions that will be relevant to most other modules
 */
export default {
  /**
   * tests if a variable is a DOCUMENT_NODE
   *@param {*} node - node to test
   *@returns {boolean}
   */
  isDocumentNode(node) {
    return node && node.nodeType === 9;
  },

  /**
   * tests if a variable is an ELEMENT_NODE
   *@param {*} node - node to test
   *@returns {boolean}
   */
  isElementNode(node) {
    return node && node.nodeType === 1;
  },

  /**
   * tests if a variable is an ATTRIBUTE_NODE
   *@param {*} node - node to test
   *@returns {boolean}
   */
  isAttributeNode(node) {
    return (
      node &&
      (node.nodeType === 2 || Object.prototype.toString.call(node) === '[object Attr]')
    );
  },

  /**
   * tests if a variable is a TEXT_NODE
   *@param {*} node - node to test
   *@returns {boolean}
   */
  isTextNode(node) {
    return node && node.nodeType === 3;
  },

  /**
   * tests if a variable is a PROCESSING_INSTRUCTION_NODE
   *@param {*} node - node to test
   *@returns {boolean}
   */
  isProcessingInstructionNode(node) {
    return node && node.nodeType === 7;
  },

  /**
   * tests if a variable is a COMMENT_NODE
   *@param {*} node - node to test
   *@returns {boolean}
   */
  isCommentNode(node) {
    return node && node.nodeType === 8;
  },

  /**
   * tests if a variable is a DOCUMENT_TYPE_NODE
   *@param {*} node - node to test
   *@returns {boolean}
   */
  isDocTypeNode(node) {
    return node && node.nodeType === 10;
  },

  /**
   * tests if a variable is a DOM_FRAGMENT_NODE
   *@param {*} node - node to test
   *@returns {boolean}
   */
  isDOMFragmentNode(node) {
    return node && node.nodeType === 11;
  },
};
