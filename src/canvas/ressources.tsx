import initShaderSlotBoardTwo from '../openGl/shader/slotBoardTwoShader'
import initSimpleTex from '../openGl/shader/simpleTexShader'
import loadImageAndCreateTextureInfo, { ITextureInfo } from '../openGl/texture';
import initShaderRunnArrows from '../openGl/shader/runArrowsShader'
import initExplosionShader from '../openGl/shader/explosionShader'
import initHighlightsShader from '../openGl/shader/highlightsShader'
import hightlightGradient from '../assets/images/hightlightGradient.png'
import hightlightMod from '../assets/images/hightlightMod.png'
import groupOutStraight from '../assets/images/groupOutStraigt.png'
import groupOutEdge from '../assets/images/groupOutEdge.png'
import groupOutInner from '../assets/images/groupOutInner.png'
import groupOutEdgeDiag from '../assets/images/groupOutEdgeDiag.png'
import groupOutDiagBridge from '../assets/images/groupOutDiagBridge.png'
import tileShadow from '../assets/images/tileShadow.png'
import tileEmptyBlur from '../assets/images/tile-empty-blur.png'
import initGroupOutlineShader from '../openGl/shader/groupOutlineShader'
import { IBufferInfo, createAndFillBuffer } from '../openGl/Buffer'
import { Interface } from 'readline';
import { IShaderInfo } from '../openGl/shader/shader';
import Color from '../util/Color';
import { GlColor, glColorFromRgbString } from '../util/SlotsUtil';
import boardJustColorShader from '../openGl/shader/boardJustColorShader';
import { vec2 } from 'gl-matrix';
import { Result } from 'antd';
import boardColoredLineShader from '../openGl/shader/boardColoredLineShader';
import { generateWireframe, generateSubdivisions as generateLineSubdivisions, generateBevel, IWireFrameLine, fillOutline, createRim, addThirdDimToVecs, generateTriangleSubdivisions, calculateNormal } from './MeshGenerator';
import boardColoredLineDottedShader from '../openGl/shader/boardColoredLineDottedShader';
import slotBoardTileBlurShader from '../openGl/shader/slotBoardTileBlurShader';
import { initGroupDiagonalBridgeBuffer, initGroupEdgeFrameBuffer, initGroupInnerFrameBuffer, initGroupStraigtFrameBuffer } from './GroupOutline';
import boardTexShader from '../openGl/shader/boardTexShader';

interface IRessourcesToken {
  primary: GlColor
  primaryBright: GlColor
  groupColors: GlColor[]
  background: GlColor,
  backgroundElevated: GlColor,
  colorSlotDarkBorder: GlColor,
  colorContrastColor: GlColor,
  colorSlotShadow: GlColor,
  iconColors: GlColor[],
  tileSkin: string
}

interface IRessourcesBuffer {
  rect: IBufferInfo
  frameWire: IBufferInfo
  longLines: IBufferInfo
  longLinesCross: IBufferInfo
  tileFill: IBufferInfo,
  divider: IBufferInfo,
  dividerHighlight: IBufferInfo,
  dividerDarken: IBufferInfo,
  tileHighlight: IBufferInfo,
}

interface IResourcesShader {
  slotBoard: IShaderInfo
  simpleTextures: IShaderInfo
  runArrows: IShaderInfo
  explosion: IShaderInfo
  hightlight: IShaderInfo
  groupOutline: IShaderInfo
  boardJustColorShader: IShaderInfo
  boardColoredLineShader: IShaderInfo
  boardColoredLineDottedShader: IShaderInfo,
  slotBoardTileBlurShader: IShaderInfo,
  boardTexShader: IShaderInfo
}

interface IRessourcesTextures {
  icons: ITextureInfo[]
  iconsBlured: ITextureInfo[]
  divider: ITextureInfo
  empty: ITextureInfo
  emptyBlured: ITextureInfo
  runArrows: ITextureInfo
  runArrowsStrop: ITextureInfo
  hightlightGradient: ITextureInfo
  hightlightMod: ITextureInfo
  groupOutEdge: ITextureInfo
  groupOutStraight: ITextureInfo
  groupOutInner: ITextureInfo
  groupOutEdgeDiag: ITextureInfo
  groupOutDiagBridge: ITextureInfo
  tileShadow: ITextureInfo
  tileEmptyBlur: ITextureInfo
}

interface IRessources {
  gl: WebGLRenderingContext
  buffer: IRessourcesBuffer
  shader: IResourcesShader
  textures: IRessourcesTextures
  token: IRessourcesToken
}

