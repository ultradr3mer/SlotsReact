interface IBufferInfo {
  vertexCount: number
  positionBuffer: WebGLBuffer
  uvBuffer: WebGLBuffer | null
  normalBuffer: WebGLBuffer | null
}

function createAndFillBuffer(gl: WebGLRenderingContext, data: number[]) {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return buffer;
}

export { IBufferInfo, createAndFillBuffer }
