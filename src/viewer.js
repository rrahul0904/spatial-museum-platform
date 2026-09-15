const VERTEX_SHADER = `
attribute vec3 position;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vec4 world = model * vec4(position, 1.0);
  vPosition = world.xyz;
  vNormal = normalize(mat3(model) * normalize(position));
  gl_Position = projection * view * world;
}`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 baseColor;
void main() {
  vec3 lightDir = normalize(vec3(0.5, 0.85, 0.7));
  float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
  float rim = pow(1.0 - abs(normalize(vNormal).z), 2.0);
  vec3 color = baseColor * (0.26 + diffuse * 0.72) + vec3(0.18) * rim;
  gl_FragColor = vec4(color, 1.0);
}`;

const multiply = (a, b) => {
  const out = new Float32Array(16);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  }
  return out;
};
const rotationX = (a) => new Float32Array([1,0,0,0, 0,Math.cos(a),Math.sin(a),0, 0,-Math.sin(a),Math.cos(a),0, 0,0,0,1]);
const rotationY = (a) => new Float32Array([Math.cos(a),0,-Math.sin(a),0, 0,1,0,0, Math.sin(a),0,Math.cos(a),0, 0,0,0,1]);
const scale = (s) => new Float32Array([s,0,0,0, 0,s,0,0, 0,0,s,0, 0,0,0,1]);
const perspective = (fov, aspect, near, far) => {
  const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
  return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,2*far*near*nf,0]);
};
const viewMatrix = (distance) => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-distance,1]);

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

function createProgram(gl) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

function sphereVertices(segments = 26, rings = 18, deform = (x, y, z) => [x, y, z]) {
  const points = [];
  for (let r = 0; r < rings; r++) {
    const v0 = r / rings, v1 = (r + 1) / rings;
    const p0 = (v0 - 0.5) * Math.PI, p1 = (v1 - 0.5) * Math.PI;
    for (let s = 0; s < segments; s++) {
      const u0 = s / segments * Math.PI * 2, u1 = (s + 1) / segments * Math.PI * 2;
      const p = (u, p) => deform(Math.cos(p) * Math.cos(u), Math.sin(p), Math.cos(p) * Math.sin(u));
      points.push(...p(u0,p0), ...p(u1,p0), ...p(u1,p1), ...p(u0,p0), ...p(u1,p1), ...p(u0,p1));
    }
  }
  return new Float32Array(points);
}

function geometryFor(shape) {
  const phi = Math.PI * 2;
  if (shape === "helix") return sphereVertices(28, 22, (x,y,z) => {
    const a = Math.atan2(z,x), radius = 0.48 + 0.13 * Math.sin(a * 3 + y * 8);
    return [x * radius, y * 1.35, z * radius];
  });
  if (shape === "orbit") return sphereVertices(32, 18, (x,y,z) => {
    const a = Math.atan2(z,x), ring = 0.72 + 0.18 * Math.cos(a * 4);
    return [x * ring * 1.18, y * 0.38, z * ring * 1.18];
  });
  if (shape === "monolith") return sphereVertices(18, 12, (x,y,z) => [x * 0.52, y * 1.45, z * 0.4]);
  if (shape === "fold") return sphereVertices(30, 14, (x,y,z) => [x * (0.75 + 0.18*Math.sin(y*phi)), y * 0.9, z * 0.27 + Math.sin(x*3.4)*0.22]);
  if (shape === "bloom") return sphereVertices(36, 20, (x,y,z) => {
    const a = Math.atan2(z,x), petals = 0.72 + 0.28*Math.cos(a*7)*Math.cos(y*2.6);
    return [x*petals, y*0.95, z*petals];
  });
  return sphereVertices(24, 16, (x,y,z) => [x*(0.7+0.24*y), y, z*(0.55-0.12*y)]);
}

export function mountViewer(canvas, work) {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
  if (!gl) {
    canvas.replaceWith(Object.assign(document.createElement("div"), { className: "viewer-fallback", textContent: "WebGL is unavailable on this device." }));
    return () => {};
  }
  const program = createProgram(gl);
  const vertices = geometryFor(work.shape);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  const uniforms = {
    model: gl.getUniformLocation(program, "model"),
    view: gl.getUniformLocation(program, "view"),
    projection: gl.getUniformLocation(program, "projection"),
    baseColor: gl.getUniformLocation(program, "baseColor")
  };
  gl.enable(gl.DEPTH_TEST);
  let rx = -0.18, ry = 0.5, zoom = 1, pointer = null, frame = 0;
  const color = work.scaleStatus === "verified" ? [0.74,0.48,0.25] : [0.45,0.57,0.64];

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    gl.viewport(0, 0, width, height);
  };
  const render = () => {
    resize();
    gl.clearColor(0.035, 0.04, 0.045, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
    const model = multiply(multiply(rotationY(ry), rotationX(rx)), scale(zoom));
    gl.uniformMatrix4fv(uniforms.model, false, model);
    gl.uniformMatrix4fv(uniforms.view, false, viewMatrix(3.35));
    gl.uniformMatrix4fv(uniforms.projection, false, perspective(Math.PI / 3.2, canvas.width/canvas.height, 0.1, 100));
    gl.uniform3fv(uniforms.baseColor, color);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    frame = requestAnimationFrame(render);
  };
  const down = (event) => { pointer = [event.clientX, event.clientY]; canvas.setPointerCapture?.(event.pointerId); };
  const move = (event) => { if (!pointer) return; ry += (event.clientX-pointer[0])*0.009; rx += (event.clientY-pointer[1])*0.009; pointer = [event.clientX,event.clientY]; };
  const up = () => { pointer = null; };
  const wheel = (event) => { event.preventDefault(); zoom = Math.max(0.55, Math.min(1.65, zoom - Math.sign(event.deltaY)*0.08)); };
  canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up); canvas.addEventListener("wheel", wheel, { passive: false });
  render();
  return () => { cancelAnimationFrame(frame); canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", up); canvas.removeEventListener("wheel", wheel); gl.deleteBuffer(buffer); gl.deleteProgram(program); };
}
