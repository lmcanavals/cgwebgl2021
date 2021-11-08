"using strict";

import * as cg from "./cg.js";
import * as m4 from "./glmjs/mat4.js";
import * as twgl from "./twgl-full.module.js";

async function main() {
  const inNumObjs = document.querySelector("#numobjs");
  const canvitas = document.querySelector("#canvitas");
  const gl = canvitas.getContext("webgl2");
  if (!gl) return undefined !== console.log("couldn't create webgl2 context");

  let autorotate = true;

  twgl.setDefaults({ attribPrefix: "a_" });

  // Loading monito
  let vertSrc = await cg.fetchText("glsl/13-01.vert");
  let fragSrc = await cg.fetchText("glsl/13-01.frag");
  const objPrgInf = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);
  const obj = await cg.loadObj("objects/cubito/cubito.obj", gl, objPrgInf);

  // General stuff setup
  const cam = new cg.Cam([0, 0, 6], 25);

  let aspect = 16.0 / 9.0;
  let deltaTime = 0;
  let lastTime = 0;
  //let theta = 0;

  const world = m4.create();
  const projection = m4.create();

  const coords = {
    u_world: world,
    u_projection: projection,
    u_view: cam.viewM4,
  };

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  // Render awesome
  function render(elapsedTime) {
    // handling time in seconds maybe
    elapsedTime *= 1e-3;
    deltaTime = elapsedTime - lastTime;
    lastTime = elapsedTime;

    // resizing stuff and general preparation
    if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      aspect = gl.canvas.width / gl.canvas.height;
    }
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // coordinate system adjustments
    m4.identity(projection);
    m4.perspective(projection, cam.zoom, aspect, 0.1, 100);

    // drawing object 1
    gl.useProgram(objPrgInf.program);

    m4.identity(world);
    twgl.setUniforms(objPrgInf, coords);
    for (const { bufferInfo, vao } of obj) {
      gl.bindVertexArray(vao);
      twgl.drawBufferInfo(gl, bufferInfo);
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  document.addEventListener("keydown", (e) => {
    /**/ if (e.key === "w") cam.processKeyboard(cg.FORWARD, deltaTime);
    else if (e.key === "a") cam.processKeyboard(cg.LEFT, deltaTime);
    else if (e.key === "s") cam.processKeyboard(cg.BACKWARD, deltaTime);
    else if (e.key === "d") cam.processKeyboard(cg.RIGHT, deltaTime);
    else if (e.key === "r") autorotate = !autorotate;
  });
  canvitas.addEventListener("mousemove", (e) => cam.movePov(e.x, e.y));
  canvitas.addEventListener("mousedown", (e) => cam.startMove(e.x, e.y));
  canvitas.addEventListener("mouseup", () => cam.stopMove());
  canvitas.addEventListener("wheel", (e) => cam.processScroll(e.deltaY));
  inNumObjs.addEventListener("change", () => {
    //numObjs = parseInt(inNumObjs.value);
  });
}

main();
