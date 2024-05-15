import '@testing-library/jest-dom/extend-expect';


// Specify the test environment
global.jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { document } = new JSDOM('').window;
global.document = document;
global.window = document.defaultView;
global.navigator = { userAgent: 'node.js' };
