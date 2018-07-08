import XMLSerializer from '../src/exports.js';

describe('Module export', function() {
    describe('constructor(preserveWhiteSpace=true)', function() {
        it('should create an xml serializer instance', function() {
            expect(new XMLSerializer()).to.be.an('XMLSerializer');
        });

        it(`should should take an optional boolean preserveWhiteSpace flag that sets that
        tells the serializer to preserve whitespaces during the serialization process. Default
        value is true if not specified`, function() {
            expect(new XMLSerializer(false)).to.be.an('XMLSerializer');
        });
    });

    describe('#serializeToString(node, requireWellFormed)', function() {
        it(`should serialize the xml node that is passed in.`, function() {
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

            let serializedDoc = new XMLSerializer(false).serializeToString(doc, true);
            expect(serializedDoc).to.equals('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><?xml-stylesheet href="classic.css" alternate="yes" title="Classic" media="screen, print" type="text/css"?><root xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture"><!--this is a comment node--><h:table><h:tr><h:td/><h:td>Apples</h:td><h:td>Bananas</h:td></h:tr></h:table><f:table><f:name>African Coffee Table</f:name><f:width>80</f:width><f:length>120</f:length></f:table><!--html section--><html xmlns="http://www.w3.org/1999/xhtml"><head><meta name="description" content="this is html section" /><base href="http://localhost" /></head><body><p>this is a paragraph text</p><hr /><template><p>this is a template</p></template></body></html><svg:svg xmlns:svg="http://www.w3.org/2000/svg"><svg:style/><title>my title</title></svg:svg></root>');
        });
    });
});