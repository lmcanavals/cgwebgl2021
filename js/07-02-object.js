"using strict";

const { vec3, mat4 } = glMatrix;

async function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return undefined !== console.log("couldn't create webgl2 context");

  const vertfn = "glsl/07-02.vert";
  const fragfn = "glsl/07-02.frag";
  const objfn = "objects/cubito/cubito.obj";

  twgl.setAttributePrefix("a_");

  const vertSrc = await fetch(vertfn).then((resp) => resp.text());
  const fragSrc = await fetch(fragfn).then((resp) => resp.text());
  const text = await fetch(objfn).then((resp) => resp.text());

  const meshProgramInfo = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);
  const obj = cg.parseObj(text);
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

  function getExtents(positions) {
    const min = positions.slice(0, 3);
    const max = positions.slice(0, 3);
    for (let i = 3; i < positions.length; i += 3) {
      for (let j = 0; j < 3; ++j) {
        const v = positions[i + j];
        min[j] = Math.min(v, min[j]);
        max[j] = Math.max(v, min[j]);
      }
    }
    return { min, max };
  }

  function getGeometriesExtents(geometries) {
    return geometries.reduce(({ min, max }, { data }) => {
      const minMax = getExtents(data.position);
      return {
        min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
        max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
      };
    }, {
      min: Array(3).fill(Number.POSITIVE_INFINITY),
      max: Array(3).fill(Number.NEGATIVE_INFINITY),
    });
  }

  const extents = getGeometriesExtents(obj.geometries);
  const range = vec3.create();
  const temp = vec3.create();
  vec3.subtract(range, extents.max, extents.min);

  const objOffset = vec3.create();
  vec3.scale(
    objOffset,
    vec3.add(temp, extents.min, vec3.scale(temp, range, 0.5)),
    -1,
  );

  const cam = new cg.Cam([0, 1.5, 6]);
  const rotationAxis = new Float32Array([0, 1, 0]);

  let aspect = 1;
  let deltaTime = 0;
  let lastTime = 0;
  let theta = 0;

  const uniforms = {
    u_world: mat4.create(),
    u_projection: mat4.create(),
    u_view: cam.viewM4,
  };

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  function render(elapsedTime) {
    elapsedTime *= 1e-3;
    deltaTime = elapsedTime - lastTime;
    lastTime = elapsedTime;

    if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      aspect = gl.canvas.width / gl.canvas.height;
    }
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta = elapsedTime;

    mat4.identity(uniforms.u_projection);
    mat4.perspective(uniforms.u_projection, cam.zoom, aspect, 0.1, 100);
    mat4.identity(uniforms.u_world);
    mat4.rotate(uniforms.u_world, uniforms.u_world, theta, rotationAxis);

    gl.useProgram(meshProgramInfo.program);
    twgl.setUniforms(meshProgramInfo, uniforms);

    for (const { bufferInfo, vao, material } of parts) {
      gl.bindVertexArray(vao);
      twgl.setUniforms(meshProgramInfo, { u_world: uniforms.u_world, }, material);
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
