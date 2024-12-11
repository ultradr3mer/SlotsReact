import { initShaderInternal } from './shader';

function explosionShader(gl: WebGLRenderingContext) {
  // Vertex shader program
  const vsSource = `
  precision highp float;
  precision highp int;
  
  attribute vec4 aVertexPosition;
  attribute vec2 aUv;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying vec2 texCoordV;
  varying vec4 worldPos;

  void main() {
    worldPos = uModelViewMatrix * aVertexPosition;
    gl_Position = uProjectionMatrix * worldPos;

    texCoordV = aUv;
  }
`;

  // Fragment shader program
  const fsSource = `
  precision highp float;

  uniform vec4 color;
  uniform float para1;

  varying vec2 texCoordV;
  varying vec4 worldPos;

  uniform sampler2D texture1;

  void main() {
    vec2 texCoord = (texCoordV + worldPos.xy * vec2(0.1)) * (2.0 - para1) * 0.3;
    float gradient = 1.0 - texture2D(texture1, texCoord).r;
    gl_FragColor = color;
    gl_FragColor.a = 0.6;
    float outerFade = min(para1,0.5) - length(texCoordV-vec2(0.5, 0.5)) * 1.2;
    outerFade += (gradient - 0.5) * 0.1;
    gl_FragColor += vec4(0.5) * min(max((0.2 - outerFade) * 10.0, 0.0), 1.0);
    float innerFade = length(texCoordV-vec2(0.5, 0.5)) - min(para1-0.5,0.5) * 1.2 + (gradient - 0.5) * 0.1;
    gl_FragColor.a *= min(max(outerFade * 50.0, 0.0), 1.0) *
                    min(max(innerFade * 50.0, 0.0), 1.0);
  }
`;

  return initShaderInternal(gl, vsSource, fsSource);
}

export default explosionShader