# XML-Serializer

[![Build Status](https://travis-ci.org/teclone/xml-serializer.svg?branch=master)](https://travis-ci.org/teclone/xml-serializer)
[![Coverage Status](https://coveralls.io/repos/github/teclone/xml-serializer/badge.svg?branch=master)](https://coveralls.io/github/teclone/xml-serializer?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm version](https://badge.fury.io/js/%40teclone%2Fxml-serializer.svg)](https://badge.fury.io/js/%40teclone%2Fxml-serializer)
![npm](https://img.shields.io/npm/dt/%40teclone%2Fxml-serializer.svg)

XML-Serializer is a complete JavaScript implementation of the W3C [xml serialization](https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml) specifications. All specifications have been implemented and includes the following [specs](https://www.w3.org/TR/DOM-Parsing/#dfn-concept-xml-serialization-algorithm):

- [ELEMENT_NODE Serialization]

- [DOCUMENT_NODE Serialization]

- [COMMENT_NODE Serialization]

- [TEXT_NODE Serialization]

- [DOCUMENT_FRAGMENT_NODE Serialization]

- [DOCUMENT_TYPE_NODE Serialization]

- [PROCESSING_INSTRUCTION_NODE Serialization]

## Module Availability

This module is available as an [npm](https://www.npmjs.com/package/@teclone/xml-serializer) scoped package and also has a browser build that is located inside the `dist` folder. It can easily be integrated with [JSDOM](https://github.com/jsdom/jsdom) for mockup testing.

## Getting Started

The below command will install `xml-serializer` from npm into your project assuming you have the [npm](https://www.npmjs.com/) already installed.

**Install as a development dependency**:

```bash
npm install --save-dev @teclone/xml-serializer
```

## Usage Guide

Following the specification, the `XMLSerializer` interface is a constructor and has a `serializeToString(root)` method exposed on the instance. To serialize any xml node, call the `serializeToString(root)` method on a constructed instance, passing in the xml node as like shown below:

```javascript
import XMLSerializer from '@teclone/xml-serializer';

const instance = new XMLSerializer();
console.log(instance.serializeToString(someXmlNode));
```

The constructor can take a boolean argument that indicates if whitespace should be preserved in the serialized output. Default value is `true`;

```javascript
// do not preserve white space
const instance = new XMLSerializer(false);
const xmlString = instance.serializeToString(document);
```

### Using with [JSDOM](https://github.com/jsdom/jsdom)

Currently [at the time of creating this], JSDOM has not implemented the `XMLSerializer` interface. This can be easily integrated with JSDOM and any other similar mockup environment or for web scrapping and xml feed parsing like below.

```javascript
//assumes jsdom has been installed.
import XMLSerializer from '@teclone/xml-serializer';
import { JSDOM } from 'jsdom';

const dom = new JSDOM();
XMLSerializer.installTo(dom.window);

global.window = dom.window;

//start running your tests or do something else.
```

### Using on the browser

The browser build is available inside the `build/dist` folder when you npm install the package. You can also clone this repo and run the build command locally. It exposes an `XMLSerializer` construct on the `window` object.

```html
<script
  type="text/javascript"
  src="node_modules/@teclone/xml-serializer/build/dist/main.js"
>
  <script>
  <script type="text/javascript">
      const serializer = new XMLSerializer();
      // do some serialization stuffs
</script>
```

## Features & Improvements

By default, the serializer preserves white space during the serialization process. This can be turned off if you want a compact output by passing in `false` to the constructor at the time of creating an instance.

```javascript
//do not preserve white space
const instance = new XMLSerializer(false);
```

Another improvement is that it removes all duplicate xml prefix definition on as recommended in the specification document unlike what web browsers do. Below is an example of
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

Notice that none of the duplicated namespaces is removed.

```xml
<?xml version="1.0" encoding="utf-8" ?><!DOCTYPE root PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<?xml-stylesheet href="classic.css" alternate="yes" title="Classic"
 media="screen, print" type="text/css"?>

<root xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">

    <!-- duplicates still remains -->
    <h:table xmlns:h="http://www.w3.org/TR/html4/" xmlns:f="https://www.w3schools.com/furniture">
        <h:tr>
            <h:td>
            <h:td>Apples</h:td>
            <h:td>Bananas</h:td>
        </h:tr>
    </h:table>

    <!--still remains-->
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

    <!--duplicates removed-->
    <h:table>
        <h:tr>
            <h:td>
            <h:td>Apples</h:td>
            <h:td>Bananas</h:td>
        </h:tr>
    </h:table>

    <!--duplicate removed-->
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

## Contributing

We welcome your own contributions, ranging from code refactoring, documentation improvements, new feature implementations, bugs/issues reporting, etc. We recommend you follow the steps below to actively contribute to this project:

1. Decide on what to help us with.

2. Fork this repo to your machine.

3. Implement your ideas, and once stable,

4. Create a pull request, explaining your improvements/features
