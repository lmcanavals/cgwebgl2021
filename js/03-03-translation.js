"using strict";

const wu = webglUtils;
const mat4 = glMatrix.mat4;

function createRectangle(gl, shader) {
  const v = new cg.MeshHelper(4, 6, 4);
  const pos = 0.2;
  const neg = -0.2;
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

  const vertSrc = await fetch("glsl/03-02.vert").then((resp) => resp.text());
  const fragSrc = await fetch("glsl/03-02.frag").then((resp) => resp.text());
  const shader = wu.createProgramFromSources(gl, [vertSrc, fragSrc]);
  const mesh = createRectangle(gl, shader);
  const transform = mat4.create();
  const tfactors = new Float32Array([0, 0, 0]);

  const transformLoc = gl.getUniformLocation(shader, "transform");

  let cont = 0;
  function render(elapsedTime) {
    elapsedTime *= 1e-3;

    if (wu.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    tfactors[0] = Math.sin(elapsedTime) * 0.6;
    tfactors[1] = Math.cos(elapsedTime) * 0.6;
    mat4.identity(transform);
    mat4.translate(transform, transform, tfactors);
    if (cont++ % 1000 == 0) console.log(transform);

    gl.useProgram(shader);
    gl.uniformMatrix4fv(transformLoc, false, transform);
    mesh.draw(shader);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
