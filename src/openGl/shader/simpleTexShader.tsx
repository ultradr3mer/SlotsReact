import { initShaderInternal } from './shader';

function simpleTexShader(gl: WebGLRenderingContext) {
  // Vertex shader program
  const vsSource = `
  precision highp float;
  precision highp int;
  
  attribute vec4 aVertexPosition;
  attribute vec2 aUv;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  varying vec4 worldPos;

  varying vec2 texCoordV;

  void main() {
    worldPos = uModelViewMatrix * aVertexPosition;
  
    worldPos.x += worldPos.x * pow(length(worldPos.y), 2.0) * 0.007;
    //worldPos.x += worldPos.x * (0.15 - pow(length(worldPos.y), 2.0) * 0.01);

    gl_Position = uProjectionMatrix * worldPos;
    gl_Position.y -= gl_Position.z;
    gl_Position.x *= (1.0-gl_Position.z);

    texCoordV = aUv;
  }
`;

  // Fragment shader program
  const fsSource = `
  precision highp float;

  uniform vec4 color;
  uniform sampler2D texture1;

  varying vec2 texCoordV;
  varying vec4 worldPos;


  void main() {
      float alphaA = pow(min(max(13.0 - abs(worldPos.y) * 4.0, 0.0), 1.0), 2.0);

    gl_FragColor = texture2D(texture1, texCoordV) * color * alphaA;
  }
`;

  return initShaderInternal(gl, vsSource, fsSource);
}

export default simpleTexShader