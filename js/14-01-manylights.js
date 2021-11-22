"use strict";

import * as cg from "./cg.js";
import * as m4 from "./glmjs/mat4.js";
import * as twgl from "./twgl-full.module.js";

async function main() {
  const inNumObjs = document.querySelector("#numobjs");
  const canvitas = document.querySelector("#canvitas");
  const gl = canvitas.getContext("webgl2");
  if (!gl) return undefined !== console.log("couldn't create webgl2 context");

  let aspect = 16.0 / 9.0;
  let deltaTime = 0;
  let lastTime = 0;

  let vertSrc = await cg.fetchText("glsl/14-01.vert");
  let fragSrc = await cg.fetchText("glsl/14-01.frag");
  const prgInf = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);

  const data = twgl.primitives.createPlaneVertices();
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
  const tex = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: [
      255, 255, 255, 255,
      192, 192, 192, 255,
      192, 192, 192, 255,
      255, 255, 255, 255,
    ],
  });

  // General stuff setup
  const cam = new cg.Cam([0, 0, 6], 15);
  const world = m4.create();
  const projection = m4.create();

  const coords = {
    u_world: world,
    u_projection: projection,
    u_view: cam.viewM4,
    diffuseMap: tex,
  };
  console.log(bufferInfo);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
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

    // coordinate system adjustments
    m4.identity(projection);
    m4.perspective(projection, cam.zoom, aspect, 0.1, 100);

    // drawing object 1
    gl.useProgram(prgInf.program);
    twgl.setUniforms(prgInf, coords);
    twgl.setBuffersAndAttributes(gl, prgInf, bufferInfo);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

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
    
  });
}

main();