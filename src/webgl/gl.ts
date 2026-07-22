/** WebGL2の低レベルヘルパー。コンポーネントからは直接呼ばない(フック経由) */

export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // 失敗時はコンソールに整形済みログを出して null(呼び出し側でフォールバック)
    console.error('shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertSource: string,
  fragSource: string,
): WebGLProgram | null {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSource)
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSource)
  if (!vert || !frag) {
    if (vert) gl.deleteShader(vert)
    if (frag) gl.deleteShader(frag)
    return null
  }
  const program = gl.createProgram()
  if (!program) {
    gl.deleteShader(vert)
    gl.deleteShader(frag)
    return null
  }
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

/**
 * フルスクリーントライアングルを描く準備。
 * 頂点シェーダーは gl_VertexID から座標を作るため VBO は不要(VAOだけ束ねる)。
 */
export function createFullscreenVao(
  gl: WebGL2RenderingContext,
): WebGLVertexArrayObject | null {
  return gl.createVertexArray()
}

export function drawFullscreen(
  gl: WebGL2RenderingContext,
  vao: WebGLVertexArrayObject,
): void {
  gl.bindVertexArray(vao)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.bindVertexArray(null)
}
