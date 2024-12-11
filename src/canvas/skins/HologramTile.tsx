import { vec2 } from "gl-matrix"
import { IBufferInfo, createAndFillBuffer } from "../../openGl/Buffer"
import DrawableContainer from "../../openGl/DrawableContainer"
import drawableMesh from "../../openGl/drawableMesh"
import { GlColor } from "../../util/SlotsUtil"
import { GrowAnimationHandler } from "../GroupOutline"
import generateWireframe, { addThirdDimToVecs, calculateNormal, calculateUv, createRim, fillOutline, generateBevel } from "../MeshGenerator"
import { HihlightAnimationHandler, ISlotTile, StopAnimationHandler, mapIconId } from "../SlotTile"
import { SlotGame } from "../SlotGame"
import { IRessources } from "../ressources"
import { Tree } from "antd"
import tileEmptyBlurSrc from "../../assets/images/tile-empty-holo-blur.png"
import holoGlowSrc from "../../assets/images/holo-glow.png"
import loadImageAndCreateTextureInfo, { ITextureInfo } from "../../openGl/texture"
const tileheight = 0

interface IHologramRessources {
  gl: WebGLRenderingContext,
  tileFill: IBufferInfo,
  wireFrame: IBufferInfo,
  tileBorderBuffer: IBufferInfo,
  tileEmptyBlur: ITextureInfo,
  holoGlow: ITextureInfo
}

function createHologramRessources(gl: WebGLRenderingContext) {
  return {
    gl: gl,
    tileFill: initTileFrameBuffer(gl),
    wireFrame: initTileFrameWire(gl),
    tileBorderBuffer: initTileBorderBuffer(gl),
    tileEmptyBlur: loadImageAndCreateTextureInfo(gl, tileEmptyBlurSrc),
    holoGlow: loadImageAndCreateTextureInfo(gl, holoGlowSrc)
  }
}

function initTileBorderBuffer(gl: WebGLRenderingContext) {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0], [1.0, -1.0]], growDirection: [0.0, 9.0], loop: true }
  let bevelRadius = 0.2
  outerLine.linePoints = generateBevel(outerLine, bevelRadius)
  return generateWireframe(gl, [outerLine])
}

var hologramRessources: IHologramRessources

function initTileFrameBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0], [1.0, -1.0]], loop: true }
  let bevelRadius = 0.2
  outerLine.linePoints = generateBevel(outerLine, bevelRadius)
  let positions = fillOutline(outerLine.linePoints);
  let positionBuffer = createAndFillBuffer(gl, positions);
  let normals = calculateNormal(positions)
  let normalBuffer = createAndFillBuffer(gl, normals);
  let uv = calculateUv(positions)
  let uvBuffer = createAndFillBuffer(gl, uv);
  return { positionBuffer, uvBuffer, normalBuffer, vertexCount: positions.length / 3 };
}

function initTileFrameWire(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0], [1.0, -1.0]], growDirection: [9.0, 0.5], loop: true }
  let bevelRadius = 0.2
  outerLine.linePoints = generateBevel(outerLine, bevelRadius)

  function shorten(linePoints: number[][], amount: number) {
    let a = linePoints[0] as vec2
    let b = linePoints[1] as vec2
    let dir = vec2.create()
    vec2.subtract(dir, b, a)
    vec2.normalize(dir, dir)
    vec2.scale(dir, dir, amount)
    vec2.add(a, a, dir)
    vec2.sub(b, b, dir)
    return [a as number[], b as number[]]
  }

  let lineDistFromCenter = 0.5
  let cornerLineWidth = 4.0

  let bevelSpace = Math.sqrt(Math.pow(bevelRadius, 2) * 2) / 2
  let strikethrough = { linePoints: shorten([[1.0, 1.0], [lineDistFromCenter, lineDistFromCenter]], bevelSpace), growDirection: [cornerLineWidth], loop: false }
  let strikethrough2 = { linePoints: shorten([[-lineDistFromCenter, -lineDistFromCenter], [-1.0, -1.0]], bevelSpace), growDirection: [cornerLineWidth], loop: false }
  let strikethrough3 = { linePoints: shorten([[-1.0, 1.0], [-lineDistFromCenter, lineDistFromCenter]], bevelSpace), growDirection: [cornerLineWidth], loop: false }
  let strikethrough4 = { linePoints: shorten([[lineDistFromCenter, -lineDistFromCenter], [1.0, -1.0]], bevelSpace), growDirection: [cornerLineWidth], loop: false }
  return generateWireframe(gl, [outerLine, strikethrough, strikethrough2, strikethrough3, strikethrough4])
}

