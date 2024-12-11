import { initShaderInternal } from './shader';

function groupOutlineShader(gl: WebGLRenderingContext) {
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
  
      worldPos.x += worldPos.x * pow(length(worldPos.y), 2.0) * 0.005;
      worldPos.x *= 1.01;
      //worldPos.x += worldPos.x * (0.15 - pow(length(worldPos.y), 2.0) * 0.01);
  
      gl_Position = uProjectionMatrix * worldPos;
      texCoordV = aUv;
    }
  `;

  // Fragment shader program
  const fsSource = `
    precision highp float;
    uniform vec4 color;
  
    varying vec2 texCoordV;
    varying vec4 worldPos;
    uniform sampler2D texture1;
  
    uniform float time;
    uniform float para1;

    void main() {
      vec2 gradient = texture2D(texture1, texCoordV).rg;
      gl_FragColor = color + vec4(1.0) * gradient.g;
      gl_FragColor.a = gradient.r * 0.25;
    }
  `;

  return initShaderInternal(gl, vsSource, fsSource);
}

export default groupOutlineShader;