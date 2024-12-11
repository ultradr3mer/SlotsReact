import { IBufferInfo, createAndFillBuffer } from "../openGl/Buffer"
import drawableMesh from "../openGl/drawableMesh";
import { GlColor } from "../util/SlotsUtil";
import AnimationHandler from "./AnimationHandler";
import generateWireframe, { IWireFrameLine, addThirdDimToVecs, calculateNormal, createRim, fillOutline, generateBevel, scalePoints } from "./MeshGenerator"
import { IDeletable, SlotGame } from "./SlotGame";
import { IGroupData } from "./canvas";
import { IRessources } from "./ressources";


interface IOutlineRessources 
{
  groupEdgeFrameBuffer: IBufferInfo,
  groupStraigtFrameBuffer: IBufferInfo,
  groupInnerFrameBuffer: IBufferInfo,
  groupDiagonalBridgeBuffer: IBufferInfo,
  groupEdgeWireFrameBuffer: IBufferInfo,
  groupEdgeStraightWireFrameBuffer: IBufferInfo,
  groupEdgeDiaWireFrameBuffer: IBufferInfo,
  groupDiagonalBridgeWireBuffer: IBufferInfo,
}

var outlineRessources: IOutlineRessources

function markGroup(gamedata: SlotGame, ressources: IRessources, colorIndex: number, group: IGroupData, height: number) {
  if(outlineRessources == undefined)
  {
    outlineRessources = createOutlineRessources(ressources.gl)
  }

  let growDuration = 1;

  const outlineRessourcesBuffer = createOutlineRessources(ressources.gl)
  let color = ressources.token.iconColors[colorIndex]
  let board = [[false, false, false],
  [false, false, false],
  [false, false, false]]
  group.points.forEach(point => {
    board[point[0]][point[1]] = true;
  });

  for (var x = 0; x < 3; x++) {
    for (var y = 0; y < 3; y++) {
      if (!board[x][y]) {
        continue;
      }

      gamedata.lanes[x].setHighlight(y, color, growDuration++)

      let globalPointLocation: [number, number, number] = [(x - 1.0) * 2.0, (y - 1.0) * 2.0, 0.0]

      function createOutline(offset: [number, number, number], rotationRad: number, bufferId: number) {
        let buffer = [outlineRessourcesBuffer.groupEdgeFrameBuffer,
        outlineRessourcesBuffer.groupStraigtFrameBuffer,
        outlineRessourcesBuffer.groupEdgeFrameBuffer,
        outlineRessourcesBuffer.groupDiagonalBridgeBuffer,
        outlineRessourcesBuffer.groupInnerFrameBuffer]
        let edge = new drawableMesh(buffer[bufferId],
          [],
          ressources.shader.boardJustColorShader)
        edge.setLocation(globalPointLocation);
        edge.addLocation(offset)
        edge.addLocation([0, 0, height])
        edge.setScaleNumber(0);
        edge.setRotationRad(rotationRad)
        edge.setColor(color.multAlpha(0.8))
        edge.setTransparency(true)
        gamedata.groupOutline.push(edge)
        gamedata.sceneObjects.push(edge)

        new GrowAnimationHandler(gamedata, edge, 0.5, growDuration)
      }

      function evaluate(x: number, y: number) {
        if (x < 0 || x > 2)
          return false;

        if (y < 0 || y > 2)
          return false;

        return board[x][y]
      }

      function evaluateAndCreate(xDir: number, yDir: number) {

        let xEmpty = !evaluate(x + xDir, y);
        let yEmpty = !evaluate(x, y + yDir);
        let diagEmpty = !evaluate(x + xDir, y + yDir);

        if (xEmpty && yEmpty) {
          if (diagEmpty) {
            let rad = Math.atan2(yDir, xDir) - Math.PI * 3 / 4;
            createOutline([xDir / 2, yDir / 2, 0], rad, 0)
          }
          else {
            let rad = Math.atan2(yDir, xDir) - Math.PI * 3 / 4;
            createOutline([xDir / 2, yDir / 2, 0], rad, 2)
            if (yDir > 0) {
              createOutline([xDir, yDir, 0], rad, 3)

            }
          }
        }
        else if (yEmpty) {
          let rad = Math.atan2(yDir, 0) - Math.PI / 2;
          createOutline([xDir / 2, yDir / 2, 0], rad, 1)
        }
        else if (xEmpty) {
          let rad = Math.atan2(0, xDir) - Math.PI / 2;
          createOutline([xDir / 2, yDir / 2, 0], rad, 1)
        }
        else {
          let rad = Math.atan2(yDir, xDir) - Math.PI * 3 / 4;
          createOutline([xDir / 2, yDir / 2, 0], rad, 4)
        }
      }
      evaluateAndCreate(-1, 1)
      evaluateAndCreate(1, 1)
      evaluateAndCreate(1, -1)
      evaluateAndCreate(-1, -1)
    }
  }
}

