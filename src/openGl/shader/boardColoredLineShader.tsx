import { initShaderInternal } from './shader';

function boardColoredLineShader(gl: WebGLRenderingContext) {
    // Vertex shader program
    const vsSource = `
    precision highp float;
    precision highp int;
    
    attribute vec4 aVertexPosition;
    attribute vec2 aUv;
    attribute vec2 normal;
  
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
  
    varying vec2 texCoordV;
    varying vec4 worldPos;
    uniform vec2 pixelSize;
  
    void main() {
      vec4 localPosition = aVertexPosition;
      localPosition.xy += normal*pixelSize;
      worldPos = uModelViewMatrix * localPosition;
  
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
  
    varying vec2 texCoordV;
    varying vec4 worldPos;
    uniform vec4 color;
    uniform vec4 colorB;

    void main() {
      float alphaA = pow(min(max(13.0 - abs(worldPos.y) * 4.0, 0.0), 1.0), 2.0);
      float alphaB = pow(min(max(5.77 - abs(worldPos.y) * 1.5, 0.0), 1.0), 2.0);

      gl_FragColor = alphaA * color + (1.0 - alphaA) * colorB;
      gl_FragColor.a *= alphaB;
    }
  `;

  return initShaderInternal(gl, vsSource, fsSource);
}

export default boardColoredLineShader