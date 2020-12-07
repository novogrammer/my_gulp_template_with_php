import './_mypolyfill.es6';

// expose libraries
window.EventEmitter = require('eventemitter3');
// eslint-disable-next-line no-multi-assign
window.$ = window.jQuery = require('jquery');

window.Stats = require('stats.js');
window.animate = require('animate');
