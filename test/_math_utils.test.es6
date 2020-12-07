/* eslint-disable no-undef */
import {
  degToRad,
  random,
  clamp,
  map,
  getCenterOfRect,
  scaledRect,
  coverRectRatio,
  coverRect,
  containRectRatio,
  containRect,
} from '../src/assets/js/_math_utils.es6';

const RANDOM_VALUE = 0.123456789;


describe('degToRad', () => {
  test('degToRad(180) equal PI', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 5);
  });
  test('degToRad(360)) equal PI * 2', () => {
    expect(degToRad(360)).toBeCloseTo(Math.PI * 2, 5);
  });
});

describe('random', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(RANDOM_VALUE);
  });
  afterEach(() => {
    Math.random.mockRestore();
  });
  test('random() equal RANDOM_VALUE', () => {
    expect(random()).toBeCloseTo(RANDOM_VALUE, 5);
  });
  test('random(10) equal RANDOM_VALUE * 10', () => {
    expect(random(10)).toBeCloseTo(RANDOM_VALUE * 10, 5);
  });
  test('random(5, 10) equal 5 + RANDOM_VALUE * 5', () => {
    expect(random(5, 10)).toBeCloseTo(5 + RANDOM_VALUE * 5, 5);
  });
});

describe('clamp', () => {
  test('clamp(7, 5, 10) equal 7', () => {
    expect(clamp(7, 5, 10)).toBeCloseTo(7, 5);
  });
  test('clamp(0, 5, 10) equal 5', () => {
    expect(clamp(0, 5, 10)).toBeCloseTo(5, 5);
  });
  test('clamp(20, 5, 10) equal 10', () => {
    expect(clamp(20, 5, 10)).toBeCloseTo(10, 5);
  });
});

describe('map', () => {
  test('map(128, 0, 256, 100, 200) equal 150', () => {
    expect(map(128, 0, 256, 100, 200)).toBeCloseTo(150, 5);
  });
  test('map(512, 0, 256, 100, 200) equal 300', () => {
    expect(map(512, 0, 256, 100, 200)).toBeCloseTo(300, 5);
  });
  test('map(512, 0, 256, 100, 200, false) equal 300', () => {
    expect(map(512, 0, 256, 100, 200, false)).toBeCloseTo(300, 5);
  });
  test('map(-128, 0, 256, 100, 200, false) equal 0', () => {
    expect(map(-128, 0, 256, 100, 200, false)).toBeCloseTo(50, 5);
  });
  test('map(512, 0, 256, 100, 200, true) equal 200', () => {
    expect(map(512, 0, 256, 100, 200, true)).toBeCloseTo(200, 5);
  });
  test('map(-128, 0, 256, 100, 200, true) equal 100', () => {
    expect(map(-128, 0, 256, 100, 200, true)).toBeCloseTo(100, 5);
  });
});

describe('getCenterOfRect', () => {
  test('getCenterOfRect({x: 0, y: 0, width: 100, height: 200}) equal {x:50,y:100}', () => {
    const result = getCenterOfRect({
      x: 0, y: 0, width: 100, height: 200,
    });
    expect(result.x).toBeCloseTo(50, 5);
    expect(result.y).toBeCloseTo(100, 5);
    expect(result).not.toHaveProperty('width');
    expect(result).not.toHaveProperty('height');
  });
  test('getCenterOfRect({x: 1000, y: 1000, width: 100, height: 200,}) equal {x:1050,y:1100}', () => {
    const result = getCenterOfRect({
      x: 1000, y: 1000, width: 100, height: 200,
    });
    expect(result.x).toBeCloseTo(1050, 5);
    expect(result.y).toBeCloseTo(1100, 5);
    expect(result).not.toHaveProperty('width');
    expect(result).not.toHaveProperty('height');
  });
  test('getCenterOfRect({x: 0, y: 0, width: 1000, height: 2000}) equal {x:500,y:1000}', () => {
    const result = getCenterOfRect({
      x: 0, y: 0, width: 1000, height: 2000,
    });
    expect(result.x).toBeCloseTo(500, 5);
    expect(result.y).toBeCloseTo(1000, 5);
    expect(result).not.toHaveProperty('width');
    expect(result).not.toHaveProperty('height');
  });
});