class HologramTile extends DrawableContainer implements ISlotTile {
  ressources: IRessources
  wireFrame: drawableMesh
  shadow: drawableMesh
  tileFill: drawableMesh
  frame: DrawableContainer
  icon: drawableMesh
  texId: number = -1
  stopPop: drawableMesh
  gamedata: SlotGame
  stopAnimationHandler: StopAnimationHandler
  defaultShadowSize = 1.05
  highlight: drawableMesh
  hightlightAnimation: HihlightAnimationHandler
  iconColor: GlColor
  tileBorder: drawableMesh

  performStopAnimation(index: number) {
    this.stopAnimationHandler.startDelayed(index * 40)
  }

  constructor(ressources: IRessources, gamedata: SlotGame, gl: WebGLRenderingContext) {
    super([])

    if (hologramRessources == undefined || hologramRessources.gl != gl) {
      hologramRessources = createHologramRessources(gl)
    }

    this.iconColor = ressources.token.primary
    let frameSize = 0.82

    this.shadow = new drawableMesh(ressources.buffer.rect,
      [ressources.textures.tileShadow],
      ressources.shader.simpleTextures)
    this.shadow.setScaleNumber(this.defaultShadowSize)
    this.shadow.setTransparency(true)
    this.shadow.setColor(ressources.token.primary.multAlpha(0.5))

    this.tileFill = new drawableMesh(hologramRessources.tileFill,
      [hologramRessources.holoGlow],
      ressources.shader.boardTexShader)
    this.tileFill.setScaleNumber(1.0 * frameSize + 0.02)
    this.tileFill.setTransparency(true)
    this.tileFill.setRenderOrder(2)
    this.tileFill.setColorB(ressources.token.primary.multAlpha(0).brightness(0.5))
    this.tileFill.setColorC(ressources.token.primaryBright.multAlpha(0).brightness(0.5))

    this.wireFrame = new drawableMesh(hologramRessources.wireFrame,
      [],
      ressources.shader.boardColoredLineShader)
    this.wireFrame.setScaleNumber(1.0 * frameSize - 0.02)
    this.wireFrame.setColorB(ressources.token.primary)

    this.stopPop = new drawableMesh(ressources.buffer.tileHighlight,
      [],
      ressources.shader.boardColoredLineShader)
    this.stopPop.setScale([1.0 * frameSize, 1.0 * frameSize, 1.0 * frameSize])
    this.stopPop.setVisible(false)
    this.stopPop.setColor(ressources.token.primary)

    this.frame = new DrawableContainer([this.shadow, this.tileFill, this.wireFrame, this.stopPop])

    let iconSize = 0.9
    this.icon = new drawableMesh(ressources.buffer.rect,
      [],
      ressources.shader.slotBoard)
    this.icon.setScale([1.0 * iconSize, 1.5 * iconSize, 1.0 * iconSize])
    this.icon.setTransparency(true)
    this.icon.setVisible(false)
    this.icon.setColor(ressources.token.backgroundElevated)
    this.icon.setColorC(ressources.token.primaryBright)
    this.icon.setRenderOrder(2)

    let highlightSize = 1.3

    let high = new drawableMesh(ressources.buffer.rect,
      [ressources.textures.hightlightGradient, ressources.textures.hightlightMod],
      ressources.shader.hightlight)
    high.setRenderOrder(1)
    high.setVisible(false)
    high.setColor(ressources.token.primary)
    high.setScale([highlightSize, highlightSize, highlightSize])
    high.setShaderPara1(0.0)
    high.setTransparency(true)
    this.highlight = high
    this.hightlightAnimation = new HihlightAnimationHandler(gamedata, this.highlight, highlightSize)

    this.tileBorder = new drawableMesh(hologramRessources.tileBorderBuffer,
      [],
      ressources.shader.boardColoredLineShader)
    this.tileBorder.setScaleNumber(0);
    this.tileBorder.setTransparency(true)
    this.tileBorder.setRenderOrder(2)
    this.tileBorder.setColor(GlColor.White.multAlpha(0.5))

    this.elements = [high, this.frame, this.icon, this.tileBorder]
    this.ressources = ressources
    this.gamedata = gamedata
    this.adjustBlur(0)
    this.setLocation([0.0, 0.0, 0.05]);

    this.stopAnimationHandler = new StopAnimationHandler(this.gamedata, this.stopPop, this.ressources)
  }

