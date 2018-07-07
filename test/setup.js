let JSDOM = require('jsdom').JSDOM;

/**
 * create dom to be used for testing
*/
let dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://127.0.0.1:8131',
    pretendToBeVisual: true
});

/**
 * set up test global variables including a test server to be used for http requests
*/
global.expect = require('chai').expect;
global.window = dom.window;
global.document = window.document;