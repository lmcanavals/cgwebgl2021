"using strict";

const wu = webglUtils;
const mat4 = glMatrix.mat4;

function createCube(gl, shader, side) {
  const v = new cg.MeshHelper(8, 6, 36);
  const pos = side;
  const neg = -side;
  //            x    y   z   r    g    b
  v.addVertex([neg, neg, pos, 0.8, 0.2, 0.3]); // ii
  v.addVertex([pos, neg, pos, 0.3, 0.2, 0.8]); // id
  v.addVertex([neg, pos, pos, 0.2, 0.8, 0.3]); // si
  v.addVertex([pos, pos, pos, 0.8, 0.5, 0.1]); // sd
  v.addVertex([neg, neg, neg, 0.8, 0.2, 0.3]); // ii
  v.addVertex([pos, neg, neg, 0.3, 0.2, 0.8]); // id
  v.addVertex([neg, pos, neg, 0.2, 0.8, 0.3]); // si
  v.addVertex([pos, pos, neg, 0.8, 0.5, 0.1]); // sd
  v.addRect(0, 1, 2, 3);
  v.addRect(4, 5, 6, 7);
  v.addRect(0, 1, 4, 5);
  v.addRect(2, 3, 6, 7);
  v.addRect(1, 3, 5, 7);
  v.addRect(0, 2, 4, 6);

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

  const vertSrc = await fetch("glsl/03-06.vert").then((resp) => resp.text());
  const fragSrc = await fetch("glsl/03-06.frag").then((resp) => resp.text());
  const shader = wu.createProgramFromSources(gl, [vertSrc, fragSrc]);
  const mesh = createCube(gl, shader, 0.1);
  const tfactors = new Float32Array([1, 0, 1]);
  const rotationAxis = new Float32Array([0, 1, 0]);
  const viewMatrix = new Float32Array([0, 0, -6]);

  let aspect = 1;
  let theta = 0;
  let fov = 0.5;

  const modelLoc = gl.getUniformLocation(shader, "model");
  const viewLoc = gl.getUniformLocation(shader, "view");
  const projectionLoc = gl.getUniformLocation(shader, "projection");

  const model = mat4.create();
  const view = mat4.create();
  const projection = mat4.create();
  f;
  gl.enable(gl.DEPTH_TEST);

  function render(elapsedTime) {
    elapsedTime *= 1e-3;

    if (wu.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      aspect = gl.canvas.width / gl.canvas.height;
    }
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta = elapsedTime;

    mat4.identity(model);
    mat4.identity(view);
    mat4.identity(projection);
    mat4.rotate(model, model, theta, rotationAxis);
    mat4.translate(model, model, tfactors);

    mat4.translate(view, view, viewMatrix);
    mat4.perspective(projection, fov, aspect, 0.1, 100);

    gl.useProgram(shader);
    gl.uniformMatrix4fv(modelLoc, false, model);
    gl.uniformMatrix4fv(viewLoc, false, view);
    gl.uniformMatrix4fv(projectionLoc, false, projection);
    mesh.draw(shader);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
