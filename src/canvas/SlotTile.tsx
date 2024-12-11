import { IBufferInfo } from '../openGl/Buffer'
import DrawableContainer from '../openGl/DrawableContainer'
import drawableMesh from '../openGl/drawableMesh'
import { GlColor } from '../util/SlotsUtil'
import AnimationHandler from './AnimationHandler'
import { GrowAnimationHandler } from './GroupOutline'
import generateWireframe, { generateBevel } from './MeshGenerator'
import { IDrawContext, IDrawableObject } from './draw'
import { IUpdatableGameObject, SlotGame } from './SlotGame'
import { IRessources } from './ressources'

const enum SpecialTileId {
  Freespin = 1 << 16,
  Mult = 2 << 16
}

interface ISlotTile extends IDrawableObject {
  texId: number
  performStopAnimation(i: number): unknown
  setIconId(texId: number): any
  getLocation(): number[]
  setLocation(loc: [number, number, number]): void
  addLocation(loc: [number, number, number]): void
  setShaderPara1(value: number): void
  adjustBlur(value: number): void
  reset(): void
  setHighlight(color: GlColor, fadeInDuration: number): void
}

interface ITileRessources {
  tileBorderBuffer: IBufferInfo
}

function createTileRessources(gl: WebGLRenderingContext) {
  return {
    tileBorderBuffer: initTileBorderBuffer(gl),
  }
}

var tileRessources: ITileRessources


function initTileBorderBuffer(gl: WebGLRenderingContext) {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0], [1.0, -1.0]], growDirection: [0.0, 12.0], loop: true }
  let bevelRadius = 0.2
  outerLine.linePoints = generateBevel(outerLine, bevelRadius)
  return generateWireframe(gl, [outerLine])
}


class SlotTile extends DrawableContainer implements ISlotTile {
  ressources: IRessources
  wireFrame: drawableMesh
  shadow: drawableMesh
  plainFrame: drawableMesh
  frame: DrawableContainer
  icon: drawableMesh
  texId: number = -1
  tilePop: drawableMesh
  gamedata: SlotGame
  stopAnimationHandler: StopAnimationHandler
  darkShadowOffset: [number, number, number] = [0.05, 0.1, -0.1]
  shadowOffset: [number, number, number] = [0.05, 0.1, -0.1]
  defaultShadowSize = 1.05
  highlight: drawableMesh
  hightlightAnimation: HihlightAnimationHandler
  tileBorder: drawableMesh

  constructor(ressources: IRessources, gamedata: SlotGame, gl: WebGLRenderingContext) {
    super([])

    if (tileRessources == undefined) {
      tileRessources = createTileRessources(gl)
    }

    let frameSize = 0.8

    this.shadow = new drawableMesh(ressources.buffer.rect,
      [ressources.textures.tileShadow],
      ressources.shader.simpleTextures)
    this.shadow.setScaleNumber(this.defaultShadowSize)
    this.shadow.setTransparency(true)
    this.shadow.setColor(ressources.token.colorSlotShadow)

    this.plainFrame = new drawableMesh(ressources.buffer.tileFill,
      [],
      ressources.shader.boardJustColorShader)
    this.plainFrame.setScale([1.0 * frameSize, 1.0 * frameSize, 1.0 * frameSize])

    this.wireFrame = new drawableMesh(ressources.buffer.frameWire,
      [],
      ressources.shader.boardColoredLineShader)
    this.wireFrame.setScale([1.0 * frameSize, 1.0 * frameSize, 1.0 * frameSize])


    this.tilePop = new drawableMesh(ressources.buffer.tileHighlight,
      [],
      ressources.shader.boardColoredLineShader)
    this.tilePop.setScale([1.0 * frameSize, 1.0 * frameSize, 1.0 * frameSize])
    this.tilePop.setVisible(false)
    this.tilePop.setColor(ressources.token.primary)

    this.frame = new DrawableContainer([this.shadow, this.plainFrame, this.wireFrame, this.tilePop])

    let iconSize = 0.9
    this.icon = new drawableMesh(ressources.buffer.rect,
      [],
      ressources.shader.slotBoard)
    this.icon.setScale([1.0 * iconSize, 1.5 * iconSize, 1.0 * iconSize])
    this.icon.setTransparency(true)
    this.icon.setVisible(false)
    this.icon.setColor(ressources.token.backgroundElevated)
    this.icon.setColorB(new GlColor(0, 0, 0, 1))
    this.icon.setColorC(GlColor.Black)
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


    this.tileBorder = new drawableMesh(tileRessources.tileBorderBuffer,
      [],
      ressources.shader.boardColoredLineShader)
    this.tileBorder.setScaleNumber(0);
    this.tileBorder.setTransparency(true)
    this.tileBorder.setRenderOrder(2)
    this.tileBorder.setColor(GlColor.White)

    this.elements = [this.frame, this.icon, high, this.tileBorder]
    this.ressources = ressources
    this.gamedata = gamedata

    this.adjustBlur(0)
    this.setLocation([0.0, 0.0, 0.1]);

    this.stopAnimationHandler = new StopAnimationHandler(this.gamedata, this.tilePop, this.ressources)
  }
  
