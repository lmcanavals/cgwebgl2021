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

  const rotationAxis = new Float32Array([0.0, 1.0, 0.0]);

  const numObjs = 20;
  const numInstances = numObjs * numObjs * numObjs;
  const transforms = new Float32Array(numInstances * 16);
  const subarrays = new Array(numInstances);
  for (let i = 0; i < numInstances; i++) {
    subarrays[i] = {
      transform: transforms.subarray(i * 16, i * 16 + 16),
      rotationSpeed: Math.random() * 1.5,
    };
    m4.identity(subarrays[i].transform); // identity matrix
  }
  for (let i = 0; i < numObjs; i++) {
    for (let j = 0; j < numObjs; j++) {
      for (let k = 0; k < numObjs; k++) {
        const idx = i * numObjs * numObjs + j * numObjs + k;
        const position = [i - numObjs / 2, j - numObjs / 2, k - numObjs / 2];
        const scale = Math.random() * 0.2 + 0.05;
        m4.translate(
          subarrays[idx].transform,
          subarrays[idx].transform,
          position,
        );
        m4.scale(subarrays[idx].transform, subarrays[idx].transform, [
          scale,
          scale,
          scale,
        ]);
      }
    }
  }

  // Loading monito
  let vertSrc = await cg.fetchText("glsl/13-02.vert");
  let fragSrc = await cg.fetchText("glsl/13-02.frag");
  const objPrgInf = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);
  const obj = await cg.loadObj(
    "objects/cubito/cubito.obj",
    gl,
    objPrgInf,
    transforms,
  );

  // General stuff setup
  const cam = new cg.Cam([0, 0, 6], 25);

  let aspect = 16.0 / 9.0;
  let deltaTime = 0;
  let lastTime = 0;

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

    for (let i = 0; i < numInstances; i++) {
      m4.rotate(
        subarrays[i].transform,
        subarrays[i].transform,
        subarrays[i].rotationSpeed * deltaTime,
        [Math.random(), Math.random(), Math.random()],
      );
    }

    m4.identity(world);
    twgl.setUniforms(objPrgInf, coords);
    for (const { bufferInfo, vertexArrayInfo, vao } of obj) {
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_transform.buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, transforms);
      //twgl.setBuffersAndAttributes(gl, objPrgInf, vertexArrayInfo);
      twgl.drawBufferInfo(
        gl,
        vertexArrayInfo,
        gl.TRIANGLES,
        vertexArrayInfo.numElements,
        0,
        numInstances,
      );
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
  });
}

main();
