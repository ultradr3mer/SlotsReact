import Cookies from 'universal-cookie';
import Color, { fromString } from "../../util/Color";
import { ThemeConfig, theme } from "antd";
import { AliasToken } from 'antd/es/theme/interface';

const { defaultAlgorithm, darkAlgorithm, getDesignToken, defaultSeed } = theme;

interface ICustomToken extends AliasToken {
  colorPrimary: string,
  fontSize: number,
  fontFamily: string,
  colorBgBase: string,
  colorSecondary: string,
  colorPrimaryBright: string,
  colorBlack: string,
  colorSlotDarkBorder: string,
  colorSlotShadow: string,
  colorContrastColor: string,
  colorBgTint: string
  colorBgTintLight: string
}

const TileSkin = {
  Simple3d: Symbol("simple3d"),
  Hologram: Symbol("hologram"),
}

const cookies = new Cookies();
const cookieoptions = { path: '/' }
const themeCookieName = 'themeJson'

class SlotThemeConfigSettings {
  public isDarkMode: boolean = true
  public accentColor: string = '#FF23A2'
  public bgTintColor: string = 'rgb(48, 54, 68)'
  public bgTintColorLight: string = '#d9e5ff'
  public tileSkin: string = TileSkin.Hologram.description!;
}

class SlotThemeConfig {
  public themeChanged?: (theme: ThemeConfig) => void
  token: ICustomToken;
  settings: SlotThemeConfigSettings;

  constructor() {
    let data = cookies.get(themeCookieName, cookieoptions) as SlotThemeConfigSettings
    this.settings = data == null ? new SlotThemeConfigSettings() : data
    let newTheme = this.generateTheme()
    this.token = newTheme.token as ICustomToken
  }

  setCookie() {
    let json = JSON.stringify(this.settings)
    cookies.set(themeCookieName, json, cookieoptions)
  }

  ifDarkThenElse<T>(valueDark: T, valueLight: T): T {
    return this.settings.isDarkMode ? valueDark : valueLight
  }

  switchTheme() {
    this.settings.isDarkMode = !this.settings.isDarkMode

    this.onPropertyChanged()
  }

  setAccent(color: string) {
    if (this.settings.accentColor == color)
      return

    this.settings.accentColor = color

    this.onPropertyChanged()
  }

  getAccent() {
   return this.settings.accentColor
  }

  setBgTint(color: string) {
    if (this.getIsDark()) {
      if (this.settings.bgTintColor == color)
        return

      this.settings.bgTintColor = color
    }
    else {
      if (this.settings.bgTintColorLight == color)
        return

      this.settings.bgTintColorLight = color
    }


    this.onPropertyChanged()
  }

  setTileSkin(value: string) {
    if (this.settings.tileSkin == value)
      return

    this.settings.tileSkin = value

    this.onPropertyChanged()
  }

  getTileSkin() {
    return this.settings.tileSkin;
  }

  onPropertyChanged() {
    let newTheme = this.generateTheme()
    if (this.themeChanged)
      this.themeChanged(newTheme)
    this.setCookie()
  }

  getIsDark(): boolean {
    return this.settings.isDarkMode;
  }

  getBgTint(): string {
    return this.ifDarkThenElse(this.settings.bgTintColor, this.settings.bgTintColorLight)
  }

  getBgTintColor() {
    return fromString(this.getBgTint())
  }

  fromBaseTint(multDark: number, multLight: number) {
    return this.ifDarkThenElse(
      this.getBgTintColor().multiplyNumber(multDark), 
      this.getBgTintColor().multiplyNumber(multLight * Color.MaxLog));
  }

  generateTheme(): ThemeConfig {
    let colorPrimaryBright = fromString(this.settings.accentColor).setValue(1.0)
    let colorContainer = this.fromBaseTint(0.498, 0.95).logSpace()
    let colorPrimary = fromString(this.settings.accentColor).ensureContrast(colorContainer, 0.2)

    let seedTokens = {
      colorPrimary: colorPrimary.toString(),
      fontSize: 16,
      fontFamily: 'Lato',
      colorBgBase: this.fromBaseTint(0.3, 0.9).logSpace().toString(),
    }

    let baseTheme = {
      token: {
        ...seedTokens,
        colorWarningBg: this.fromBaseTint(0.29, 0.827).logSpace().toString(),
        colorBgElevated: this.fromBaseTint(0.715, 1.05).logSpace().toString(),
        colorBgContainer: colorContainer.toString(),
        colorBorder: this.fromBaseTint(1.0, 0.757).logSpace().toString(),
        colorBorderSecondary: this.fromBaseTint(1.0, 0.827).logSpace().toString()
      },
      algorithm: this.ifDarkThenElse(darkAlgorithm, defaultAlgorithm)
    }

    let globalToken = getDesignToken(baseTheme);

    let customTokens = {
      colorSecondary: this.ifDarkThenElse('#737373', '#999999'),
      colorPrimaryBright: colorPrimaryBright.toString(),
      colorBlack: '#000',
      colorSlotDarkBorder: this.ifDarkThenElse('rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.45)'),
      colorSlotShadow: this.ifDarkThenElse('rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.4)'),
      colorContrastColor: this.ifDarkThenElse('rgba(255, 255, 255, 0.6)', 'rgba(0, 0, 0, 0.45)'),
      colorBgTint: this.settings.bgTintColor,
      colorBgTintLight: this.settings.bgTintColorLight,
    }

    this.token = { ...globalToken, ...seedTokens, ...customTokens }

    let newTheme = {
      ...baseTheme,
      tokens: customTokens,
      components: {
        Menu: {
          algorithm: true,
        },
        Button: {
          fontSizeLG: 22
        },
        Message: {
          contentPadding: '3px 6px'
        },
        Divider: {
          marginLG: 12
        },
        Result: {
          extraMargin: 16,
          paddingLG: 16
        },
        Alert: {
          colorIcon: globalToken.colorTextLightSolid
        },
        Tag: {
          defaultBg: globalToken.colorBgContainer
        },
        Collapse: {
          headerBg: baseTheme.token.colorBgElevated
        }
      }
    }

    return baseTheme
  }
}

export { SlotThemeConfig, ICustomToken, TileSkin } 