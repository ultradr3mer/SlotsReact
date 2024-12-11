import { mat4 } from 'gl-matrix'
import { ITextureInfo } from './texture'
import { IShaderInfo } from './shader/shader'
import { IDrawContext } from '../canvas/draw'
import { GlColor } from '../util/SlotsUtil'
import { IBufferInfo } from './Buffer'

class drawableMesh {
  private buffer: IBufferInfo
  private textureinfo: ITextureInfo[];
  private programInfo: IShaderInfo;
  private location: [number, number, number];
  private rotationAxis: [number, number, number];
  private rotationRad: number;
  private scale: [number, number, number];
  private color: GlColor;
  private shaderPara1: number;
  private isVisible = true;
  private renderOrder = 0;
  private colorB: GlColor
  private transparency: boolean
  private depthTest: boolean
  colorC: GlColor

  constructor(buffer: IBufferInfo, textureinfo: ITextureInfo[], programInfo: IShaderInfo) {
    this.buffer = buffer;
    this.textureinfo = textureinfo;
    this.programInfo = programInfo;
    this.location = [0.0, 0.0, 0.0];
    this.rotationAxis = [0.0, 0.0, 1.0];
    this.rotationRad = 0;
    this.scale = [1.0, 1.0, 1.0];
    this.color = GlColor.White;
    this.colorB = GlColor.White;
    this.colorC = GlColor.White;
    this.shaderPara1 = 0.0;
    this.isVisible = true;
    this.renderOrder = 0;
    this.transparency = false;
    this.depthTest = true;
  }

  setDepthTest(value: boolean) {
    this.depthTest = value
  }

  setTransparency(value: boolean) {
    this.transparency = value
  }

  setLocation(location: [number, number, number]) {
    this.location = [...location];
  }

  addLocation(location: [number, number, number]) {
    this.location[0] += location[0];
    this.location[1] += location[1];
    this.location[2] += location[2];
  }

  getLocation() {
    return this.location;
  }

  getScale() {
    return this.scale;
  }

  setRotation(axis: [number, number, number], rad: number) {
    this.rotationAxis = [...axis];
    this.rotationRad = rad
  }

  setRotationRad(rad: number) {
    this.rotationRad = rad
  }

  setScale(scale: [number, number, number]) {
    this.scale = scale;
  }

  setScaleNumber(scale: number) {
    this.scale = [scale, scale, scale];
  }

  setTexture(textureinfo: ITextureInfo[]) {
    this.textureinfo = textureinfo
  }

  setVisible(value: boolean) {
    this.isVisible = value
  }

  getIsVisible() {
    return this.isVisible
  }

  createMvm() {
    var modelViewMatrix = mat4.create();
    mat4.translate(
      modelViewMatrix,
      modelViewMatrix,
      this.location
    );
    mat4.scale(
      modelViewMatrix,
      modelViewMatrix,
      this.scale);
    mat4.rotate(modelViewMatrix,
      modelViewMatrix,
      this.rotationRad,
      this.rotationAxis)

    return modelViewMatrix;
  }

  setShaderPara1(value: number) {
    this.shaderPara1 = value
  }

  setRenderOrder(order: number) {
    this.renderOrder = order
  }

  getRenderOrder() {
    return this.renderOrder
  }

  setColor(color: GlColor) {
    this.color = color
  }

  getColor() {
    return this.color
  }

  setColorB(color: GlColor) {
    this.colorB = color
  }

  setColorC(color: GlColor) {
    this.colorC = color
  }

  draw(data: IDrawContext) {
    if (!this.isVisible) {
      return
    }

    var gl = data.gl;
    var projectionMatrix = data.projectionMatrix

    const modelViewMatrix = this.createMvm();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.positionBuffer);
    gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
    gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);

    if (this.buffer.uvBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.uvBuffer);
      gl.enableVertexAttribArray(this.programInfo.attribLocations.uvPosition);
      gl.vertexAttribPointer(this.programInfo.attribLocations.uvPosition, 2, gl.FLOAT, false, 0, 0);
    }

    if (this.buffer.normalBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.normalBuffer);
      gl.enableVertexAttribArray(this.programInfo.attribLocations.normalPosition);
      gl.vertexAttribPointer(this.programInfo.attribLocations.normalPosition, 3, gl.FLOAT, false, 0, 0);
    }

    gl.useProgram(this.programInfo.program);


    gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    gl.uniform1f(this.programInfo.uniformLocations.para1, this.shaderPara1)
    gl.uniform1f(this.programInfo.uniformLocations.time, data.time / 1000.0)
    gl.uniform4f(this.programInfo.uniformLocations.color, this.color.r, this.color.g, this.color.b, this.color.a)
    gl.uniform4f(this.programInfo.uniformLocations.colorB, this.colorB.r, this.colorB.g, this.colorB.b, this.colorB.a)
    gl.uniform4f(this.programInfo.uniformLocations.colorC, this.colorC.r, this.colorC.g, this.colorC.b, this.colorC.a)
    gl.uniform2f(this.programInfo.uniformLocations.pixelSize, data.pixelWorldSize[0], data.pixelWorldSize[1])
    gl.uniform3f(this.programInfo.uniformLocations.lightVector, data.lightVector[0], data.lightVector[1], data.lightVector[2])

    var textureLocations = this.programInfo.textureLocations;

    for (var i = 0; i < this.textureinfo.length; i++) {
      gl.uniform1i(textureLocations[i], i);
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, this.textureinfo[i].texture);
    }

    gl.depthMask(!this.transparency)

    if (this.depthTest) {
      gl.enable(gl.DEPTH_TEST)
    }
    else {
      gl.disable(gl.DEPTH_TEST)
    }

    {
      const offset = 0;
      const vertexCount = this.buffer.vertexCount;
      gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
    }
  }
}

export default drawableMesh;
