"using strict";

const wu = webglUtils;
const mat4 = glMatrix.mat4;

function createSurface(gl, shader, side) {
  const numV = (side + 1) * (side + 1);
  const v = new cg.MeshHelper(numV, 6, side * side * 6);

  for (let i = 0; i < side + 1; ++i) {
    v.addVertex([i / 10, 0, 0, 1, 0, 0]);
  }
  for (let i = 0; i < side; ++i) {
    v.addVertex([0, 0, i / 10, 1, 0, 0]);
    for (let j = 0; j < side; ++j) {
      v.addVertex([j / 10, 0, i / 10, Math.sin(i / 10) / 2 + 0.5, 0, 0]);
    }
  }

  const ts = side + 1;
  for (let i = 0; i < side; ++i) {
    for (let j = 0; j < side; ++j) {
      v.addRect(
        i * ts + j,
        i * ts + j + 1,
        (i + 1) * ts + j,
        (i + 1) * ts + j + 1,
      );
    }
  }

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

	let wireframe = false;
  const vertSrc = await fetch("glsl/07-01.vert").then((resp) => resp.text());
  const fragSrc = await fetch("glsl/07-01.frag").then((resp) => resp.text());
  const shader = wu.createProgramFromSources(gl, [vertSrc, fragSrc]);

  const cam = new cg.Cam([0, 1.5, 6]);
  const mesh = createSurface(gl, shader, 100);
  const rotationAxis = new Float32Array([1, 1, 1]);

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

    mat4.identity(projection);

    mat4.perspective(projection, cam.zoom, aspect, 0.1, 100);

    gl.useProgram(shader);
    gl.uniformMatrix4fv(viewLoc, false, cam.viewM4);
    gl.uniformMatrix4fv(projectionLoc, false, projection);

    mat4.identity(model);
    //mat4.rotate(model, model, theta, rotationAxis);
    gl.uniformMatrix4fv(modelLoc, false, model);
    mesh.draw(wireframe);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  document.addEventListener("keydown", (e) => {
    /**/ if (e.key === "w") cam.processKeyboard(cg.FORWARD, deltaTime);
    else if (e.key === "a") cam.processKeyboard(cg.LEFT, deltaTime);
    else if (e.key === "s") cam.processKeyboard(cg.BACKWARD, deltaTime);
    else if (e.key === "d") cam.processKeyboard(cg.RIGHT, deltaTime);
    else if (e.key === "e") wireframe = !wireframe;
  });
  document.addEventListener("mousemove", (e) => cam.movePov(e.x, e.y));
  document.addEventListener("mousedown", (e) => cam.startMove(e.x, e.y));
  document.addEventListener("mouseup", () => cam.stopMove());
  document.addEventListener("wheel", (e) => cam.processScroll(e.deltaY));
}

main();