function initializeRessoures(element: any, colors: IRessourcesToken): IRessources {
  const gl = initGl(element);

  return {
    gl: gl,
    buffer: {
      rect: initRectBuffer(gl),
      frameWire: initTileFrameWire(gl),
      longLines: initLongLinesDotted(gl),
      longLinesCross: initLongLinesCross(gl),
      tileFill: initTileFrameBuffer(gl),
      divider: initDividerBuffer(gl),
      dividerHighlight: initDividerHightlightBuffer(gl),
      dividerDarken: initDividerDarkenBuffer(gl),
      tileHighlight: initTileHighlight(gl)
    },
    shader: {
      slotBoard: initShaderSlotBoardTwo(gl),
      simpleTextures: initSimpleTex(gl),
      runArrows: initShaderRunnArrows(gl),
      explosion: initExplosionShader(gl),
      hightlight: initHighlightsShader(gl),
      groupOutline: initGroupOutlineShader(gl),
      boardJustColorShader: boardJustColorShader(gl),
      boardColoredLineShader: boardColoredLineShader(gl),
      boardColoredLineDottedShader: boardColoredLineDottedShader(gl),
      slotBoardTileBlurShader: slotBoardTileBlurShader(gl),
      boardTexShader: boardTexShader(gl)
    },
    textures: {
      icons: [
        loadImageAndCreateTextureInfo(gl, "icons/icon-om.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-100.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-bell.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-cherry.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-clover.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-diamond-emoji.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-fire.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-robot.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-skull.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-clubs-black.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-diamonds-black.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-hearts-black.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-spades-black.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-clubs-red.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-diamonds-red.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-hearts-red.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-spades-red.png"),
        loadImageAndCreateTextureInfo(gl, "icons/icon-cop.png"),
        loadImageAndCreateTextureInfo(gl, "icons/freespin.png"),
        loadImageAndCreateTextureInfo(gl, "icons/mult.png"),
      ],
      iconsBlured: [ 
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-om.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-100.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-bell.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-cherry.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-clover.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-diamond-emoji.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-fire.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-robot.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-skull.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-clubs-black.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-diamonds-black.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-hearts-black.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-spades-black.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-clubs-red.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-diamonds-red.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-hearts-red.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-spades-red.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/icon-cop.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/freespin.png"),
        loadImageAndCreateTextureInfo(gl, "icons/blured/mult.png"),
      ],
      divider: loadImageAndCreateTextureInfo(gl, "images/divider.png"),
      empty: loadImageAndCreateTextureInfo(gl, "icons/icon-empty.png"),
      emptyBlured: loadImageAndCreateTextureInfo(gl, "icons/blured/icon-empty.png"),
      runArrows: loadImageAndCreateTextureInfo(gl, "images/run_arrows.png", { repeat: true }),
      runArrowsStrop: loadImageAndCreateTextureInfo(gl, "images/run_arrows_stop.png"),
      hightlightGradient: loadImageAndCreateTextureInfo(gl, hightlightGradient),
      hightlightMod: loadImageAndCreateTextureInfo(gl, hightlightMod, { repeat: true }),
      groupOutEdge: loadImageAndCreateTextureInfo(gl, groupOutEdge),
      groupOutStraight: loadImageAndCreateTextureInfo(gl, groupOutStraight),
      groupOutInner: loadImageAndCreateTextureInfo(gl, groupOutInner),
      groupOutEdgeDiag: loadImageAndCreateTextureInfo(gl, groupOutEdgeDiag),
      groupOutDiagBridge: loadImageAndCreateTextureInfo(gl, groupOutDiagBridge),
      tileShadow: loadImageAndCreateTextureInfo(gl, tileShadow),
      tileEmptyBlur: loadImageAndCreateTextureInfo(gl, tileEmptyBlur),
    },
    token: colors
  }
}

function createIconColors() {
  return [
    glColorFromRgbString('#9879ff'),
    glColorFromRgbString('#f07617'),
    glColorFromRgbString('#ffc83d'),
    glColorFromRgbString('#ff1326'),
    glColorFromRgbString('#1be314'),
    glColorFromRgbString('#31d2f7'),
    glColorFromRgbString('#ff950c'),
    glColorFromRgbString('#dddddd'),
    glColorFromRgbString('#dddddd'),
    glColorFromRgbString('#4667ff'),
    glColorFromRgbString('#4667ff'),
    glColorFromRgbString('#4667ff'),
    glColorFromRgbString('#4667ff'),
    glColorFromRgbString('#ff0063'),
    glColorFromRgbString('#ff0063'),
    glColorFromRgbString('#ff0063'),
    glColorFromRgbString('#ff0063'),
    glColorFromRgbString('#3a96dd'),
    glColorFromRgbString('#00ff00'),
    glColorFromRgbString('#ff4a42'),
  ]
}

const longLineWidth = 2.0

const tileheight = 0.1

