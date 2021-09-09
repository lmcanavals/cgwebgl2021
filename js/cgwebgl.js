(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], () => factory.call(root));
  } else {
    root.cg = factory.call(root);
  }
}(this, function () {
  "use strict";

  const FORWARD = 0;
  const LEFT = 1;
  const BACKWARD = 2;
  const RIGHT = 3;

  const MINZOOM = Math.PI / 180.0;
  const MAXZOOM = Math.PI / 4.0;
  const MAXPITCH = Math.PI / 2.02;

  class Cam {
    constructor(pos) {
      this.pos = glMatrix.vec3.clone(pos);
      this.up = glMatrix.vec3.clone([0, 1, 0]);
      this.lookAt = glMatrix.vec3.create();
      this.right = glMatrix.vec3.create();
      this.worldUp = glMatrix.vec3.clone([0, 1, 0]);

      this.yaw = -Math.PI / 2.0;
      this.pitch = 0.0;
      this.zoom = Math.PI / 4.0;

      this.mouseSensitivity = 0.01;
      this.zoomSensitivity = 0.005;

      this.speed = 2.5;

      this.firstMouse = true;
      this.lastX = 0;
      this.lasty = 0;

      this.viewM4 = glMatrix.mat4.create();

      this.updateVectors();
    }
    movePov(xpos, ypos) {
      if (this.firstMouse) {
        this.lastX = xpos;
        this.lastY = ypos;
        this.firstMouse = false;
      } else {
        processPov(xpos - this.lastX, this.lastY - ypos);
        this.lastX = xpos;
        this.lastY = ypos;
      }
    }
    stopPov() {
      this.firstMouse = true;
    }
    processKeyboard(direction, deltaTime) {
      const velocity = this.speed * deltaTime;
      if (direction === FORWARD) {
        this.pos[0] += this.lookAt[0] * velocity;
        this.pos[1] += this.lookAt[1] * velocity;
        this.pos[2] += this.lookAt[2] * velocity;
      } else if (direction === LEFT) {
        this.pos[0] -= this.right[0] * velocity;
        this.pos[1] -= this.right[1] * velocity;
        this.pos[2] -= this.right[2] * velocity;
      } else if (direction === BACKWARD) {
        this.pos[0] -= this.lookAt[0] * velocity;
        this.pos[1] -= this.lookAt[1] * velocity;
        this.pos[2] -= this.lookAt[2] * velocity;
      } else if (direction === RIGHT) {
        this.pos[0] += this.right[0] * velocity;
        this.pos[1] += this.right[1] * velocity;
        this.pos[2] += this.right[2] * velocity;
      }
			this.updateVectors();
    }
    processScroll(yoffset) {
      this.zoom -= yoffset * zoomSensitivity;
      if (this.zoom < MINZOOM) this.zoom = MINZOOM;
      else if (this.zoom > MAXZOOM) this.zoom = MAXZOOM;
    }
    processPov(xoffset, yoffset, constrainPitch) {
      constrainPitch = constrainPitch === undefined ? true : constrainPitch;
      this.yaw += xoffset * this.mouseSensitivity;
      this.pitch += yoffset * this.mouseSensitivity;
      if (constrainPitch) {
        if (this.pitch > MAXPITCH) this.pitch = MAXPITCH;
        else if (this.pitch < -MAXPITCH) this.pitch = -MAXPITCH;
      }
      this.updateVectors();
    }
    updateVectors() {
      this.lookAt[0] = Math.cos(this.yaw) * Math.cos(this.pitch);
      this.lookAt[1] = Math.sin(this.pitch);
      this.lookAt[2] = Math.sin(this.yaw) * Math.cos(this.pitch);
      glMatrix.vec3.normalize(this.lookAt, this.lookAt);
      glMatrix.vec3.cross(this.right, this.lookAt, this.worldUp);
      glMatrix.vec3.normalize(this.right, this.right);
      glMatrix.vec3.cross(this.up, this.right, this.lookAt);
      glMatrix.vec3.normalize(this.up, this.up);

      const temp = glMatrix.vec3.create();
      glMatrix.vec3.add(temp, this.pos, this.lookAt);
      glMatrix.mat4.lookAt(this.viewM4, this.pos, temp, this.up);
    }
  }

  class Mesh {
    constructor(gl, shader, params) {
      this.gl = gl;
      this.vertices = params.vertices;
      this.indices = params.indices;
      this.vao = gl.createVertexArray();

      const vbo = gl.createBuffer();
      const ebo = gl.createBuffer();

      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

      let stride = 0;
      for (const a of params.attribs) stride += a.size;
      stride *= 4;
      let offset = 0;
      for (const a of params.attribs) {
        const attrib = gl.getAttribLocation(shader, a.name);
        gl.enableVertexAttribArray(attrib);
        gl.vertexAttribPointer(attrib, a.size, gl.FLOAT, false, stride, offset);
        offset += a.size * 4;
      }

      gl.bindVertexArray(null);
    }
    draw() {
      this.gl.bindVertexArray(this.vao);
      this.gl.drawElements(
        this.gl.TRIANGLES,
        this.indices.length,
        this.gl.UNSIGNED_INT,
        0,
      );
      this.gl.bindVertexArray(null);
    }
  }

  class MeshHelper {
    constructor(numVertices, numComps, numIndices) {
      this.numComps = numComps;
      this.vertices = new Float32Array(numVertices * numComps);
      this.indices = new Uint32Array(numIndices);
      this.iv = 0;
      this.ii = 0;
    }
    addVertex(comps) {
      for (let i = 0; i < comps.length; ++i) {
        this.vertices[this.iv * this.numComps + i] = comps[i];
      }
      this.iv++;
    }
    addTriangle(a, b, c) {
      this.indices[this.ii * 3 + 0] = a;
      this.indices[this.ii * 3 + 1] = b;
      this.indices[this.ii * 3 + 2] = c;
      this.ii++;
    }
    addRect(a, b, c, d) {
      this.addTriangle(a, b, c);
      this.addTriangle(b, c, d);
    }
  }

  return {
    FORWARD: FORWARD,
    LEFT: LEFT,
    BACKWARD: BACKWARD,
    RIGHT: RIGHT,
    Cam: Cam,
    Mesh: Mesh,
    MeshHelper: MeshHelper,
  };
}));
