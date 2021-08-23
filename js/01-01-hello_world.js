"use strict";

const srcVertex = `#version 300 es
in vec4 aPos;
void main() {
  gl_Position = aPos;
}`;

const srcFragment = `#version 300 es
precision highp float;
out vec4 color;
void main() {
  color = vec4(1.0, 0.5, 0.1, 1.0);
}`;

function loadShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Error compilando shader ${type}`);
    return null;
  }
  return shader;
}

function createProgram(gl) {
  const vertexShader = loadShader(gl, srcVertex, gl.VERTEX_SHADER);
  const fragmentShader = loadShader(gl, srcFragment, gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(`Error enlazando programa`);
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return;

  gl.canvas.width = gl.canvas.clientWidth;
  gl.canvas.height = gl.canvas.clientHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  const shader = createProgram(gl);
  const posLoc = gl.getAttribLocation(shader, "aPos");

  const vertices = new Float32Array([
    -0.5,
    -0.5,
    0.2,
    0.8,
    0.6,
    -0.35,
  ]);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posLoc);

  gl.clearColor(0.1, 0.2, 0.15, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(shader);
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

main();
