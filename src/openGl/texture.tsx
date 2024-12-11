interface ITextureInfo {
  width: number,
  height: number,
  texture: WebGLTexture | null,
  url: string,
}

interface TextureOptions {
  repeat?: boolean
}

// creates a texture info { width: w, height: h, texture: tex }
// The texture will start with 1x1 pixels and be updated
// when the image has loaded
function loadImageAndCreateTextureInfo(gl: WebGLRenderingContext, url: string, options?: TextureOptions): ITextureInfo {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0]));

  var textureInfo = {
    width: 1,   // we don't know the size until it loads
    height: 1,
    texture: tex,
    url: url,
  };

  // let's assume all images are not a power of 2
  var glreapeatMode: number = gl.CLAMP_TO_EDGE
  if (options != undefined) {
    if (options.repeat == true) {
      glreapeatMode = gl.REPEAT
    }
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, glreapeatMode);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, glreapeatMode);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);


  var img = new Image();
  img.addEventListener('load', function () {
    textureInfo.width = img.width;
    textureInfo.height = img.height;

    gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  });
  img.src = url;

  return textureInfo;
}

export default loadImageAndCreateTextureInfo
export { ITextureInfo }