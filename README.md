# XML-Serializer

[![Build Status](https://travis-ci.org/harrison-ifeanyichukwu/xml-serializer.svg?branch=master)](https://travis-ci.org/harrison-ifeanyichukwu/xml-serializer)
[![Coverage Status](https://coveralls.io/repos/github/harrison-ifeanyichukwu/xml-serializer/badge.svg?branch=master)](https://coveralls.io/github/harrison-ifeanyichukwu/xml-serializer?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm version](https://badge.fury.io/js/%40harrison-ifeanyichukwu%2Fxml-serializer.svg)](https://badge.fury.io/js/%40harrison-ifeanyichukwu%2Fxml-serializer)
![npm](https://img.shields.io/npm/dw/%40harrison-ifeanyichukwu%2Fxml-serializer.svg)

XML-Serializer is a complete JavaScript implementation of the W3C [xml serialization](https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml) specifications. All specifications have been implemented and includes the following [specs](https://www.w3.org/TR/DOM-Parsing/#dfn-concept-xml-serialization-algorithm):

- [ELEMENT_NODE Serialization]

- [DOCUMENT_NODE Serialization]

- [COMMENT_NODE Serialization]

- [TEXT_NODE Serialization]

- [DOCUMENT_FRAGMENT_NODE Serialization]

- [DOCUMENT_TYPE_NODE Serialization]

- [PROCESSING_INSTRUCTION_NODE Serialization]

## Module Availability

This module is available as an [npm](https://www.npmjs.com/) scoped package and also has a browser build that is located inside the `dist` folder. It can easily be integrated with [JSDOM](https://github.com/jsdom/jsdom) for mockup testing.

## Getting Started

The below command will install `xml-serializer` from npm into your project assuming you have the [npm](https://www.npmjs.com/) already installed.

**Install as a development dependency**:

```bash
npm install --save-dev @harrison-ifeanyichukwu/xml-serializer
```

## Usage Guide

following the specification, the `XMLSerializer` interface is a constructor and has a `serializeToString(root)` method exposed on the instance. To serialize any xml node, call the `serializeToString(root)` method on a constructed instance, passing in the xml node as below

```javascript
import XMLSerializer from 'r-serializer';

let instance = new XMLSerializer();
console.log(instance.serializeToString(someXmlNode));
```

### Using with [JSDOM](https://github.com/jsdom/jsdom)

Currently, JSDOM has not implemented the `XMLSerializer` interface. This can be easily integrated with JSDOM and any other similar mockup environment or for web scrapping and xml feed parsing like below.

```javascript
//assumes jsdom has been installed.
import XMLSerializer from 'r-serializer';
import {JSDOM} from 'jsdom';

let dom = new JSDOM();

dom.window.XMLSerializer = XMLSerializer;

global.window = dom.window;

//start running your tests or do something else.
```

### Using on the browser

The browser build is available inside the dist folder. It exposes the `XMLSerialzer` construct on the `window` object.

## New Features & Improvements

By default, the serializer preserves white space during the serialization process. This can be turned off by passing in false to the constructor at the time of creating an instance.

```javascript
let instance = new XMLSerializer(false) // preserveWhiteSpace is set to false. it wont
//preserve white spaces
```

Another improvement is that it removes all duplicate prefix definition on any xml element as recommended in the specification document unlike what web browsers do. Below is an example of
this:

**Original XML**:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<!DOCTYPE root PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<?xml-stylesheet href="classic.css" alternate="yes" title="Classic"
 media="screen, print" type="text/css"?>

<!--notice that two namespaces have been defined on the root element-->
<root xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">

    <!--notice that it is declared again here. this is a duplicate-->
    <h:table xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">
        <h:tr>
            <h:td>
            <h:td>Apples</h:td>
            <h:td>Bananas</h:td>
        </h:tr>
    </h:table>

    <!--one is duplicated here-->
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

</root>
```

**Chrome inbuilt XMLSerializer Output:**

Notice that all of the duplicated namespaces are removed.

```xml
<?xml version="1.0" encoding="utf-8" ?><!DOCTYPE root PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<?xml-stylesheet href="classic.css" alternate="yes" title="Classic"
 media="screen, print" type="text/css"?>

<!--notice that two namespaces have been defined on the root element-->
<root xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">

    <!--notice that it is declared again here. this is a duplicate-->
    <h:table xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">
        <h:tr>
            <h:td>
            <h:td>Apples</h:td>
            <h:td>Bananas</h:td>
        </h:tr>
    </h:table>

    <!--one is duplicated here-->
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

</root>
```

**Output of this module:**

Notice that all of the duplicated namespaces are removed.

```xml
<?xml version="1.0" encoding="utf-8" ?><!DOCTYPE root PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<?xml-stylesheet href="classic.css" alternate="yes" title="Classic"
 media="screen, print" type="text/css"?>

<!--notice that two namespaces have been defined on the root element-->
<root xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">

    <!--notice that it is declared again here. this is a duplicate-->
    <h:table>
        <h:tr>
            <h:td>
            <h:td>Apples</h:td>
            <h:td>Bananas</h:td>
        </h:tr>
    </h:table>

    <!--one is duplicated here-->
    <f:table>
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

</root>
```

## Acknowledgments

In addition to the spec, the following sections as well as outside resources were consulted and proved very useful:

[serialize-doc-type](https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-doctype), [serialize-xml-attribute](https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml-attributes), [serialize-attr-value](https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-attr-value), [record-element-namespace-info](https://www.w3.org/TR/DOM-Parsing/#dfn-concept-record-namespace-info), [generate-prefix](https://www.w3.org/TR/DOM-Parsing/#dfn-concept-generate-prefix), [xml-character-sets](https://www.w3.org/TR/xml/), [detect-non-valid-xml-characters](https://stackoverflow.com/questions/29031792/detect-non-valid-xml-characters-javascript)
