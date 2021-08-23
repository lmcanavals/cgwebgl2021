"using strict";

const wu = webglUtils;

function createRectangle(gl, shader) {
  const v = new cg.MeshHelper(8, 2, 6 * 2);
	const pos = 0.5;
	const neg = -0.5;
  v.addVertex([neg, neg]);
  v.addVertex([pos, neg]);
  v.addVertex([neg, pos]);
  v.addVertex([pos, pos]);
  v.addRect(0, 1, 2, 3);

  const params = {
    attribs: [
      { name: "position", size: 2 },
    ],
    vertices: v.vertices,
    indices: v.indices,
  };
  return new cg.Mesh(gl, shader, params);
}

async function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return undefined !== console.log("couldn't create webgl2 context");

  const vertSrc = await fetch("glsl/02-01.vert").then((resp) => resp.text());
  const fragSrc = await fetch("glsl/02-01.frag").then((resp) => resp.text());
  const shader = wu.createProgramFromSources(gl, [vertSrc, fragSrc]);
  const mesh = createRectangle(gl, shader);

  if (wu.resizeCanvasToDisplaySize(gl.canvas)) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
  gl.clearColor(0.1, 0.1, 0.1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(shader);
  mesh.draw(shader);
}

main();
