import { vec2, vec3 } from "gl-matrix";
import { IBufferInfo, createAndFillBuffer } from "../openGl/Buffer";

interface IWireFrameLine extends IWireBevelLine {
  growDirection: number[]
}

interface IWireBevelLine {
  linePoints: number[][]
  loop: boolean
}

function ortoVec(value: vec2): vec2 {
  return vec2.fromValues(value[1], -value[0]);
}

function generateSubdivisions(line: IWireBevelLine, count: number) {
  let totalLen = calcLineLength(line);
  let newPoints: number[][] = []
  var lastPoint: number[] | null = line.loop ? line.linePoints[line.linePoints.length - 1] : null
  line.linePoints.forEach(element => {
    if (lastPoint != null) {
      let edgeLen = calcEdgeLength(lastPoint, element);
      let edgeSubs = Math.round(Math.max(count / totalLen * edgeLen, 1))
      for (var i = 1; i <= edgeSubs; i++) {
        var local = i / edgeSubs
        newPoints.push([(1 - local) * lastPoint[0] + local * element[0],
        (1 - local) * lastPoint[1] + local * element[1]])
      }
    }
    else {
      newPoints.push(line.linePoints[0])
    }
    lastPoint = element
  });

  return newPoints
}

function calcEdgeLength(a: number[], b: number[]) {
  let edge = vec2.fromValues(a[0], a[1]);
  vec2.subtract(edge, edge, vec2.fromValues(b[0], b[1]));
  let edgeLen = vec2.len(edge);
  return edgeLen;
}

function calcLineLength(line: IWireBevelLine) {
  var lastPoint: number[] | null = line.loop ? line.linePoints[line.linePoints.length - 1] : null;
  var totalLength = 0;
  line.linePoints.forEach(element => {
    if (lastPoint != null) {
      totalLength += calcEdgeLength(lastPoint, element);
    }
    lastPoint = element;
  });
  return totalLength
}

function generateShift(points: number[][], growDirection: number[], loop: boolean) {
  let result: number[][][] = []
  for (var i = 0; i < points.length; i++) {
    let currentPoint = points[i] as vec2

    var lastPoint: vec2 | null = null
    if (i > 0) {
      lastPoint = points[i - 1] as vec2
    }
    else if (loop) {
      lastPoint = points[points.length - 1] as vec2
    }

    var lastNormal = vec2.fromValues(0, 0)

    if (lastPoint) {
      vec2.sub(lastNormal, currentPoint, lastPoint)
      lastNormal = ortoVec(lastNormal)
      vec2.normalize(lastNormal, lastNormal)
    }

    var nextPoint: vec2 | null = null
    if (i < points.length - 1) {
      nextPoint = points[i + 1] as vec2
    }
    else if (loop) {
      nextPoint = points[0] as vec2
    }

    var nextNormal = vec2.fromValues(0, 0)

    if (nextPoint) {
      vec2.sub(nextNormal, nextPoint, currentPoint)
      nextNormal = ortoVec(nextNormal)
      vec2.normalize(nextNormal, nextNormal)
    }

    var combinedNormal = vec2.create()
    vec2.add(combinedNormal, lastNormal, nextNormal)
    if (lastPoint && nextPoint) {
      vec2.normalize(combinedNormal, combinedNormal)
      vec2.scale(combinedNormal, combinedNormal, 1 / vec2.dot(combinedNormal, nextNormal))
    }

    let toGrowIndex = growDirection.length - 1
    let mult = toGrowIndex == 0 ? 0.5 : 1.0
    result.push([[combinedNormal[0] * -growDirection[0] * mult, combinedNormal[1] * -growDirection[0] * mult],
    [combinedNormal[0] * growDirection[toGrowIndex] * mult, combinedNormal[1] * growDirection[toGrowIndex] * mult]])
  }
  return result
}

function generatePositionBuffer(linePoints: number[][], loop: boolean) {
  let tris: number[][][] = []
  let lastVert: number[] | null = loop ? linePoints[linePoints.length - 1] : null
  linePoints.forEach(element => {
    if (lastVert != null) {
      tris.push([lastVert, element, element])
      tris.push([lastVert, element, lastVert])
    }
    lastVert = element
  });
  return trisanglesToArray(tris)
}

function generateNormalBuffer(lineShift: number[][][], loop: boolean) {
  let tris: number[][][] = []
  let lastNormal: number[][] | null = loop ? lineShift[lineShift.length - 1] : null
  lineShift.forEach(element => {
    if (lastNormal != null) {
      tris.push([lastNormal[0], lastNormal[0], element[1]])
      tris.push([lastNormal[0], element[1], lastNormal[1]])
    }
    lastNormal = element
  });
  return trisanglesToArray(tris)
}

function generateWireframe(gl: WebGLRenderingContext, lines: IWireFrameLine[]): IBufferInfo {

  let positions: number[] = []
  let normals: number[] = []

  lines.forEach(line => {
    positions.push(...generatePositionBuffer(line.linePoints, line.loop))

    let lineShift = generateShift(line.linePoints, line.growDirection, line.loop)
    normals.push(...generateNormalBuffer(lineShift, line.loop))
  });

  const positionBuffer = createAndFillBuffer(gl, positions);
  const normalBuffer = createAndFillBuffer(gl, normals);

  return { positionBuffer, normalBuffer, uvBuffer: null, vertexCount: positions.length / 2 };
}