  performStopAnimation(index: number) {
    this.stopAnimationHandler.startDelayed(index * 40)
  }

  setIconId(texId: number) {
    this.icon.setVisible(true)
    this.texId = texId
    let mappedId = mapIconId(texId)
    this.icon.setTexture(
      [this.ressources.textures.icons[mappedId],
      this.ressources.textures.iconsBlured[mappedId],
      this.ressources.textures.tileEmptyBlur])

    let color = this.ressources.token.iconColors[mappedId]
    this.tilePop.setColor(color)
  }

  getLocation() {
    return this.icon.getLocation()
  }

  setLocation(loc: [number, number, number]): void {
    super.setLocation(loc)
    this.wireFrame.addLocation([0, 0, 0.001])
    this.shadow.addLocation(this.shadowOffset)
    this.tilePop.addLocation([0, 0, -0.05])
    this.icon.addLocation([0, 0, 0.01])
    this.highlight.addLocation([0, 0, -0.045])
    this.tileBorder.addLocation([0, 0, -0.045])
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
    this.plainFrame.setColor(this.ressources.token.backgroundElevated.multAlpha(delayedVal))
    this.wireFrame.setColor(this.ressources.token.colorSlotDarkBorder.multAlpha(fastVal))
    this.wireFrame.setColorB(this.ressources.token.primary.multAlpha(valInverted))
  }

  reset() {
    this.adjustBlur(0)
    this.shadow.setColor(this.ressources.token.colorSlotShadow)
    this.shadow.setScaleNumber(this.defaultShadowSize)
    this.shadowOffset = this.darkShadowOffset
    this.highlight.setVisible(false)
    this.tileBorder.setVisible(false)
  }

  setHighlight(color: GlColor, fadeInDuration: number) {
    this.shadow.setColor(color.multAlpha(0.4))
    this.shadowOffset = [0.0, 0.0, -0.1]
    this.shadow.setLocation(this.getLocation())
    this.shadow.addLocation(this.shadowOffset)
    new GrowAnimationHandler(this.gamedata, this.shadow, 1.4, fadeInDuration)

    this.highlight.setColor(color.multAlpha(0.6))

    this.hightlightAnimation.fadeInDuration = fadeInDuration
    this.hightlightAnimation.start()

    new GrowAnimationHandler(this.gamedata, this.tileBorder, 0.8, fadeInDuration)
  }
}

class StopAnimationHandler extends AnimationHandler {
  highlight: drawableMesh
  highlightBaseSize: number

  constructor(gamedata: SlotGame, highlight: drawableMesh, ressources: IRessources) {
    super(gamedata)
    this.highlight = highlight
    this.highlightBaseSize = 0.8
  }

  override start() {
    super.start()
    this.highlight.setVisible(true)
    this.highlight.setScaleNumber(this.highlightBaseSize)
  }

  handleAnimation(lifecycleState: number): void {
    const growSize = 0.3
    this.highlight.setScaleNumber(this.highlightBaseSize + growSize - Math.abs(lifecycleState - 0.5) * growSize * 2)

    if (lifecycleState == 1)
      this.highlight.setVisible(false)
  }
}

class HihlightAnimationHandler extends AnimationHandler {
  highlight: drawableMesh
  delayMult: number
  fadeInDuration: number
  highlightSize: number

  constructor(gamedata: SlotGame, highlight: drawableMesh, highlightSize: number) {
    super(gamedata)
    this.highlight = highlight
    this.delayMult = 0
    this.fadeInDuration = 0
    this.highlightSize = highlightSize
  }

  override start() {
    super.start()
    this.durationTicks = 20 + this.fadeInDuration * 5
    this.delayMult = this.durationTicks / 20
    this.highlight.setShaderPara1(0)
    this.highlight.setVisible(true)
  }

  handleAnimation(lifecycleState: number): void {
    this.highlight.setShaderPara1(lifecycleState)
    this.highlight.setScaleNumber(lifecycleState * this.highlightSize)
  }
}

function mapIconId(texId: number) {
  return texId < SpecialTileId.Freespin ? texId 
        : (texId >> 16) + 17
}

export default SlotTile

export { SlotTile, ISlotTile, StopAnimationHandler, HihlightAnimationHandler, SpecialTileId, mapIconId }

