"using strict";

const wu = webglUtils;
const mat4 = glMatrix.mat4;

function createCube(gl, shader, side) {
  const v = new cg.MeshHelper(8, 6, 36);
  const pos = side / 2;
  const neg = -pos;
  //            x    y    z    r    g    b
  v.addVertex([neg, neg, pos, 0, 0, 1]);
  v.addVertex([pos, neg, pos, 1, 0, 1]);
  v.addVertex([neg, pos, pos, 0, 1, 1]);
  v.addVertex([pos, pos, pos, 1, 1, 1]);
  v.addVertex([neg, neg, neg, 0, 0, 0]);
  v.addVertex([pos, neg, neg, 1, 0, 0]);
  v.addVertex([neg, pos, neg, 0, 1, 0]);
  v.addVertex([pos, pos, neg, 1, 1, 0]);
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

  const vertSrc = await fetch("glsl/04-01.vert").then((resp) => resp.text());
  const fragSrc = await fetch("glsl/04-01.frag").then((resp) => resp.text());
  const shader = wu.createProgramFromSources(gl, [vertSrc, fragSrc]);

  const cam = new cg.Cam([0, 0, 4]);
  const mesh = createCube(gl, shader, 0.1);
  const tfactors = new Float32Array([1, 0, 1]);
  const rotationAxis = new Float32Array([0, 1, 0]);

  let aspect = 1;
  let deltaTime = 0;
  let lastTime = 0;
  let theta = 0;

  const modelLoc = gl.getUniformLocation(shader, "model");
  const viewLoc = gl.getUniformLocation(shader, "view");
  const projectionLoc = gl.getUniformLocation(shader, "projection");

  const model = mat4.create();
  const projection = mat4.create();

  gl.enable(gl.DEPTH_TEST);

  function render(elapsedTime) {
    elapsedTime *= 1e-3;
    deltaTime = elapsedTime - lastTime;
    lastTime = elapsedTime;

    if (wu.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      aspect = gl.canvas.width / gl.canvas.height;
    }
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta = elapsedTime;

    mat4.identity(model);
    mat4.identity(projection);
    mat4.rotate(model, model, theta, rotationAxis);
    mat4.translate(model, model, tfactors);

    mat4.perspective(projection, cam.zoom, aspect, 0.1, 100);

    gl.useProgram(shader);
    gl.uniformMatrix4fv(modelLoc, false, model);
    gl.uniformMatrix4fv(viewLoc, false, cam.viewM4);
    gl.uniformMatrix4fv(projectionLoc, false, projection);
    mesh.draw(shader);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  document.addEventListener("keydown", (e) => {
    /**/ if (e.key === "w") cam.processKeyboard(cg.FORWARD, deltaTime);
    else if (e.key === "a") cam.processKeyboard(cg.LEFT, deltaTime);
    else if (e.key === "s") cam.processKeyboard(cg.BACKWARD, deltaTime);
    else if (e.key === "d") cam.processKeyboard(cg.RIGHT, deltaTime);
  });
}

main();
