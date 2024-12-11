import { initShaderInternal } from './shader';

function boardJustColorShader(gl: WebGLRenderingContext) {
    // Vertex shader program
    const vsSource = `
    precision highp float;
    precision highp int;
    
    attribute vec4 aVertexPosition;
    attribute vec2 aUv;
    attribute vec3 normal;
  
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform vec3 lightVector;
  
    varying vec2 texCoordV;
    varying vec4 worldPos;
    varying float lightingV;
  
    void main() {
      worldPos = uModelViewMatrix * aVertexPosition;
      vec4 worldNormal = normalize(uModelViewMatrix * vec4(normal, 0.0));
  
      worldPos.x += worldPos.x * pow(length(worldPos.y), 2.0) * 0.007;
      //worldPos.x += worldPos.x * (0.15 - pow(length(worldPos.y), 2.0) * 0.01);
  
      gl_Position = uProjectionMatrix * worldPos;
      gl_Position.y -= gl_Position.z;
      gl_Position.x *= (1.0-gl_Position.z);
      texCoordV = aUv;

      lightingV = dot(worldNormal.xyz, lightVector);
    }
  `;
  
    // Fragment shader program
    const fsSource = `
    precision highp float;
  
    varying vec2 texCoordV;
    varying vec4 worldPos;
    varying vec3 normalV;

    uniform vec4 color;
    uniform float para1;
    varying float lightingV;

    void main() {
      float alphaB = pow(min(max(5.77 - abs(worldPos.y) * 1.5, 0.0), 1.0), 2.0);

      gl_FragColor = color;
      gl_FragColor.rgb *= lightingV * 1.6;
      gl_FragColor.a *= alphaB;
    }
  `;

  return initShaderInternal(gl, vsSource, fsSource);
}

export default boardJustColorShader