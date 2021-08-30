"using strict";

const wu = webglUtils;

function createRectangle(gl, shader) {
  const v = new cg.MeshHelper(4, 6, 4);
  const pos = 0.5;
  const neg = -0.5;
	//            x    y   z   r    g    b
  v.addVertex([neg, neg, 0, 0.8, 0.2, 0.3]);
  v.addVertex([pos, neg, 0, 0.3, 0.2, 0.8]);
  v.addVertex([neg, pos, 0, 0.2, 0.8, 0.3]);
  v.addVertex([pos, pos, 0, 0.8, 0.5, 0.1]);
  v.addRect(0, 1, 2, 3);

  const params = {
    attribs: [
      { name: "position", size: 3 },
      { name: "color", size: 3 },
    ],
    vertices: v.vertices,
    indices: v.indices,
  };
  return new cg.Mesh(gl, shader, params);
}

async function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return undefined !== console.log("couldn't create webgl2 context");

  const vertSrc = await fetch("glsl/03-01.vert").then((resp) => resp.text());
  const fragSrc = await fetch("glsl/03-01.frag").then((resp) => resp.text());
  const shader = wu.createProgramFromSources(gl, [vertSrc, fragSrc]);
  const mesh = createRectangle(gl, shader);

  function render() {
    if (wu.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shader);
    mesh.draw(shader);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