  setIconId(texId: number) {
    this.icon.setVisible(true)
    this.texId = texId
    let mappedTexId = mapIconId(texId)
    this.icon.setTexture(
      [this.ressources.textures.icons[mappedTexId],
      this.ressources.textures.iconsBlured[mappedTexId],
      hologramRessources.tileEmptyBlur])

    let color = this.ressources.token.iconColors[mappedTexId]
    this.wireFrame.setColor(color)
    this.tileFill.setColorB(color.multAlpha(0).brightness(0.5))
    this.icon.setColor(this.ressources.token.backgroundElevated)
    this.icon.setColorB(this.ressources.token.primary)
    this.icon.setColorC(color)
    this.iconColor = color
    this.stopPop.setColor(color)
    this.shadow.setColor(color.multAlpha(0.4))
  }

  getLocation() {
    return this.icon.getLocation()
  }

  setLocation(loc: [number, number, number]): void {
    super.setLocation(loc)
    this.wireFrame.addLocation([0, 0, -0.002])
    this.shadow.addLocation([0.0, 0.0, 0.01])
    this.stopPop.addLocation([0, 0, -0.0])
    this.icon.addLocation([0, 0, 0.01])
    this.highlight.addLocation([0, 0, -0.01])
  }

  addLocation(loc: [number, number, number]): void {
    super.addLocation(loc)
  }

  setShaderPara1(value: number) {
    if (value > 0.99) {
      this.frame.setVisible(false)
      this.wireFrame.setVisible(false)
    }
    else {
      this.frame.setVisible(true)
      this.wireFrame.setVisible(true)
    }

    this.adjustBlur(value)
  }

  adjustBlur(value: number) {
    this.icon.setShaderPara1(value)

    let valInverted = (1 - value)
    let delayedVal = Math.min(valInverted, 0.5) * 2.0
    let fastVal = Math.max(1 - value * 4.0, 0.0)
    this.tileFill.setColor(this.ressources.token.background.multAlpha(delayedVal))
    this.wireFrame.setColor(this.iconColor.multAlpha(fastVal))
  }

  reset() {
    this.adjustBlur(0)
    this.shadow.setScaleNumber(this.defaultShadowSize)
    this.highlight.setVisible(false)
    this.tileBorder.setVisible(false)
  }

  setHighlight(color: GlColor, fadeInDuration: number) {
    this.shadow.setColor(color.multAlpha(0.4))
    this.shadow.setLocation(this.getLocation())
    new GrowAnimationHandler(this.gamedata, this.shadow, 1.4, fadeInDuration)
    this.tileBorder.setVisible(true)

    this.highlight.setColor(color.multAlpha(0.6))

    this.hightlightAnimation.fadeInDuration = fadeInDuration
    this.hightlightAnimation.start()

    new GrowAnimationHandler(this.gamedata, this.tileBorder, this.tileFill.getScale()[0], fadeInDuration)
  }
}

export default HologramTile