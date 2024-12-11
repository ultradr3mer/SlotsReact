function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function round(value: number, digits: number) {
  let mult = Math.pow(10, digits)
  return Math.round(value * mult) / mult
}

function stringToRgb(value: string) {
  if (value.startsWith('rgb(')) {
    let result = value.substring(4, value.length - 1).split(",")
    return {
      r: parseInt(result[0]),
      g: parseInt(result[1]),
      b: parseInt(result[2])
    }
  }
  else {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      };
    }
    result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(value)!;
    return {
      r: parseInt(result[1] + result[1], 16),
      g: parseInt(result[2] + result[2], 16),
      b: parseInt(result[3] + result[3], 16)
    };
  }
}

function stringToRgba(value: string) {
  if (value.startsWith('rgba(')) {
    let result = value.substring(5, value.length - 1).split(",")
    return {
      r: parseInt(result[0]),
      g: parseInt(result[1]),
      b: parseInt(result[2]),
      a: parseFloat(result[3]),
    }
  }
  else {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: parseInt(result[4], 16)
      }
    }
    result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(value)!;
    return {
      r: parseInt(result[1] + result[1], 16),
      g: parseInt(result[2] + result[2], 16),
      b: parseInt(result[3] + result[3], 16),
      a: parseInt(result[4] + result[4], 16)
    };
  }
}

class GlColor {
  static White = new GlColor(1,1,1,1)
  static Black = new GlColor(0,0,0,1)

  r: number
  g: number
  b: number
  a: number

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }

  copy(): GlColor {
    return new GlColor(this.r, this.g, this.b, this.a)
  }

  brightness(value: number): GlColor {
    return new GlColor(this.r * value, this.g * value, this.b * value, this.a)
  }

  mix(color: GlColor, value: number): GlColor {
    let inv = 1 - value
    return new GlColor(
      this.r * inv + color.r * value,
      this.g * inv + color.g * value,
      this.b * inv + color.b * value,
      this.a * inv + color.a * value)
  }

  multAlpha(value: number): GlColor {
    return new GlColor(this.r, this.g, this.b, this.a * value)
  }
}

function glColorFromRgbString(value: string): GlColor {
  let base255 = stringToRgb(value)
  return new GlColor(base255.r / 255, base255.g / 255, base255.b / 255, 1.0)
}

function glColorFromRgbaString(value: string): GlColor {
  let base255 = stringToRgba(value)
  return new GlColor(base255.r / 255, base255.g / 255, base255.b / 255, base255.a)
}

export { getRandomArbitrary, round, stringToRgb, glColorFromRgbString, stringToRgba, GlColor, glColorFromRgbaString }