function initLongLinesDotted(gl: WebGLRenderingContext): IBufferInfo {
  let xLoc = [-3.0, -1.0, 1.0, 3.0]
  let lines: IWireFrameLine[] = []
  xLoc.forEach(x => {
    let line: IWireFrameLine = { linePoints: [[x, -4.5], [x, 4.5]], growDirection: [longLineWidth], loop: false }
    line.linePoints = generateLineSubdivisions(line, 8)
    lines.push(line)
  });
  return generateWireframe(gl, lines)
}

function initLongLinesCross(gl: WebGLRenderingContext): IBufferInfo {
  let xAndYLoc = [-3.0, -1.0, 1.0, 3.0]
  let lines: IWireFrameLine[] = []
  let width = 0.13
  xAndYLoc.forEach(x => {
    xAndYLoc.forEach(y => {
      let line: IWireFrameLine = { linePoints: [[x - width, y], [x + width, y]], growDirection: [longLineWidth], loop: false }
      lines.push(line)
    })
  });
  return generateWireframe(gl, lines)
}

function initTileHighlight(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0], [1.0, -1.0]], growDirection: [2.0, 0.5], loop: true }
  let bevelRadius = 0.2
  outerLine.linePoints = generateBevel(outerLine, bevelRadius)

  let lowerLine = { linePoints: addThirdDimToVecs(outerLine.linePoints, -tileheight), growDirection: [20.0, 0.0], loop: true }
  return generateWireframe(gl, [lowerLine])
}

function initTileFrameWire(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0], [1.0, -1.0]], growDirection: [3.5, 0.5], loop: true }
  let bevelRadius = 0.2
  outerLine.linePoints = generateBevel(outerLine, bevelRadius)
  // outerLine.linePoints = generateLineSubdivisions(outerLine, 8)

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
  let lowerLine = { linePoints: addThirdDimToVecs(outerLine.linePoints, -tileheight), growDirection: [0.0, 6.0], loop: true }
  return generateWireframe(gl, [outerLine, strikethrough, strikethrough2, strikethrough3, strikethrough4, lowerLine])
}

function initDividerBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let top = { linePoints: [[3.0, -3.0], [-3.0, -3.0]], growDirection: [200, 0], loop: false }
  let bottom = { linePoints: [[-3.0, 3.0], [3.0, 3.0]], growDirection: [200, 0], loop: false }
  return generateWireframe(gl, [top, bottom])
}

function initDividerHightlightBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let top = { linePoints: [[3.1, -3.0], [-3.1, -3.0]], growDirection: [3, 0], loop: false }
  let bottom = { linePoints: [[-3.1, 3.0], [3.1, 3.0]], growDirection: [3, 0], loop: false }
  return generateWireframe(gl, [top, bottom])
}

function initDividerDarkenBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let top = { linePoints: [[3.1, -3.0], [-3.1, -3.0]], growDirection: [3, 0], loop: false }
  let bottom = { linePoints: [[-3.1, 3.0], [3.1, 3.0]], growDirection: [3, 0], loop: false }
  return generateWireframe(gl, [top, bottom])
}

function initTileFrameBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0], [1.0, -1.0]], loop: true }
  let bevelRadius = 0.2
  outerLine.linePoints = generateBevel(outerLine, bevelRadius)
  // outerLine.linePoints = generateLineSubdivisions(outerLine, 8)
  let top = fillOutline(outerLine.linePoints);
  let positions = top.concat(createRim(outerLine, -tileheight))
  let positionBuffer = createAndFillBuffer(gl, positions);
  let normals = calculateNormal(positions)
  let normalBuffer = createAndFillBuffer(gl, normals);
  return { positionBuffer, uvBuffer: null, normalBuffer: normalBuffer, vertexCount: positions.length / 3 };
}


function initRectBuffer(gl: WebGLRenderingContext): IBufferInfo {
  var positions = generateTriangleSubdivisions([
    [1.0, 1.0],
    [-1.0, 1.0],
    [1.0, -1.0],
    [-1.0, 1.0],
    [1.0, -1.0],
    [-1.0, -1.0]], 1);
  positions = addThirdDimToVecs(positions, 0)
  const positionBuffer = createAndFillBuffer(gl, positions.flatMap(p => p));

  const uvs = generateTriangleSubdivisions([
    [1.0, 0.0],
    [0.0, 0.0],
    [1.0, 1.0],
    [0.0, 0.0],
    [1.0, 1.0],
    [0.0, 1.0]], 1);
  const uvBuffer = createAndFillBuffer(gl, uvs.flatMap(u => u));

  return { positionBuffer, uvBuffer, normalBuffer: null, vertexCount: positions.length };
}


function initGl(canvas: any) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: false });

  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  return gl;
}

export default initializeRessoures;

export { IRessources, IRessourcesToken as IRessourcesColors, createIconColors }