import Util from '../../src/modules/Util.js';

describe('Util module', function() {

    describe('.isDocumentNode(node)', function() {
        it('should return true if argument is a document node', function() {
            expect(Util.isDocumentNode(document)).to.be.true;
        });

        it('should return false if argument is not a document node', function() {
            expect(Util.isDocumentNode(document.documentElement)).to.be.false;
            expect(Util.isDocumentNode(document.createDocumentFragment())).to.be.false;
        });
    });

    describe('.isElementNode(node)', function() {
        it('should return true if argument is an element node', function() {
            expect(Util.isElementNode(document.body)).to.be.true;
        });

        it('should return false if argument is not an element node', function() {
            expect(Util.isElementNode(document)).to.be.false;
        });
    });

    describe('.isAttributeNode(node)', function() {

        it('should return true if argument is an attribute node', function() {
            let attr = document.createAttribute('id');
            expect(Util.isAttributeNode(attr)).to.be.true;
        });

        it('should return false if argument is not an attribute node', function() {
            expect(Util.isAttributeNode(document)).to.be.false;
        });
    });

    describe('.isTextNode(node)', function() {

        it('should return true if argument is a text node', function() {
            let textNode = document.createTextNode('come here');
            expect(Util.isTextNode(textNode)).to.be.true;
        });

        it('should return false if argument is not a text node', function() {
            expect(Util.isTextNode(document)).to.be.false;
        });
    });

    describe('.isDomFragmentNode(node)', function() {

        it('should return true if argument is a dom fragment node', function() {
            let domFragment = document.createDocumentFragment();
            expect(Util.isDOMFragmentNode(domFragment)).to.be.true;
        });

        it('should return false if argument is not a dom fragment node', function() {
            expect(Util.isDOMFragmentNode(document)).to.be.false;
        });
    });

    describe('.isCommentNode(node)', function() {

        it('should return true if argument is a comment node', function() {
            let doc = (new window.DOMParser()).parseFromString('<root></root>',  "application/xml");
            let comment = doc.createComment('This is a not-so-secret comment in your document');
            expect(Util.isCommentNode(comment)).to.be.true;
        });

        it('should return false if argument is not a dom comment node', function() {
            expect(Util.isCommentNode(document)).to.be.false;
        });
    });

    describe('.isProcessingInstructionNode(node)', function() {

        it('should return true if argument is a processing instruction node', function() {
            let doc = (new window.DOMParser()).parseFromString('<root></root>',  "application/xml");
            let processingInstruction = doc.createProcessingInstruction('xml-stylesheet', 'href="mycss.css" type="text/css"');
            expect(Util.isProcessingInstructionNode(processingInstruction)).to.be.true;
        });

        it('should return false if argument is not a processing instruction node', function() {
            expect(Util.isProcessingInstructionNode(document)).to.be.false;
        });
    });

    describe('.isDocTypeNode(node)', function() {

        it('should return true if argument is a document type node', function() {
            let doctype = document.implementation.createDocumentType('svg:svg', '', '');
            expect(Util.isDocTypeNode(doctype)).to.be.true;
        });

        it('should return false if argument is not a document type node', function() {
            expect(Util.isDocTypeNode(document)).to.be.false;
        });
    });
});