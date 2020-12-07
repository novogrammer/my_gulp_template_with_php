import {
  IS_DEBUG,
} from './_constants.es6';

import App from './_App.es6';
// import TypeSquareAdapter from "./_TypeSquareAdapter.es6";
const {
  $,
  EventEmitter,
} = window;

const promiseWindowLoad = new Promise((resolve) => {
  $(window).on('load', () => resolve());
});

$(() => {
  const emitter = new EventEmitter();
  const promises = [];
  // promises.push(promiseWindowLoad);
  // promises.push(TypeSquareAdapter.load());
  promises.push(App.load());
  Promise.all(promises).then(() => {
    window.app = new App(emitter);
  });
});