describe('scaledRect', () => {
  // テスト済みのgetCenterOfRectを使ってテストする。
  test('scaledRect リサイズ無しの時は中心点が移動するだけ', () => {
    const rectOriginal = {
      x: 100,
      y: 50,
      width: 200,
      height: 100,
    };
    const rectTarget = {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
    };
    const rectResult = scaledRect(rectOriginal, rectTarget, 1);

    expect(getCenterOfRect(rectResult).x).toBeCloseTo(getCenterOfRect(rectTarget).x, 5);
    expect(getCenterOfRect(rectResult).y).toBeCloseTo(getCenterOfRect(rectTarget).y, 5);
    expect(rectResult.width).toBeCloseTo(rectOriginal.width, 5);
    expect(rectResult.height).toBeCloseTo(rectOriginal.height, 5);
  });
  test('scaledRect リサイズ有りの時は中心点が移動し、サイズもスケールする', () => {
    const rectOriginal = {
      x: 100,
      y: 50,
      width: 200,
      height: 100,
    };
    const rectTarget = {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
    };
    const rectResult = scaledRect(rectOriginal, rectTarget, 10);

    expect(getCenterOfRect(rectResult).x).toBeCloseTo(getCenterOfRect(rectTarget).x, 5);
    expect(getCenterOfRect(rectResult).y).toBeCloseTo(getCenterOfRect(rectTarget).y, 5);
    expect(rectResult.width).toBeCloseTo(rectOriginal.width * 10, 5);
    expect(rectResult.height).toBeCloseTo(rectOriginal.height * 10, 5);
  });
});

describe('coverRectRatio', () => {
  test('coverRectRatio ターゲットが縦長の場合', () => {
    const rectOriginal = {
      x: 100,
      y: 50,
      width: 300,
      height: 100,
    };
    const rectTarget = {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
    };
    const result = coverRectRatio(rectOriginal, rectTarget);
    expect(result).toBeCloseTo(2, 5);
  });
  test('coverRectRatio ターゲットが横長の場合', () => {
    const rectOriginal = {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
    };
    const rectTarget = {
      x: 100,
      y: 50,
      width: 300,
      height: 100,
    };
    const result = coverRectRatio(rectOriginal, rectTarget);
    expect(result).toBeCloseTo(3, 5);
  });
});

describe('coverRect', () => {
  test('coverRect ターゲットが縦長の場合', () => {
    const rectOriginal = {
      x: 100,
      y: 50,
      width: 300,
      height: 100,
    };
    const rectTarget = {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
    };
    const result = coverRect(rectOriginal, rectTarget);
    expect(getCenterOfRect(result).x).toBeCloseTo(getCenterOfRect(rectTarget).x, 5);
    expect(getCenterOfRect(result).y).toBeCloseTo(getCenterOfRect(rectTarget).y, 5);
    expect(result.width).toBeCloseTo(rectOriginal.width * 2, 5);
    expect(result.height).toBeCloseTo(rectOriginal.height * 2, 5);
  });
  test('coverRect ターゲットが横長の場合', () => {
    const rectOriginal = {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
    };
    const rectTarget = {
      x: 100,
      y: 50,
      width: 300,
      height: 100,
    };
    const result = coverRect(rectOriginal, rectTarget);
    expect(getCenterOfRect(result).x).toBeCloseTo(getCenterOfRect(rectTarget).x, 5);
    expect(getCenterOfRect(result).y).toBeCloseTo(getCenterOfRect(rectTarget).y, 5);
    expect(result.width).toBeCloseTo(rectOriginal.width * 3, 5);
    expect(result.height).toBeCloseTo(rectOriginal.height * 3, 5);
  });
});
describe('containRectRatio', () => {
  test('containRectRatio ターゲットが縦長の場合', () => {
    const rectOriginal = {
      x: 100,
      y: 50,
      width: 300,
      height: 100,
    };
    const rectTarget = {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
    };
    const result = containRectRatio(rectOriginal, rectTarget);
    expect(result).toBeCloseTo(1 / 3, 5);
  });
  test('containRectRatio ターゲットが横長の場合', () => {
    const rectOriginal = {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
    };
    const rectTarget = {
      x: 100,
      y: 50,
      width: 300,
      height: 100,
    };
    const result = containRectRatio(rectOriginal, rectTarget);
    expect(result).toBeCloseTo(1 / 2, 5);
  });
});
describe('containRect', () => {
  test('containRect ターゲットが縦長の場合', () => {
    const rectOriginal = {
      x: 100,
      y: 50,
      width: 300,
      height: 100,
    };
    const rectTarget = {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
    };
    const result = containRect(rectOriginal, rectTarget);
    expect(getCenterOfRect(result).x).toBeCloseTo(getCenterOfRect(rectTarget).x, 5);
    expect(getCenterOfRect(result).y).toBeCloseTo(getCenterOfRect(rectTarget).y, 5);
    expect(result.width).toBeCloseTo(rectOriginal.width / 3, 5);
    expect(result.height).toBeCloseTo(rectOriginal.height / 3, 5);
  });
  test('containRect ターゲットが横長の場合', () => {
    const rectOriginal = {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
    };
    const rectTarget = {
      x: 100,
      y: 50,
      width: 300,
      height: 100,
    };
    const result = containRect(rectOriginal, rectTarget);
    expect(getCenterOfRect(result).x).toBeCloseTo(getCenterOfRect(rectTarget).x, 5);
    expect(getCenterOfRect(result).y).toBeCloseTo(getCenterOfRect(rectTarget).y, 5);
    expect(result.width).toBeCloseTo(rectOriginal.width / 2, 5);
    expect(result.height).toBeCloseTo(rectOriginal.height / 2, 5);
  });
});
