"using strict";

const wu = webglUtils;
const { mat4, vec3 } = glMatrix;

function createCube(gl, shader, side) {
  const v = new cg.MeshHelper(24, 9, 36);
  const pos = side / 2;
  const neg = -pos;
  //            x    y    z   r  g  b   nx   ny   nz
  v.addVertex([neg, pos, pos, 1, 0, 0, 0.0, 0.0, 1.0]); // 0
  v.addVertex([pos, pos, pos, 1, 0, 0, 0.0, 0.0, 1.0]); // 1
  v.addVertex([neg, neg, pos, 1, 0, 0, 0.0, 0.0, 1.0]); // 2
  v.addVertex([pos, neg, pos, 1, 0, 0, 0.0, 0.0, 1.0]); // 3
  v.addVertex([neg, pos, pos, 1, 0, 0, 0.0, 1.0, 0.0]); // 4
  v.addVertex([pos, pos, pos, 1, 0, 0, 0.0, 1.0, 0.0]); // 5
  v.addVertex([neg, pos, neg, 1, 0, 0, 0.0, 1.0, 0.0]); // 6
  v.addVertex([pos, pos, neg, 1, 0, 0, 0.0, 1.0, 0.0]); // 7
  v.addVertex([pos, pos, pos, 1, 0, 0, 1.0, 0.0, 0.0]); // 8
  v.addVertex([pos, pos, neg, 1, 0, 0, 1.0, 0.0, 0.0]); // 9
  v.addVertex([pos, neg, pos, 1, 0, 0, 1.0, 0.0, 0.0]); // 10
  v.addVertex([pos, neg, neg, 1, 0, 0, 1.0, 0.0, 0.0]); // 11
  v.addVertex([neg, neg, pos, 1, 0, 0, 0.0, -1.0, 0.0]); // 12
  v.addVertex([pos, neg, pos, 1, 0, 0, 0.0, -1.0, 0.0]); // 13
  v.addVertex([neg, neg, neg, 1, 0, 0, 0.0, -1.0, 0.0]); // 14
  v.addVertex([pos, neg, neg, 1, 0, 0, 0.0, -1.0, 0.0]); // 15
  v.addVertex([neg, pos, pos, 1, 0, 0, -1.0, 0.0, 0.0]); // 16
  v.addVertex([neg, pos, neg, 1, 0, 0, -1.0, 0.0, 0.0]); // 17
  v.addVertex([neg, neg, pos, 1, 0, 0, -1.0, 0.0, 0.0]); // 18
  v.addVertex([neg, neg, neg, 1, 0, 0, -1.0, 0.0, 0.0]); // 19
  v.addVertex([neg, pos, neg, 1, 0, 0, 0.0, 0.0, -1.0]); // 20
  v.addVertex([pos, pos, neg, 1, 0, 0, 0.0, 0.0, -1.0]); // 21
  v.addVertex([neg, neg, neg, 1, 0, 0, 0.0, 0.0, -1.0]); // 22
  v.addVertex([pos, neg, neg, 1, 0, 0, 0.0, 0.0, -1.0]); // 23

  v.addRect(0, 1, 2, 3);
  v.addRect(4, 5, 6, 7);
  v.addRect(8, 9, 10, 11);
  v.addRect(12, 13, 14, 15);
  v.addRect(16, 17, 18, 19);
  v.addRect(20, 21, 22, 23);

  const params = {
    attribs: [
      { name: "a_position", size: 3 },
      { name: "a_color", size: 3 },
      { name: "a_normal", size: 3 },
    ],
    vertices: v.vertices,
    indices: v.indices,
  };
  return new cg.Mesh(gl, shader, params);
}

async function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return undefined !== console.log("couldn't create webgl2 context");

  const vSrc = await fetch("glsl/09-01.vert").then((resp) => resp.text());
  const fSrc = await fetch("glsl/09-01.frag").then((resp) => resp.text());
  const shader = wu.createProgramFromSources(gl, [vSrc, fSrc]);

  const lsvSrc = await fetch("glsl/09-01-ls.vert").then((resp) => resp.text());
  const lsfSrc = await fetch("glsl/09-01-ls.frag").then((resp) => resp.text());
  const ls_shader = wu.createProgramFromSources(gl, [lsvSrc, lsfSrc]);

  const cam = new cg.Cam([0, 1.5, 4]);
  const cube = createCube(gl, shader, 1.0);
  const rotationAxis = new Float32Array([0, 1, 0]);
  const lightPosition = new Float32Array([-0.75, 0.0, 0.0]);
  const lightColor = new Float32Array([1, 1, 1]);

  let aspect = 1;
  let deltaTime = 0;
  let lastTime = 0;
  let theta = 0;

  const modelLoc = gl.getUniformLocation(shader, "u_world");
  const viewLoc = gl.getUniformLocation(shader, "u_view");
  const projectionLoc = gl.getUniformLocation(shader, "u_projection");
  const lightPosLoc = gl.getUniformLocation(shader, "u_light_position");
  const lightColorLoc = gl.getUniformLocation(shader, "u_light_color");

  const ls_modelLoc = gl.getUniformLocation(ls_shader, "u_world");
  const ls_viewLoc = gl.getUniformLocation(ls_shader, "u_view");
  const ls_projectionLoc = gl.getUniformLocation(ls_shader, "u_projection");

  const model = mat4.create();
  const projection = mat4.create();
  let wireframe = false;

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
    mat4.rotate(model, model, theta, rotationAxis);
    vec3.transformMat3(lightPosition, [1, 0, 0], model);

    mat4.identity(projection);

    mat4.perspective(projection, cam.zoom, aspect, 0.1, 100);

    gl.useProgram(shader);
    gl.uniformMatrix4fv(viewLoc, false, cam.viewM4);
    gl.uniformMatrix4fv(projectionLoc, false, projection);
    gl.uniform3fv(lightPosLoc, lightPosition);
    gl.uniform3fv(lightColorLoc, lightColor);

    mat4.identity(model);
    gl.uniformMatrix4fv(modelLoc, false, model);
    cube.draw(wireframe);

    gl.useProgram(ls_shader);
    gl.uniformMatrix4fv(ls_projectionLoc, false, projection);
    gl.uniformMatrix4fv(ls_viewLoc, false, cam.viewM4);
    mat4.identity(model);
    mat4.translate(model, model, lightPosition);
    mat4.scale(model, model, [0.1, 0.1, 0.1]);
    gl.uniformMatrix4fv(ls_modelLoc, false, model);
    cube.draw(wireframe);

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
