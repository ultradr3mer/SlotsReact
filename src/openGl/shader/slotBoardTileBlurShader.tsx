import { initShaderInternal } from './shader';

function slotBoardTileBlurShader(gl: WebGLRenderingContext) {
  // Vertex shader program
  const vsSource = `
  precision highp float;
  precision highp int;
  
  attribute vec4 aVertexPosition;
  attribute vec2 aUv;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform float para1;

  varying vec2 texCoordV;
  varying vec4 worldPos;
  varying float para1V;

  void main() {
    worldPos = uModelViewMatrix * aVertexPosition;

    worldPos.x += worldPos.x * pow(length(worldPos.y), 2.0) * 0.007;
    //worldPos.x += worldPos.x * (0.15 - pow(length(worldPos.y), 2.0) * 0.01);

    gl_Position = uProjectionMatrix * worldPos;
    texCoordV = aUv;
    para1V = para1;
  }
`;

  // Fragment shader program
  const fsSource = `
  precision highp float;


  varying float para1V;
  varying vec2 texCoordV;
  varying vec4 worldPos;
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform vec4 color;
  uniform vec4 colorB;

  void main() {
    float alphaA = pow(min(max(13.0 - abs(worldPos.y) * 4.0, 0.0), 1.0), 2.0);
    float alphaB = pow(min(max(6.77 - abs(worldPos.y) * 1.7, 0.0), 1.0), 2.0);

    vec4 texColor = texture2D(texture1, texCoordV);
    vec2 smallerTextureMapping = (texCoordV - 0.5) * 1.7 + 0.5;
    vec4 iconColor = texture2D(texture2, smallerTextureMapping);

    gl_FragColor.rgba = alphaA * color * (texColor.r * 0.8 + 0.2);
    gl_FragColor.rgba += (1.0 - alphaA) * (colorB.rgba * texColor.g) * alphaB;
    gl_FragColor.rgba = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;

  return initShaderInternal(gl, vsSource, fsSource);
}

export default slotBoardTileBlurShader;