import { initShaderInternal } from './shader';

function runArrowsShader(gl: WebGLRenderingContext) {
  // Vertex shader program
  const vsSource = `
  precision highp float;
  precision highp int;
  
  attribute vec4 aVertexPosition;
  attribute vec2 aUv;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying vec2 texCoordV;

  void main() {
    vec4 worldPos = uModelViewMatrix * aVertexPosition;

    worldPos.x += worldPos.x * pow(length(worldPos.y), 2.0) * 0.005;
    //worldPos.x += worldPos.x * (0.15 - pow(length(worldPos.y), 2.0) * 0.01);

    gl_Position = uProjectionMatrix * worldPos;
    texCoordV = aUv;
  }
`;

  // Fragment shader program
  const fsSource = `
  precision highp float;

  uniform vec4 uColor;
  uniform float para1;
  uniform float time;

  varying vec2 texCoordV;

  uniform sampler2D texture1;
  uniform sampler2D texture2;

  void main() {
    vec4 colorStop = texture2D(texture1, texCoordV);
    vec4 colorRun = texture2D(texture2, texCoordV + vec2(0.0, time * 0.1));
    colorRun.a *= min(max(texCoordV.y * 12.0 - 1.8, 0.0), 1.0) * 
    min(max((1.0 - texCoordV.y) * 2.0 - 0.6, 0.0), 1.0);
    gl_FragColor = colorStop * colorStop.a + colorRun * (1.0 - colorStop.a);

    if(length(vec2(0.5,0.0)-texCoordV) > para1)
    {
      gl_FragColor.a = 0.0;
    }
  }
`;

  return initShaderInternal(gl, vsSource, fsSource);
}

export default runArrowsShader