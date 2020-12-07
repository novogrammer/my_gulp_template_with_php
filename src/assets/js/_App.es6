import {
  FPS,
  IS_DEBUG,
} from './_constants.es6';

const {
  Stats,
  animate,
  $,
} = window;

export default class App {
  constructor(emitter) {
    this.emitter = emitter;
    this.previousSize = null;
    this.previousScrollTop = null;
    this.setupStats();
    this.setupEvents();
  }


  setupStats() {
    this.stats = new Stats();
    const $dom = $(this.stats.dom);
    $dom.attr('id', 'Stats');
    $('body').append($dom);
    $('#Stats').css({ left: 'auto', right: 0 });
    $('#Stats').toggle(IS_DEBUG);
  }

  setupEvents() {
    const { emitter } = this;
    emitter.on("resize", this.onResize, this);
    this.onResize();
    emitter.on("scroll", this.onScroll, this);
    emitter.on("tick", this.onTick, this);

    this.animation = animate(() => {
      this.stats.begin();
      this.checkEvents();
      emitter.emit("tick");
      this.stats.end();
    }, FPS);
  }
  getSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }
  checkResize() {
    const { emitter } = this;
    const size = this.getSize();
    if (this.previousSize != null && this.previousSize.width == size.width && this.previousSize.height == size.height) {
      return;
    }
    this.previousSize = size;
    emitter.emit("resize");

  }
  checkScroll() {
    const { emitter } = this;
    const scrollTop = $(window).scrollTop();
    if (this.previousScrollTop != null && this.previousScrollTop == scrollTop) {
      return;
    }
    this.previousScrollTop = scrollTop;
    emitter.emit("scroll");

  }
  checkEvents() {
    this.checkResize();
    this.checkScroll();
  }

  // eslint-disable-next-line class-methods-use-this
  onScroll() {
  }

  // eslint-disable-next-line class-methods-use-this
  onResize() {
  }

  // eslint-disable-next-line class-methods-use-this
  onTick() {
  }

  static load() {
    const promises = [];
    return Promise.all(promises);
  }
}
