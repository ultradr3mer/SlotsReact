import { stringToRgb } from './SlotsUtil'

const logThreshold = 0.5
const logScale = 2.0

const logInvFunc = (v: number) => {
  if (v < logThreshold)
    return v

  
  return (Math.exp((1-logThreshold)*logScale)-1.0)/logScale + logThreshold
}

class Color {
  private r: number
  private g: number
  private b: number
  private a: number

  public static MaxLog = logInvFunc(1.0)

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = 1
  }

  toString() {
    let rgba = this.getRgba()

    if (this.a == 1)
      return `rgb(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)})`;
    else
      return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a})`;
  }

  set(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  // hueRotate(angle = 0) {
  //   angle = angle / 180 * Math.PI;
  //   const sin = Math.sin(angle);
  //   const cos = Math.cos(angle);

  //   this.multiplyMatrix([
  //     0.213 + cos * 0.787 - sin * 0.213,
  //     0.715 - cos * 0.715 - sin * 0.715,
  //     0.072 - cos * 0.072 + sin * 0.928,
  //     0.213 - cos * 0.213 + sin * 0.143,
  //     0.715 + cos * 0.285 + sin * 0.140,
  //     0.072 - cos * 0.072 - sin * 0.283,
  //     0.213 - cos * 0.213 - sin * 0.787,
  //     0.715 - cos * 0.715 + sin * 0.715,
  //     0.072 + cos * 0.928 + sin * 0.072,
  //   ]);
  // }

  // grayscale(value = 1) {
  //   this.multiplyMatrix([
  //     0.2126 + 0.7874 * (1 - value),
  //     0.7152 - 0.7152 * (1 - value),
  //     0.0722 - 0.0722 * (1 - value),
  //     0.2126 - 0.2126 * (1 - value),
  //     0.7152 + 0.2848 * (1 - value),
  //     0.0722 - 0.0722 * (1 - value),
  //     0.2126 - 0.2126 * (1 - value),
  //     0.7152 - 0.7152 * (1 - value),
  //     0.0722 + 0.9278 * (1 - value),
  //   ]);
  // }

  // sepia(value = 1) {
  //   this.multiplyMatrix([
  //     0.393 + 0.607 * (1 - value),
  //     0.769 - 0.769 * (1 - value),
  //     0.189 - 0.189 * (1 - value),
  //     0.349 - 0.349 * (1 - value),
  //     0.686 + 0.314 * (1 - value),
  //     0.168 - 0.168 * (1 - value),
  //     0.272 - 0.272 * (1 - value),
  //     0.534 - 0.534 * (1 - value),
  //     0.131 + 0.869 * (1 - value),
  //   ]);
  // }

  // saturate(value = 1) {
  //   this.multiplyMatrix([
  //     0.213 + 0.787 * value,
  //     0.715 - 0.715 * value,
  //     0.072 - 0.072 * value,
  //     0.213 - 0.213 * value,
  //     0.715 + 0.285 * value,
  //     0.072 - 0.072 * value,
  //     0.213 - 0.213 * value,
  //     0.715 - 0.715 * value,
  //     0.072 + 0.928 * value,
  //   ]);
  // }

  // multiplyMatrix(matrix: [number, number, number, number, number, number, number, number, number]) {
  //   const newR = this.clamp(this.r * matrix[0] + this.g * matrix[1] + this.b * matrix[2]);
  //   const newG = this.clamp(this.r * matrix[3] + this.g * matrix[4] + this.b * matrix[5]);
  //   const newB = this.clamp(this.r * matrix[6] + this.g * matrix[7] + this.b * matrix[8]);
  //   this.r = newR;
  //   this.g = newG;
  //   this.b = newB;
  // }

  multiplyNumber(value: number) {
    return new Color(
      this.r * value,
      this.g * value,
      this.b * value)
  }

  setValue(value: number) {
    let currentValue = this.getHsvNormalized().v
    return this.multiplyNumber(value / currentValue)
  }

  ensureContrast(otherClor: Color, minContrast: number) {
    let lum = this.getPrecivedLuminance()
    let lumOther = otherClor.getPrecivedLuminance()
    if (Math.abs(lum - lumOther) > minContrast)
      return this

    let sign = Math.sign(lum - lumOther)
    let targetLum = lumOther + sign * minContrast
    return this.multiplyNumber(Math.max(targetLum / lumOther, 0))
  }

  multiply(other: Color) {
    return new Color(
      this.r *= other.r,
      this.g = other.g,
      this.b = other.b)
  }

  // brightness(value = 1) {
  //   this.linear(value);
  //   return
  // }

  // contrast(value = 1) {
  //   this.linear(value, -(0.5 * value) + 0.5);
  // }

  // linear(slope = 1, intercept = 0) {
  //   this.r = this.clamp(this.r * slope + intercept * 255);
  //   this.g = this.clamp(this.g * slope + intercept * 255);
  //   this.b = this.clamp(this.b * slope + intercept * 255);
  // }

  // invert(value = 1) {
  //   this.r = this.clamp((value + this.r / 255 * (1 - 2 * value)) * 255);
  //   this.g = this.clamp((value + this.g / 255 * (1 - 2 * value)) * 255);
  //   this.b = this.clamp((value + this.b / 255 * (1 - 2 * value)) * 255);
  // }

  getHsl() {
    // Code taken from https://stackoverflow.com/a/9493060/2688027, licensed under CC BY-SA.
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number, l = ((max + min) / 2);

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;

        case g:
          h = (b - r) / d + 2;
          break;

        case b:
          h = (r - g) / d + 4;
          break;

        default:
          throw new Error()
      }
      h /= 6;
    }

    return {
      h: h * 100,
      s: s * 100,
      l: l * 100,
    };
  }

  getHsvNormalized() {
    var rr, gg, bb, h = 0, s = 0;
    let rabs = this.r / 255;
    let gabs = this.g / 255;
    let babs = this.b / 255;
    let v = Math.max(rabs, gabs, babs)
    let diff = v - Math.min(rabs, gabs, babs);
    const diffc = (c: number) => (v - c) / 6 / diff + 1 / 2;
    if (diff != 0) {
      s = diff / v;
      rr = diffc(rabs);
      gg = diffc(gabs);
      bb = diffc(babs);

      if (rabs === v) {
        h = bb - gg;
      } else if (gabs === v) {
        h = (1 / 3) + rr - bb;
      } else if (babs === v) {
        h = (2 / 3) + gg - rr;
      }
      if (h < 0) {
        h += 1;
      } else if (h > 1) {
        h -= 1;
      }
    }

    return { h, s, v }
  }

  getHsv() {
    const percentRoundFn = (num: number) => Math.round(num * 100) / 100;
    let hsvNormalized = this.getHsvNormalized()
    return {
      h: Math.round(hsvNormalized.h * 360),
      s: percentRoundFn(hsvNormalized.s * 100),
      v: percentRoundFn(hsvNormalized.v * 100)
    };
  }

  clamp(value: number, max: number) {
    if (value > 255) {
      value = 255;
    } else if (value < 0) {
      value = 0;
    }
    return value;
  }

  getPrecivedLuminance() {
    let base = 0.5

    const mapColor = (l: number, c: number) => (l*(1-base)+base/3) * c / 255

    return mapColor(0.2126, this.r) +
    mapColor(0.7152, this.g) +
    mapColor(0.0722, this.b)
  }

  multAlpha(value: number): Color {
    let result = new Color(this.r, this.g, this.b)
    result.a = this.a * value
    return result
  }

  getRgb() {
    return {
      r: this.clamp(this.r, 255),
      g: this.clamp(this.g, 255),
      b: this.clamp(this.b, 255)
    }
  }

  getRgba() {
    return {
      ...this.getRgb(),
      a: this.clamp(this.a, 1)
    }
  }

  logSpace() {

    const logFunc = (v: number) => {
      if (v < logThreshold)
        return v

      
      return Math.log((v-logThreshold)*logScale+1.0)/logScale + logThreshold
    }


    const logFuncColor = (v: number) => {
      return logFunc(v/255)*255
    }

    let test = Array.from({length: 140}, (x, i) => ({val: i/100, log: logFunc(i/100)}))

    let result = new Color(logFuncColor(this.r), logFuncColor(this.g), logFuncColor(this.b))
    result.a = this.a

    return result
  }
}

function fromString(colorString: string) {
  let values = stringToRgb(colorString)
  return new Color(values.r, values.g, values.b)
}

export default Color

export { Color, fromString }