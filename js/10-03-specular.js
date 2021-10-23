"using strict";

import * as cg from "./cg.js";
import * as v3 from "./glmjs/vec3.js";
import * as v4 from "./glmjs/vec4.js";
import * as m4 from "./glmjs/mat4.js";
import * as twgl from "./twgl-full.module.js";

async function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return undefined !== console.log("couldn't create webgl2 context");

  twgl.setDefaults({ attribPrefix: "a_" });

  // Loading monito
  const vertSrc = await cg.fetchText("glsl/10-03.vert");
  const fragSrc = await cg.fetchText("glsl/10-03.frag");
  const apePrgInf = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);
  const ape = await cg.loadObj("objects/blueape/blueape.obj", gl, apePrgInf);

  // loading light source cube
  const lsvertSrc = await cg.fetchText("glsl/09-01-ls.vert");
  const lsfragSrc = await cg.fetchText("glsl/09-01-ls.frag");
  const lsPrgInf = twgl.createProgramInfo(gl, [lsvertSrc, lsfragSrc]);
  const lightbulb = await cg.loadObj("objects/cubito/cubito.obj", gl, lsPrgInf);

  // General stuff setup
  const cam = new cg.Cam([0, 1.5, 6]);
  const rotationAxis = new Float32Array([0, 1, 0]);

  let aspect = 16.0 / 9.0;
  let deltaTime = 0;
  let lastTime = 0;
  let theta = 0;

  const uniforms = {
    u_world: m4.create(),
    u_projection: m4.create(),
    u_view: cam.viewM4,
    u_light_position: v3.create(),
    u_light_color: v3.fromValues(1, 1, 1),
    u_view_position: cam.pos,
  };

  // some preloaded arrays to optimize memory usage
  const scale = v3.create();
  const one = v3.fromValues(1, 1, 1);
  const initial_light_pos = v3.fromValues(1.75, 0, 0);
  const origin = v4.fromValues(0, 0, 0);

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

    // some logic to move the light around
    theta = elapsedTime;
    m4.identity(uniforms.u_world);
    m4.rotate(uniforms.u_world, uniforms.u_world, theta, rotationAxis);
    m4.translate(uniforms.u_world, uniforms.u_world, initial_light_pos);
    v3.transformMat4(uniforms.u_light_position, origin, uniforms.u_world);

    // coordinate system adjustments
    m4.identity(uniforms.u_projection);
    m4.perspective(uniforms.u_projection, cam.zoom, aspect, 0.1, 100);
    m4.identity(uniforms.u_world);
    v3.scale(scale, one, 10);
    m4.scale(uniforms.u_world, uniforms.u_world, scale);

    // drawing monito
    gl.useProgram(apePrgInf.program);
    twgl.setUniforms(apePrgInf, uniforms);

    for (const { bufferInfo, vao, material } of ape) {
      gl.bindVertexArray(vao);
      twgl.setUniforms(apePrgInf, {}, material);
      twgl.drawBufferInfo(gl, bufferInfo);
    }

    // logic to move the visual representation of the light source
    m4.identity(uniforms.u_world);
    m4.translate(
      uniforms.u_world,
      uniforms.u_world,
      uniforms.u_light_position,
    );
    v3.scale(scale, one, 0.025);
    m4.scale(uniforms.u_world, uniforms.u_world, scale);

    // drawing the light source cube
    gl.useProgram(lsPrgInf.program);
    twgl.setUniforms(lsPrgInf, uniforms);

    for (const { bufferInfo, vao } of lightbulb) {
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
  });
  document.addEventListener("mousemove", (e) => cam.movePov(e.x, e.y));
  document.addEventListener("mousedown", (e) => cam.startMove(e.x, e.y));
  document.addEventListener("mouseup", () => cam.stopMove());
  document.addEventListener("wheel", (e) => cam.processScroll(e.deltaY));
}

main();