let groupOutlineHeight = 0.1
let growDirection = [8.0, 0.0]


function initGroupEdgeFrameBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0]], loop: false }
  let bevelRadius = 0.5
  outerLine.linePoints = generateBevel(outerLine, bevelRadius)
  outerLine.linePoints.push([1.0, -1.0])
  outerLine.loop = true
  let top = fillOutline(outerLine.linePoints);
  let positions = top //.concat(createRim(outerLine, -groupOutlineHeight))
  let positionBuffer = createAndFillBuffer(gl, positions);
  let normals = calculateNormal(positions)
  let normalBuffer = createAndFillBuffer(gl, normals);
  return { positionBuffer, uvBuffer: null, normalBuffer: normalBuffer, vertexCount: positions.length / 3 };
}

function initGroupEdgeWireFrameBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0]], growDirection: growDirection, loop: false }
  let bevelRadius = 0.5
  outerLine.linePoints = generateBevel(outerLine, bevelRadius)
  return generateWireframe(gl, [outerLine])
}

function initGroupEdgeDiaWireFrameBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0]], growDirection: growDirection, loop: false }
  let bevelRadius = 0.5
  let all = generateBevel(outerLine, bevelRadius)
  let lineA = { ...outerLine, linePoints: all.slice(0, 2) }
  let lineB = { ...outerLine, linePoints: all.slice(2, 4) }
  return generateWireframe(gl, [lineA, lineB])
}

function initGroupStraigtFrameBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0], [1.0, -1.0]], loop: true }
  let top = fillOutline(outerLine.linePoints);
  let positions = top //.concat(createRim(outerLine, -groupOutlineHeight))
  let positionBuffer = createAndFillBuffer(gl, positions);
  let normals = calculateNormal(positions)
  let normalBuffer = createAndFillBuffer(gl, normals);
  return { positionBuffer, uvBuffer: null, normalBuffer: normalBuffer, vertexCount: positions.length / 3 };
}

function initGroupEdgeStraightWireFrameBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0]], growDirection: growDirection, loop: false }
  return generateWireframe(gl, [outerLine])
}

function initGroupInnerFrameBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[1.0, 1.0], [-1.0, 1.0], [-1.0, -1.0], [1.0, -1.0]], loop: true }
  let top = fillOutline(outerLine.linePoints);
  let positions = top //.concat(createRim(outerLine, -groupOutlineHeight))
  let positionBuffer = createAndFillBuffer(gl, positions);
  let normals = calculateNormal(positions)
  let normalBuffer = createAndFillBuffer(gl, normals);
  return { positionBuffer, uvBuffer: null, normalBuffer: normalBuffer, vertexCount: positions.length / 3 };
}

function initGroupDiagonalBridgeBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let outerLine = { linePoints: [[0.5, 0.0], [0.0, 0.5], [-0.5, 0.0], [0, -0.5]], loop: true }
  let top = fillOutline(outerLine.linePoints);
  let positions = top //.concat(createRim(outerLine, -groupOutlineHeight))
  let positionBuffer = createAndFillBuffer(gl, positions);
  let normals = calculateNormal(positions)
  let normalBuffer = createAndFillBuffer(gl, normals);
  return { positionBuffer, uvBuffer: null, normalBuffer: normalBuffer, vertexCount: positions.length / 3 };
}

