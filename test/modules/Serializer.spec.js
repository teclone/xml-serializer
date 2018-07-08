import Serializer from '../../src/modules/Serializer.js';
describe('Serializer', function() {
    let serializer = null;

    let prefixMap = null;

    before(function() {
        serializer = new Serializer(false);
    });

    beforeEach(function() {
        prefixMap = Object.create(null);
        prefixMap['http://www.w3.org/2000/xmlns/'] = 'xmlns';
        serializer.prefixIndex = 1;
        serializer.dupPrefixDef = [];
    });

    describe('#validateXMLNameProduction(value)', function() {
        it(`should return true if the given value is a valid xml name production`, function() {
            expect(serializer.validateXMLNameProduction('xml')).to.be.true;
            expect(serializer.validateXMLNameProduction(':')).to.be.true;
            expect(serializer.validateXMLNameProduction('A')).to.be.true;
            expect(serializer.validateXMLNameProduction('_')).to.be.true;
        });

        it(`should return false if the given value is not a valid xml name production`, function() {
            expect(serializer.validateXMLNameProduction('')).to.be.false;
            expect(serializer.validateXMLNameProduction('-')).to.be.false;
            expect(serializer.validateXMLNameProduction('0')).to.be.false;
            expect(serializer.validateXMLNameProduction('.')).to.be.false;
            expect(serializer.validateXMLNameProduction(null)).to.be.false;
        });
    });

    describe('#validateXMLTagName(value)', function() {
        it(`should return true if the given value is a valid xml tag name`, function() {
            expect(serializer.validateXMLTagName('html')).to.be.true;
            expect(serializer.validateXMLTagName('_myElement')).to.be.true;
            expect(serializer.validateXMLTagName('my-element')).to.be.true;
        });

        it(`should return false if the given value is not a valid xml tag name`, function() {
            expect(serializer.validateXMLTagName('')).to.be.false;
            expect(serializer.validateXMLTagName('xml')).to.be.false;
            expect(serializer.validateXMLTagName('xml-')).to.be.false;
            expect(serializer.validateXMLTagName('xml.')).to.be.false;
        });
    });

    describe('#validateXMLAttrName(value, attrNS)', function() {
        it(`should return true if the given attr value is a valid attribute name`, function() {
            expect(serializer.validateXMLAttrName('xmlns')).to.be.true;
        });

        it(`should return false if the given value is not a valid attribute name or if the
        value equals xmlns but the attribute namespace is null`, function() {
            expect(serializer.validateXMLAttrName('xmlns', null)).to.be.false;
        });
    });

    describe('#validatePublicId(pubId)', function() {
        it(`should return true if the given value is a valid doc type public id`, function() {
            let doctype = document.implementation.createDocumentType('svg:svg',
            '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');

            expect(serializer.validatePublicId(doctype.publicId)).to.be.true;
            expect(serializer.validatePublicId('')).to.be.true;
        });

        it(`should return false if the given value is not a valid doc type public id`, function() {
            expect(serializer.validatePublicId('"')).to.be.false;
        });
    });

    describe('#validateChar(value)', function() {
        it(`should return true if the given value is a valid xml char`, function() {

            expect(serializer.validateChar('')).to.be.true;
            expect(serializer.validateChar('&')).to.be.true;
        });

        it(`should return false if the given value is a invalid xml char`, function() {

            expect(serializer.validateChar(null)).to.be.false;
        });
    });

    describe('#validateSystemId(systemId)', function() {
        it(`should return true if the given value is a valid doc type system id`, function() {
            let doctype = document.implementation.createDocumentType('svg:svg',
            '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');

            expect(serializer.validateSystemId(doctype.systemId)).to.be.true;
            expect(serializer.validateSystemId('')).to.be.true;
        });

        it(`should return false if the given value is not a valid doc type system id`, function() {
            expect(serializer.validatePublicId('something"\'')).to.be.false;
        });
    });

    describe('#validateComment(comment)', function() {
        it(`should return true if the given value is a valid xml comment`, function() {
            expect(serializer.validateComment('')).to.be.true;
            expect(serializer.validateComment('my comment is this. created 29:00 mins ago')).to.be.true;
        });

        it(`should return false if the given value is not a valid xml comment`, function() {
            expect(serializer.validateComment('-')).to.be.false;
            expect(serializer.validateComment('this is a great comment. but -- killed it')).to.be.false;
            expect(serializer.validateComment('this is not a great comment. because of -')).to.be.false;
        });
    });

    describe('#validatePITarget(target)', function() {
        it(`should return true if the given value is a valid xml processing instruction target`, function() {
            expect(serializer.validatePITarget('xml-stylesheet')).to.be.true;
        });

        it(`should return false if the given value is not a valid xml processing instruction target`, function() {
            expect(serializer.validatePITarget('xml:stylesheet')).to.be.false;
            expect(serializer.validatePITarget('xml')).to.be.false;
        });
    });

    describe('#validatePIData(data)', function() {
        it(`should return true if the given value is a valid xml processing instruction data`, function() {
            expect(serializer.validatePIData('href="mycss.css" type="text/css"')).to.be.true;
        });

        it(`should return false if the given value is not a valid xml processing instruction target`, function() {
            expect(serializer.validatePIData('href="mycss.css" type="text/css" ?>')).to.be.false;
        });
    });

    describe('#tupleExists(records, tuple)', function() {
        let records = null;
        before(function() {
            records = [
                ['http://www.w3.org/2000/xmlns/', 'xml'],
                ['http://www.w3.org/1999/xhtml', 'html']
            ];
        });

        it(`should return true if the given tuple exists in the given records`, function() {
            expect(serializer.tupleExists(records, ['http://www.w3.org/2000/xmlns/', 'xml']))
            .to.be.true;
            expect(serializer.tupleExists(records, ['http://www.w3.org/1999/xhtml', 'html']))
            .to.be.true;
        });

        it(`should return false if the given tuple does not exist in the given records`, function() {
            expect(serializer.tupleExists(records, ['http://www.w3.org/2000/xmlns/', 'xmlns']))
            .to.be.false;
            expect(serializer.tupleExists(records, ['http://www.w3.org/1999/xhtml', 'xhtml']))
            .to.be.false;
            expect(serializer.tupleExists(records, ['http://www.w3.org/1999/xhtml'])).to.be.false;
        });
    });

    describe('#generatePrefix(map, ns)', function() {
        it(`should generate a namespace prefix for the given namspace uri, update the map,
        increment the prefixIndex and return the generated prefix`, function() {
            expect(serializer.generatePrefix(prefixMap, 'http://www.w3.org/1999/xhtml')).to.equals('ns1');
            expect(prefixMap['http://www.w3.org/1999/xhtml']).to.equals('ns1');
            expect(serializer.prefixIndex).to.equals(2);
        });
    });

    describe('#recordElementNSInfo(elem, prefixMap, elmPrefixList, dupPrefixDef)', function() {
        it(`should record the namespace prefix for an element, override inherited values where
        possible and return the elements default namespace`, function() {
            let doc = (new window.DOMParser()).parseFromString(
                '<div xmlns="http://www.w3.org/1999/xhtml"></div>',  'application/xml');

            expect(serializer.recordElementNSInfo(doc.documentElement, prefixMap,
                [], null)).to.equals('http://www.w3.org/1999/xhtml');
        });

        it(`should add new prefix map entry or update existing one if element has some none
        default namespace definitions set and return null`, function() {
            let doc = (new window.DOMParser()).parseFromString(
                '<div xmlns:html="http://www.w3.org/1999/xhtml"></div>',  'application/xml');

            expect(serializer.recordElementNSInfo(doc.documentElement, prefixMap, [], null)).to.be.null;
            expect(prefixMap['http://www.w3.org/1999/xhtml']).to.equal('html');
        });

        it(`should set the duplicate prefix definition value if there is already an entry
        in the prefixMap whose key:value pairs matches the attr namespace definition and namespace
        prefix definitions respectively`, function() {
            let doc = (new window.DOMParser()).parseFromString(
                '<div xmlns:html="http://www.w3.org/1999/xhtml"></div>',  'application/xml');

            prefixMap['http://www.w3.org/1999/xhtml'] = 'html';
            expect(serializer.recordElementNSInfo(doc.documentElement, prefixMap, [], null)).to.be.null;
            expect(serializer.dupPrefixDef).to.deep.equals(['html']);
        });

        it(`should skip any attribute that does not belong to the xmlns namespace`, function() {
            let doc = (new window.DOMParser()).parseFromString(
                '<div name="harrison"></div>',  'application/xml');

            let clone = Object.assign(Object.create(null), prefixMap);

            expect(serializer.recordElementNSInfo(doc.documentElement, prefixMap, [], null)).to.be.null;

            expect(clone).to.deep.equals(prefixMap);
        });
    });

    describe('#serializeAttrValue(value, requireWellFormed)', function() {
        it(`should serialize the attribute and return the result`, function() {
            expect(serializer.serializeAttrValue('&come', true)).to.equals('&amp;come');
            expect(serializer.serializeAttrValue(null)).to.equals('');
            expect(serializer.serializeAttrValue('>come', true)).to.equals('&gt;come');
        });

        it(`should throw error if the value is not a valid xml char and the requireWellFormed
        parameter is set as true`, function() {
            expect(function() {
                serializer.serializeAttrValue({}, true);
            }).to.throw(Error);
        });
    });

    describe('#serializeAttributes(node, map, ignoreNSDefAttr, requireWellFormed)', function() {

        it(`should serialize the elements attributes and return it`, function() {
            let doc = (new window.DOMParser()).parseFromString('<div name="something"></div>',
            'application/xml');

            expect(serializer.serializeAttributes(doc.documentElement, prefixMap,
            false, true)).to.equals(' name="something"');
        });

        it(`should exclude an attribute if the attribute namespace is the
        xmlns namespace and the attr's prefix is null and the ignore namespace definition
        attribute flag is true`, function() {
            let doc = (new window.DOMParser()).parseFromString('<div xmlns="http://www.w3.org/2000/xmlns/"></div>',
            'application/xml');

            expect(serializer.serializeAttributes(doc.documentElement, prefixMap,true, true)).to.equals('');
        });

        it(`should exclude an attribute if the attribute namespace is the
        xmlns namespace and the attr's prefix is not null and the attr's localName
        matches the value of duplicate prefix definition`, function() {
            serializer.dupPrefixDef.push('tag');
            let doc = (new window.DOMParser()).parseFromString('<div xmlns:tag="http://www.w3.org/2000/xmlns/"></div>',
            'application/xml');

            expect(serializer.serializeAttributes(doc.documentElement, prefixMap, false, true)).to.equals('');
        });

        it(`should use existing entries in the prefix map if there is a matching prefix
        record for the attr namespace prefix`, function() {

            prefixMap['http://www.w3.org/1999/xhtml'] = 'html';

            let doc = (new window.DOMParser()) .parseFromString(
                '<div xmlns:html="http://www.w3.org/1999/xhtml" html:class="class-name"></div>',
            'application/xml');

            expect(serializer.serializeAttributes(doc.documentElement, prefixMap,
            false, true)).to.equals(' xmlns:html="http://www.w3.org/1999/xhtml" html:class="class-name"');
        });

        it(`should generate a prefix if there is no matching prefix record for the attr namespace
        prefix in the passed in prefix map`, function() {

            let doc = (new window.DOMParser()) .parseFromString(
                '<div xmlns:html="http://www.w3.org/1999/xhtml" html:class="class-name"></div>',
            'application/xml');

            expect(serializer.serializeAttributes(doc.documentElement, prefixMap,
            false, true)).to.equals(' xmlns:html="http://www.w3.org/1999/xhtml" xmlns:ns1="http://www.w3.org/1999/xhtml" ns1:class="class-name"');
        });
    });

    describe('#serializeProcessingInstruction(node, requireWellFormed)', function() {
        it(`should serialize a processing instruction node and return the result`, function() {
            let doc = (new window.DOMParser()).parseFromString('<root></root>',  'application/xml'),
            pi = doc.createProcessingInstruction('xml-stylesheet', 'href="mycss.css" type="text/css"');

            let serializedPI = serializer.serializeProcessingInstruction(pi, true);
            expect(serializedPI).to.equals('<?xml-stylesheet href="mycss.css" type="text/css"?>');
        });

        it(`should throw error if the PI target is not valid and the requireWellFormed
        parameter is set as true`, function() {
            expect(function() {
                serializer.serializeProcessingInstruction({target: null}, true);
            }).to.throw(Error);
        });

        it(`should throw error if the PI data is not valid and the requireWellFormed
        parameter is set as true`, function() {
            expect(function() {
                serializer.serializeProcessingInstruction({target: "xml-stylesheet", data: null}, true);
            }).to.throw(Error);
        });
    });

    describe('#serializeDocumentType(docType, requireWellFormed)', function() {
        it(`should serialize a document type and return the result`, function() {
            let doctype = document.implementation.createDocumentType('svg:svg',
            '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');

            let serializedDocType = serializer.serializeDocumentType(doctype, true);
            expect(serializedDocType).to.equals('<!DOCTYPE svg:svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">');
        });

        it(`should throw error if doc type public id is not valid and the requireWellFormed
            parameter is set as true`, function() {
            expect(function() {
                serializer.serializeDocumentType({publicId: null}, true);
            }).to.throw(Error);
        });

        it(`should throw error if the doc type systemId is not valid and the requireWellFormed
        parameter is set as true`, function() {
            expect(function() {
                serializer.serializeDocumentType({publicId: "", systemId: null}, true);
            }).to.throw(Error);
        });

        it(`should return the doctype name in all lowercase if the doctype belongs to an html document`, function() {
            let doctype = document.implementation.createDocumentType('HTML', '', '');

            let serializedDocType = serializer.serializeDocumentType(doctype, true);
            expect(serializedDocType).to.equals('<!DOCTYPE html>');
        });

        it(`should include the SYSTEM literal if the public id is empty and the system id
        is not empty`, function() {
            let doctype = document.implementation.createDocumentType('svg:svg',
            '', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');

            let serializedDocType = serializer.serializeDocumentType(doctype, true);
            expect(serializedDocType).to.equals('<!DOCTYPE svg:svg SYSTEM "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">');
        });
    });

    describe('#serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed)', function() {
        it(`should serialize a document fragment and return the result`, function() {
            let doc = (new window.DOMParser()) .parseFromString(
                '<root></root>','application/xml'
            );

            let documentFragment = doc.createDocumentFragment();
            let element = doc.createElement('my-element');

            element.appendChild(doc.createTextNode('this is my elements tag text content'));
            documentFragment.appendChild(element);

            let serializedDocFragment = serializer.serializeToString(documentFragment, true);

            if (element.namespaceURI) {
                expect(serializedDocFragment).to.equals('<my-element xmlns="http://www.w3.org/1999/xhtml">this is my elements tag text content</my-element>');
            }
            else {
                expect(serializedDocFragment).to.equals('<my-element>this is my elements tag text content</my-element>');
            }
        });
    });

    describe('#serializeComment(node, requireWellFormed)', function() {
        it(`should serialize a comment node and return the result`, function() {
            let doc = (new window.DOMParser()).parseFromString('<root></root>',
            'application/xml');
            let comment = doc.createComment('This is a not-so-secret comment in your document');

            expect(serializer.serializeComment(comment)).to.equals('<!--This is a not-so-secret comment in your document-->');
        });

        it(`should throw error if the comment data is not a valid xml comment data and the
        requireWellFormed parameter is set as true`, function() {
            let doc = (new window.DOMParser()).parseFromString('<root></root>',
            'application/xml');
            let comment = doc.createComment('This is a not-so-secret comment in your document-');

            expect(function() {
                serializer.serializeComment(comment, true);
            }).to.throw(Error);
        });
    });

    describe('#serializeText(node, requireWellFormed)', function() {
        it(`should serialize a text node and return the result. It preserves white spaces
        unless the preserveWhiteSpace constructor parameter is set to false`, function() {
            let doc = (new window.DOMParser()).parseFromString('<root></root>',
            'application/xml');
            let text= doc.createTextNode('  13 > 5 && 15 < 20');
            let serializer = new Serializer();
            expect(serializer.serializeText(text)).to.equals('  13 &gt; 5 &amp;&amp; 15 &lt; 20');
        });

        it(`should not preserve white spaces if the preserveWhiteSpace constructor
        parameter is set to false`, function() {
            let serializer = new Serializer(false);
            let doc = (new window.DOMParser()).parseFromString('<root></root>',
            'application/xml');
            let text= doc.createTextNode('  13 > 5 && 15 < 20');

            expect(serializer.serializeText(text)).to.equals('13 &gt; 5 &amp;&amp; 15 &lt; 20');
        });

        it(`should throw error if the text data is not a valid xml text data and the
        requireWellFormed parameter is set as true`, function() {
            expect(function() {
                serializer.serializeText({data: {}}, true);
            }).to.throw(Error);
        });
    });

    describe('#serializeDocument(node, namespace, prefixMap, requireWellFormed)', function() {
        it(`should serialize a document and return the result`, function() {
            let doc = (new window.DOMParser()).parseFromString(
                `<?xml version="1.0" encoding="utf-8" ?>
                <root xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">

                    <h:table xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">
                    <h:tr>
                        <h:td>Apples</h:td>
                        <h:td>Bananas</h:td>
                    </h:tr>
                    </h:table>

                    <f:table xmlns:f="https://www.w3schools.com/furniture">
                    <f:name>African Coffee Table</f:name>
                    <f:width>80</f:width>
                    <f:length>120</f:length>
                    </f:table>

                    </root>`, 'application/xml'
            );

            let serializedDoc = serializer.serializeDocument(doc, null, prefixMap, true);
            expect(serializedDoc).to.equals('<?xml version="1.0" encoding="UTF-8"?><root xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture"><h:table><h:tr><h:td>Apples</h:td><h:td>Bananas</h:td></h:tr></h:table><f:table><f:name>African Coffee Table</f:name><f:width>80</f:width><f:length>120</f:length></f:table></root>');
        });

        it(`should throw error if document has no documentElement and requireWellFormed parameter
        is set to true`, function() {
            expect(function() {
                let doc = (new window.DOMParser()).parseFromString('<root></root>', 'application/xml');
                doc.documentElement = null;
                serializer.serializeDocument(doc, true);
            }).to.throw(Error);
        });

        it(`should serialize a document along with the doctype if doctype is defined`, function() {
            let doc = (new window.DOMParser()).parseFromString(
                `<?xml version="1.0" encoding="utf-8" ?>
                <!DOCTYPE root PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
                "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <root xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">

                    <h:table xmlns:h="http://www.w3.org/TR/html4/">
                        <h:tr>
                            <h:td>Apples</h:td>
                            <h:td>Bananas</h:td>
                        </h:tr>
                    </h:table>

                    <f:table xmlns:f="https://www.w3schools.com/furniture">
                        <f:name>African Coffee Table</f:name>
                        <f:width>80</f:width>
                        <f:length>120</f:length>
                    </f:table>

                    <svg:svg xmlns:svg="http://www.w3.org/2000/svg">
                        <svg:style></svg:style>
                        <title>my title</title>
                    </svg:svg>

                    </root>`, 'application/xml'
            );

            let serializedDoc = serializer.serializeDocument(doc,null, Object.create(null), true);
            expect(serializedDoc).to.equals('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><root xmlns:ns1="http://www.w3.org/2000/xmlns/" ns1:h="http://www.w3.org/TR/html4/" ns1:f="https://www.w3schools.com/furniture"><h:table><h:tr><h:td>Apples</h:td><h:td>Bananas</h:td></h:tr></h:table><f:table><f:name>African Coffee Table</f:name><f:width>80</f:width><f:length>120</f:length></f:table><svg:svg ns1:svg="http://www.w3.org/2000/svg"><svg:style/><title>my title</title></svg:svg></root>');
        });
    });

    describe('#serializeToString(node, requireWellFormed)', function() {
        it(`should serialize the xml node, cordinating every other node`, function() {
            let doc = (new window.DOMParser()).parseFromString(
                `<?xml version="1.0" encoding="utf-8" ?>
                <!DOCTYPE root PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
                "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <?xml-stylesheet href="classic.css" alternate="yes" title="Classic" media="screen, print" type="text/css"?>
                <root xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">
                    <!--this is a comment node-->
                    <h:table xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">
                        <h:tr>
                            <h:td />
                            <h:td>Apples</h:td>
                            <h:td>Bananas</h:td>
                        </h:tr>
                    </h:table>

                    <f:table xmlns:f="https://www.w3schools.com/furniture">
                        <f:name>African Coffee Table</f:name>
                        <f:width>80</f:width>
                        <f:length>120</f:length>
                    </f:table>

                    <!--html section-->
                    <html xmlns="http://www.w3.org/1999/xhtml">
                        <head>
                            <meta name="description" content="this is html section" />
                            <base href="http://localhost" />
                        </head>
                        <body>
                            <p>this is a paragraph text</p>
                            <hr />
                            <template>
                                <p>this is a template</p>
                            </template>
                        </body>
                    </html>

                    <svg:svg xmlns:svg="http://www.w3.org/2000/svg">
                        <svg:style></svg:style>
                        <title>my title</title>
                    </svg:svg>

                    </root>`, 'application/xml'
            );

            let serializedDoc = serializer.serializeToString(doc, null, prefixMap, true);
            expect(serializedDoc).to.equals('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><?xml-stylesheet href="classic.css" alternate="yes" title="Classic" media="screen, print" type="text/css"?><root xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture"><!--this is a comment node--><h:table><h:tr><h:td/><h:td>Apples</h:td><h:td>Bananas</h:td></h:tr></h:table><f:table><f:name>African Coffee Table</f:name><f:width>80</f:width><f:length>120</f:length></f:table><!--html section--><html xmlns="http://www.w3.org/1999/xhtml"><head><meta name="description" content="this is html section" /><base href="http://localhost" /></head><body><p>this is a paragraph text</p><hr /><template><p>this is a template</p></template></body></html><svg:svg xmlns:svg="http://www.w3.org/2000/svg"><svg:style/><title>my title</title></svg:svg></root>');
        });

        it(`should still serialize an erroneous xml document`, function() {
            let doc = (new window.DOMParser()).parseFromString(
                `<?xml version="1.0" encoding="utf-8" ?>
                <!DOCTYPE root PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
                "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <?xml-stylesheet href="classic.css" alternate="yes" title="Classic" media="screen, print" type="text/css"?>
                <root xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">
                    <!--this is a comment node-->
                    <h:table xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">
                        <h:tr>
                            <h:td>
                            <h:td>Apples</h:td>
                            <h:td>Bananas</h:td>
                        </h:tr>
                    </h:table>

                    <f:table xmlns:f="https://www.w3schools.com/furniture">
                        <f:name>African Coffee Table</f:name>
                        <f:width>80</f:width>
                        <f:length>120</f:length>
                    </f:table>

                    <!--html section-->
                    <html xmlns="http://www.w3.org/1999/xhtml">
                        <head>
                            <meta name="description" content="this is html section" />
                            <base href="http://localhost" />
                        </head>
                        <body>
                            <p>this is a paragraph text</p>
                            <hr />
                            <template>
                                <p>this is a template</p>
                            </template>
                        </body>
                    </html>

                    <svg:svg xmlns:svg="http://www.w3.org/2000/svg">
                        <svg:style></svg:style>
                        <title>my title<title>
                    </svg:svg>

                    </root>`, 'application/xml'
            );

            serializer.serializeToString(doc, null, prefixMap, true);
        });
    });
});