function generateBevel(line: IWireBevelLine, radius: number) {
  let points = line.linePoints
  let newPoints: number[][] = []
  for (var i = 0; i < points.length; i++) {
    let currentPoint = points[i] as vec2

    var lastPoint: vec2 | null = null
    if (i > 0) {
      lastPoint = points[i - 1] as vec2
    }
    else if (line.loop) {
      lastPoint = points[points.length - 1] as vec2
    }
    var nextPoint: vec2 | null = null
    if (i < points.length - 1) {
      nextPoint = points[i + 1] as vec2
    }
    else if (line.loop) {
      nextPoint = points[0] as vec2
    }

    if (lastPoint && nextPoint) {
      function calcBevelPoint(a: vec2, b: vec2) {
        let vecBack = vec2.create()
        vec2.subtract(vecBack, b, a)
        vec2.normalize(vecBack, vecBack)
        vec2.scale(vecBack, vecBack, radius)
        vec2.add(vecBack, a, vecBack)
        return vecBack as number[]
      }

      newPoints.push(calcBevelPoint(currentPoint, lastPoint))
      newPoints.push(calcBevelPoint(currentPoint, nextPoint))
    }
    else {
      newPoints.push(currentPoint as number[])
    }
  }

  return newPoints
}

function fillOutline(outlinePoints: number[][]) {
  let center = vec2.create()
  outlinePoints.forEach(point => {
    vec2.add(center, center, point as vec2)
  });
  vec2.scale(center, center, 1 / outlinePoints.length)

  let tris: number[][][] = []
  let leftIndex = 0
  let lastPoint = outlinePoints[outlinePoints.length - 1]
  outlinePoints.forEach(point => {
    tris.push([lastPoint, point, center as number[]])
    lastPoint = point
  });

  let newPoints = trisanglesToArray(tris)

  return newPoints
}

function createRim(line: IWireBevelLine, height: number) {
  let tris: number[][][] = []
  let lastPoint: number[] | null = line.loop ? addZ(line.linePoints[line.linePoints.length - 1], 0) : null
  line.linePoints.forEach(point => {
    point = addZ(point, 0)
    if (lastPoint != null) {
      tris.push([lastPoint, point, add(lastPoint, [0, 0, height])])
      tris.push([add(lastPoint, [0, 0, height]), point, add(point, [0, 0, height])])
    }
    lastPoint = point
  });

  return trisanglesToArray(tris)
}


function generateTriangleSubdivisions(points: number[][], count: number): number[][] {
  let newPoints: number[][] = []
  for (var i = 0; i < points.length; i += 3) {
    let a: number[] = points[i]
    let b: number[] = points[i + 1]
    let c: number[] = points[i + 2]

    let ab = scale(add(a, b), 0.5)
    let bc = scale(add(b, c), 0.5)
    let ca = scale(add(c, a), 0.5)

    newPoints.push(...[ca, a, ab])
    newPoints.push(...[c, ca, bc])
    newPoints.push(...[bc, ab, b])
    newPoints.push(...[ca, ab, bc])
  }
  return count - 1 == 0 ? newPoints : generateTriangleSubdivisions(newPoints, count - 1)
}

function trisanglesToArray(tris: number[][][]) {
  let newPoints: number[] = []
  tris.forEach(tri => {
    tri.forEach(point => {

      newPoints.push(...addZ(point, 0))
    });
  });
  return newPoints
}

function calculateNormal(positions: number[]) {
  let normals: number[] = []
  for (var i = 0; i < positions.length; i += 9) {
    let a = positions.slice(i, i + 3) as vec3
    let b = positions.slice(i + 3, i + 6) as vec3
    let c = positions.slice(i + 6, i + 9) as vec3

    let tanA = vec3.create()
    vec3.subtract(tanA, b, a)

    let tanB = vec3.create()
    vec3.subtract(tanB, c, a)

    let normal = vec3.create()
    vec3.cross(normal, tanA, tanB)
      vec3.normalize(normal, normal)
     

    normals.push(...normal as number[])
    normals.push(...normal as number[])
    normals.push(...normal as number[])
  }
  return normals
}

function addZ(a: number[], z: number) {
  return a.length == 3 ? a : [...a, z]
}

function add(a: number[], b: number[]): number[] {
  return a.map((e, i) => e + (i >= b.length ? 0.0 : b[i]))
}

function scalePoints(points: number[][], k: number) {
  return points.map(p => scale(p,k))
}

function scale(a: number[], k: number): number[] {
  return a.map((e) => e * k)
}

function addThirdDimToVecs(vecs: number[][], z: number) {
  return vecs.map(v => addZ(v, z))
}

function calculateUv(positions: number[]) {
  let minX = Number.MAX_VALUE
  let maxX = Number.MIN_VALUE
  let minY = Number.MAX_VALUE
  let maxY = Number.MIN_VALUE
  for (var i = 0; i < positions.length; i += 3) {
    let pos = positions.slice(i, i + 3) as vec3

    let x = pos[0]
    minX = x < minX ? x : minX
    maxX = x > maxX ? x : maxX
    
    let y = pos[1]
    minY = y < minY ? y : minY
    maxY = y > maxY ? y : maxY
  }

  let uvs: number[] = []
  for (var i = 0; i < positions.length; i += 3) {
    let pos = positions.slice(i, i + 3) as vec3

    let x = pos[0]
    minX = x < minX ? x : minX
    
    let y = pos[1]
    minY = y < minY ? y : minY

    uvs.push((pos[0]-minX)/(maxX-minX))
    uvs.push((pos[1]-minY)/(maxY-minY))
  }
  return uvs
}

export default generateWireframe

export {
  generateWireframe,
  generateSubdivisions,
  generateBevel,
  IWireFrameLine,
  fillOutline,
  createRim,
  generateTriangleSubdivisions,
  addThirdDimToVecs,
  calculateNormal,
  scalePoints,
  calculateUv
}