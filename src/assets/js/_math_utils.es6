export function degToRad(deg) {
  return (deg / 360) * Math.PI * 2;
}
export function random(min = null, max = null) {
  if (min == null && max == null) {
    return random(0, 1);
  }
  if (max == null) {
    return random(0, min);
  }
  return Math.random() * (max - min) + min;
}
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
// eslint-disable-next-line no-shadow
export function map(inputValue, inputMin, inputMax, outputMin, outputMax, clamp = false) {
  let outputValue = (
    (inputValue - inputMin) / (inputMax - inputMin)
  ) * (outputMax - outputMin) + outputMin;
  if (clamp) {
    if (outputMin < outputMax) {
      outputValue = Math.min(outputValue, outputMax);
      outputValue = Math.max(outputValue, outputMin);
    } else {
      outputValue = Math.max(outputValue, outputMax);
      outputValue = Math.min(outputValue, outputMin);
    }
  }
  return outputValue;
}

export function getCenterOfRect(rect) {
  const {
    x,
    y,
    width,
    height,
  } = rect;
  const cx = x + width * 0.5;
  const cy = y + height * 0.5;
  return {
    x: cx,
    y: cy,
  };
}

export function scaledRect(rectOriginal, rectTarget, targetRatio) {
  const width = rectOriginal.width * targetRatio;
  const height = rectOriginal.height * targetRatio;
  const center = getCenterOfRect(rectTarget);
  const rect = {
    x: center.x - width * 0.5,
    y: center.y - height * 0.5,
    width,
    height,
  };
  return rect;
}

export function coverRectRatio(rectOriginal, rectTarget) {
  const aspectOriginal = rectOriginal.height / rectOriginal.width;
  const aspectTarget = rectTarget.height / rectTarget.width;
  const targetRatio = (
    aspectTarget < aspectOriginal
  ) ? (
      rectTarget.width / rectOriginal.width
    ) : (
      rectTarget.height / rectOriginal.height
    );
  return targetRatio;
}
export function coverRect(rectOriginal, rectTarget) {
  const targetRatio = coverRectRatio(rectOriginal, rectTarget);
  return scaledRect(rectOriginal, rectTarget, targetRatio);
}
export function containRectRatio(rectOriginal, rectTarget) {
  const aspectOriginal = rectOriginal.height / rectOriginal.width;
  const aspectTarget = rectTarget.height / rectTarget.width;
  const targetRatio = (
    aspectOriginal < aspectTarget
  ) ? (
      rectTarget.width / rectOriginal.width
    ) : (
      rectTarget.height / rectOriginal.height
    );
  return targetRatio;
}
export function containRect(rectOriginal, rectTarget) {
  const targetRatio = containRectRatio(rectOriginal, rectTarget);
  return scaledRect(rectOriginal, rectTarget, targetRatio);
}
