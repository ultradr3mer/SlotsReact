import { mat4, vec3 } from 'gl-matrix';
import { stringToRgb } from '../util/SlotsUtil'
import { IRessources } from './ressources'
import { SlotGame } from './SlotGame';

interface IDrawContext {
  gl: WebGLRenderingContext
  projectionMatrix: mat4
  time: number,
  pixelWorldSize: number[],
  lightVector: number[]
}

interface IDrawableObject {
  setShaderPara1(value: number): unknown;
  addLocation(loc: [number, number, number]): unknown;
  setLocation(loc: number[]): unknown;
  getLocation(): number[];
  getRenderOrder(): number
  draw(context: IDrawContext): void
}

function drawloop(gamedata: SlotGame, ressources: IRessources, time: number) {
  const gl = ressources.gl;

  var canvas = gl.canvas as HTMLCanvasElement;
  let innerContainer = canvas.parentElement as HTMLCanvasElement;

  canvas.height = innerContainer.clientHeight * devicePixelRatio;
  canvas.width = innerContainer.clientWidth * devicePixelRatio;

  gl.viewport(0, 0, canvas.clientWidth * devicePixelRatio, canvas.clientHeight * devicePixelRatio);

  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.clearColor(ressources.token.background.r,
    ressources.token.background.g,
    ressources.token.background.b,
    1.0);

  gl.colorMask(true, true, true, true);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let canvasElement = gl.canvas as Element
  const aspect = canvasElement.clientWidth / canvasElement.clientHeight;
  const projectionMatrix = mat4.create();

  var orthoSize = canvasElement.clientWidth > 500 ? 3.9 : 3.9;
  mat4.ortho(projectionMatrix,
    -orthoSize * aspect,
    orthoSize * aspect,
    -orthoSize,
    orthoSize,
    -orthoSize,
    orthoSize);

  // mat4.rotate(projectionMatrix, projectionMatrix, -0.2, [1.0, 0.0, 0.0] as vec3)
  // projectionMatrix.

  // let lookAt = mat4.create();
  // mat4.lookAt(lookAt, [0.0, -8, 20.0] as vec3, [0.0, 0.0, 0.0] as vec3, [0.0, 1.0, 1.0] as vec3)
  // mat4.perspective(projectionMatrix, Math.PI / 8.0, aspect * 1.05, 0.1, 30.0)
  // mat4.multiply(projectionMatrix, projectionMatrix, lookAt)

  let mult = canvasElement.clientWidth > 500 ? 600 : 400
  let pixelWorldSize = [orthoSize / mult , orthoSize / mult]

  let lightVector = vec3.fromValues(3, 5, 7)
  vec3.normalize(lightVector, lightVector)

  var drawData = { gl, projectionMatrix, time, pixelWorldSize, lightVector: lightVector as number[]  }

  var lateRender: IDrawableObject[] = []
  var regularRender: IDrawableObject[] = []
  var earlyRender: IDrawableObject[] = []


  gamedata.sceneObjects.forEach((item: IDrawableObject) => {
    if (item.getRenderOrder() < 0) {
      earlyRender.push(item)
    }
    else if (item.getRenderOrder() === 0) {
      regularRender.push(item)
    }
    else {
      lateRender.push(item);
    }
  })

  earlyRender.sort((a, b) => a.getRenderOrder() - b.getRenderOrder())
    .forEach(item => {
      item.draw(drawData);
    })

  regularRender.sort((a, b) => a.getLocation()[2] - b.getLocation()[2] ).forEach(item => {
    item.draw(drawData)
  })

  lateRender.sort((a, b) => a.getRenderOrder() - b.getRenderOrder())
    .forEach(item => {
      item.draw(drawData);
    })

}


export default drawloop;

export { IDrawContext, IDrawableObject }