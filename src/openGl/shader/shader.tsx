interface IAttribLocations {
  vertexPosition: number;
  uvPosition: number;
  normalPosition: number;
}

interface IUniformLocations {
  projectionMatrix: WebGLUniformLocation | null;
  modelViewMatrix: WebGLUniformLocation | null;
  color: WebGLUniformLocation | null;
  colorB: WebGLUniformLocation | null;
  colorC: WebGLUniformLocation | null;
  para1: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  pixelSize: WebGLUniformLocation | null;
  lightVector: WebGLUniformLocation |null
}

interface IShaderInfo {
  program: WebGLProgram;
  attribLocations: IAttribLocations;
  uniformLocations: IUniformLocations;
  textureLocations: (WebGLUniformLocation | null)[];
}


function initShaderInternal(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  let info: IShaderInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      uvPosition: gl.getAttribLocation(shaderProgram, "aUv"),
      normalPosition: gl.getAttribLocation(shaderProgram, "normal")
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      color: gl.getUniformLocation(shaderProgram, "color"),
      colorB: gl.getUniformLocation(shaderProgram, "colorB"),
      colorC: gl.getUniformLocation(shaderProgram, "colorC"),
      para1: gl.getUniformLocation(shaderProgram, "para1"),
      time: gl.getUniformLocation(shaderProgram, "time"),
      pixelSize: gl.getUniformLocation(shaderProgram, "pixelSize"),
      lightVector: gl.getUniformLocation(shaderProgram, "lightVector"),
    },
    textureLocations: [
      gl.getUniformLocation(shaderProgram, "texture1"),
      gl.getUniformLocation(shaderProgram, "texture2"),
      gl.getUniformLocation(shaderProgram, "texture3"),
      gl.getUniformLocation(shaderProgram, "texture4")]
  }

  return info
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram: WebGLProgram = gl.createProgram()!;
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(
      "Unable to initialize the shader program: " +
      gl.getProgramInfoLog(shaderProgram)
    )
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    let info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader);
    throw new Error(
      "An error occurred compiling the shaders: " + info
    )
  }

  return shader;
}

export { initShaderProgram, loadShader, initShaderInternal, IShaderInfo }