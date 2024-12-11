import { initShaderInternal } from './shader';

function slotBoardTwoShader(gl: WebGLRenderingContext) {
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


  varying vec2 texCoordV;
  varying vec4 worldPos;
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform sampler2D texture3;
  uniform vec4 color;
  uniform vec4 colorB;
  uniform vec4 colorC;
  uniform float para1;

  void main() {
    float alphaA = pow(min(max(13.0 - abs(worldPos.y) * 4.0, 0.0), 1.0), 2.0);
    float alphaB = pow(min(max(6.77 - abs(worldPos.y) * 1.7, 0.0), 1.0), 2.0);

    vec2 texCoordIconShrik = texCoordV;
    texCoordIconShrik = (texCoordIconShrik - 0.5) * vec2(1.35) + 0.5;
    vec2 texCoordIconAspect = (texCoordIconShrik - 0.5) * vec2(1.0,1.5) + 0.5;

    vec4 iconBlur = texture2D(texture2, texCoordIconShrik);
    vec4 texColor = texture2D(texture3, texCoordV);
    vec4 tileBlur = vec4(vec3(texColor.r * color.rgb * 1.2), texColor.g*alphaA);
    tileBlur.rgb = tileBlur.rgb * (1.0 - texColor.b) + colorC.rgb * texColor.b;
    
    float tilePreBlurMix = min(1.0, para1 * 2.0);
    vec4 preBlur = tileBlur;
    preBlur.a *= tilePreBlurMix;
    vec4 iconSharp = texture2D(texture1, texCoordIconAspect);
    vec4 outline = colorC * max((1.0 - abs(0.5 - iconSharp.a) * 2.0), 0.0);
    iconSharp.a = min(iconSharp.a * 2.0, 1.0);
    iconSharp.rgb += outline.rgb;
    preBlur = (preBlur * (1.0 - iconSharp.a) + iconSharp * iconSharp.a) * alphaA;

    tileBlur = (tileBlur * (1.0 - iconBlur.a) + iconBlur * iconBlur.a) * alphaA;
    tileBlur += (1.0 - alphaA) * vec4(colorB.rgb, texColor.g*0.15 + texColor.b*0.2);

    float mix = para1;
    gl_FragColor = (1.0 - mix) * preBlur  + mix * tileBlur;

    gl_FragColor *= alphaB;
  }
`;

  return initShaderInternal(gl, vsSource, fsSource);
}

export default slotBoardTwoShader;