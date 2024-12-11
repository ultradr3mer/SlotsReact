import { initShaderInternal } from './shader';

function highlightsShader(gl: WebGLRenderingContext) {
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
      gl_Position.y -= gl_Position.z;
      gl_Position.x *= (1.0-gl_Position.z);
      
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
    uniform sampler2D texture2;
  
    uniform float time;
    uniform float para1;

    void main() {
      vec2 gradient = texture2D(texture1, texCoordV).rg;
      float mod = texture2D(texture2, worldPos.xy / 10.0 - vec2(0.2, 0.17) * time).r;
      gl_FragColor = color + vec4(1,1,1,1) * gradient.g;
      float mix = (gradient.r-0.5) * 2.0 + (mod-0.5) + (para1 * 2.0 - 2.0);
      gl_FragColor.a = (min(max(mix + 0.5, 0.0), 1.0) * 0.6 + gradient.g * 0.4) * para1 * color.a;
    }
  `;

  return initShaderInternal(gl, vsSource, fsSource);
}

export default highlightsShader;