function initGroupDiagonalBridgeWireBuffer(gl: WebGLRenderingContext): IBufferInfo {
  let outerLineA = { linePoints: [[0.5, 0.0], [0.0, 0.5]], growDirection: growDirection, loop: false }
  let outerLineB = { linePoints: [[-0.5, 0.0], [0, -0.5]], growDirection: growDirection, loop: false }
  return generateWireframe(gl, [outerLineA, outerLineB])
}

// interface IOutlineRessourcesBuffer {
//   groupEdgeFrameBuffer: IBufferInfo,
//   groupStraigtFrameBuffer: IBufferInfo,
//   groupInnerFrameBuffer: IBufferInfo
//   groupDiagonalBridgeBuffer: IBufferInfo,
//   groupEdgeWireFrameBuffer: IBufferInfo,
//   groupEdgeStraightWireFrameBuffer: IBufferInfo,
//   tileBorderBuffer: IBufferInfo,
// }

function createOutlineRessources(gl: WebGLRenderingContext) {
  return {
    groupEdgeFrameBuffer: initGroupEdgeFrameBuffer(gl),
    groupStraigtFrameBuffer: initGroupStraigtFrameBuffer(gl),
    groupInnerFrameBuffer: initGroupInnerFrameBuffer(gl),
    groupDiagonalBridgeBuffer: initGroupDiagonalBridgeBuffer(gl),
    groupEdgeWireFrameBuffer: initGroupEdgeWireFrameBuffer(gl),
    groupEdgeStraightWireFrameBuffer: initGroupEdgeStraightWireFrameBuffer(gl),
    groupEdgeDiaWireFrameBuffer: initGroupEdgeDiaWireFrameBuffer(gl),
    groupDiagonalBridgeWireBuffer: initGroupDiagonalBridgeWireBuffer(gl),
  }
}

export {
  initGroupEdgeFrameBuffer,
  initGroupDiagonalBridgeBuffer,
  initGroupInnerFrameBuffer,
  initGroupStraigtFrameBuffer,
  markGroup
}


function setCommonProperies(wireMesh: drawableMesh, ressources: IRessources) {
  wireMesh.setTransparency(true)
  wireMesh.setRenderOrder(1)
}

function generateWireframeMitBottom(gl: WebGLRenderingContext, lines: IWireFrameLine[]): IBufferInfo {
  let upperLines = lines.map(line => {
    return {
      linePoints: addThirdDimToVecs(line.linePoints, 0),
      growDirection: line.growDirection,
      loop: line.loop
    }
  });
  let lowerLines = lines.map(line => {
    return {
      linePoints: addThirdDimToVecs(line.linePoints, -groupOutlineHeight),
      growDirection: [...line.growDirection].reverse(),
      loop: line.loop
    }
  });
  return generateWireframe(gl, [...upperLines, ...lowerLines])
}


class GrowAnimationHandler extends AnimationHandler implements IDeletable {
  element: drawableMesh
  targetSize: number
  delayMult: number;

  constructor(gamedata: SlotGame, element: drawableMesh, targetSize: number, durationTicks: number) {
    super(gamedata)
    this.element = element
    this.targetSize = 0.5
    this.durationTicks = 20 + durationTicks * 10
    this.delayMult = this.durationTicks / 20
    this.targetSize = targetSize
  }

  isDeleted(): boolean {
    return this.lifecycleState >= 1
  }

  override start() {
    super.start()
    this.element.setVisible(true)
    this.element.setScaleNumber(0)
  }

  handleAnimation(lifecycleState: number): void {
    const growSize = 0.3

    let bounce = Math.max((lifecycleState - 1.0) * this.delayMult + 1.0, 0.0)
    let biggestPoint = 0.9
    let size = (1.0 - Math.abs(bounce-biggestPoint) / biggestPoint) / biggestPoint
    if(lifecycleState == 1)
      size = 1
    
    this.element.setScaleNumber(size * this.targetSize)
  }
}


export { GrowAnimationHandler }