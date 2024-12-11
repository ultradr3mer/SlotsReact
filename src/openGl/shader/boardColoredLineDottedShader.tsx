import { initShaderInternal } from './shader';

function boardColoredLineDottedShader(gl: WebGLRenderingContext) {
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
      texCoordV = aUv;
    }
  `;
  
    // Fragment shader program
    const fsSource = `
    precision highp float;
  
    varying vec2 texCoordV;
    varying vec4 worldPos;
    uniform vec4 color;
    uniform vec2 pixelSize;

    void main() {
      float alphaB = pow(min(max(5.77 - abs(worldPos.y) * 1.5, 0.0), 1.0), 2.0);

      float pixel = worldPos.y / pixelSize.y;
      float doted = (fract(pixel / 64.0) > 0.5) ? 1.0 : 0.0;

      gl_FragColor = alphaB * color;
      gl_FragColor.a *= doted;
    }
  `;

  return initShaderInternal(gl, vsSource, fsSource);
}

export default boardColoredLineDottedShader