"use strict";

function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return;

  gl.canvas.width = gl.canvas.clientWidth;
  gl.canvas.height = gl.canvas.clientHeight;
}

main();
