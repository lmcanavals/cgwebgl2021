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
  const vertfn = "glsl/10-01.vert";
  const fragfn = "glsl/10-01.frag";
  const objfn = "objects/monito/monito.obj";

  const vertSrc = await fetch(vertfn).then((resp) => resp.text());
  const fragSrc = await fetch(fragfn).then((resp) => resp.text());
  const objText = await fetch(objfn).then((resp) => resp.text());

  const meshProgramInfo = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);

  const obj = cg.parseObj(objText);

  const baseHref = new URL(objfn, window.location.href);
  const matTexts = await Promise.all(obj.materialLibs.map(async (filename) => {
    const matHref = new URL(filename, baseHref).href;
    const response = await fetch(matHref);
    return await response.text();
  }));
  const materials = cg.parseMtl(matTexts.join("\n"));
  const parts = obj.geometries.map(({ material, data }) => {
    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
    const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);
    return {
      material: materials[material],
      bufferInfo,
      vao,
    };
  });

  // loading light source cube
  const lsvertfn = "glsl/09-01-ls.vert";
  const lsfragfn = "glsl/09-01-ls.frag";
  const lsfn = "objects/cubito/cubito.obj";

  const lsvertSrc = await fetch(lsvertfn).then((resp) => resp.text());
  const lsfragSrc = await fetch(lsfragfn).then((resp) => resp.text());
  const lsText = await fetch(lsfn).then((resp) => resp.text());

  const lsProgramInfo = twgl.createProgramInfo(gl, [lsvertSrc, lsfragSrc]);

  const lsCube = cg.parseObj(lsText);
  const lsParts = lsCube.geometries.map(({ data }) => {
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
    const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);
    return {
      bufferInfo,
      vao,
    };
  });

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
  };
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
    m4.translate(uniforms.u_world, uniforms.u_world, [1.75, 0, 0]);
    v3.transformMat4(uniforms.u_light_position, origin, uniforms.u_world);

    // coordinate system adjustments
    m4.identity(uniforms.u_projection);
    m4.perspective(uniforms.u_projection, cam.zoom, aspect, 0.1, 100);
    m4.identity(uniforms.u_world);

    // drawing monito
    gl.useProgram(meshProgramInfo.program);
    twgl.setUniforms(meshProgramInfo, uniforms);

    for (const { bufferInfo, vao } of parts) {
      gl.bindVertexArray(vao);
      twgl.drawBufferInfo(gl, bufferInfo);
    }

    // logic to move the visual representation of the light source
    m4.identity(uniforms.u_world);
    m4.translate(
      uniforms.u_world,
      uniforms.u_world,
      uniforms.u_light_position,
    );
    m4.scale(uniforms.u_world, uniforms.u_world, [0.05, 0.05, 0.05]);

    // drawing the light source cube
    gl.useProgram(lsProgramInfo.program);
    twgl.setUniforms(lsProgramInfo, uniforms);

    for (const { bufferInfo, vao } of lsParts) {
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
