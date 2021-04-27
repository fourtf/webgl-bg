// @ts-check

const canvasId = "bg-canvas";

const vert = `
    attribute vec2 a_position;
    varying vec2 vPos;

    void main() {
        vPos = a_position;
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
    `;

const frag = `
    precision mediump float;
    uniform vec3 u_color;
    uniform float u_time;
    varying vec2 vPos;

    void main() {
        vec3 p = vec3(
            cos(vPos.x * 1.59 + sin(((u_time * 0.0001) + vPos.y) * 1.747) + sin((u_time * 0.000107) + vPos.y * 0.4)),
            sin((u_time * 0.0001876) + sin(vPos.y * 2.46)),
            1.0
            // sin((u_time * 0.0001470) + vPos.x + vPos.y * 1.17)
        );

        gl_FragColor = vec4(p * 0.25 + 0.5, 1.0);
    }
    `;

window.onload = main;
window.onresize = resize;
resize();

function main() {
  let gl;

  // INIT GL
  try {
    // @ts-ignore
    gl = document.getElementById(canvasId).getContext("webgl");
  } catch (ex) {} //02

  if (!gl) {
    console.log("Unable to initialize WebGL. Your browser may not support it.");
    return;
  }

  // Setup the shader program with the vertex shader and the fragment shader
  var shaderProgram = buildShaderProgram(gl, vert, frag);

  // Draw the object given a set of 2D points, in this case a square
  drawObject(
    gl,
    shaderProgram,
    2,
    [0.333, 0.666, 0.999],
    [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]
  );
}

function drawObject(
  gl,
  shaderProgram,
  coordDimensions,
  objColor,
  vertexCoords
) {
  let fn;
  fn = () => {
    gl.useProgram(shaderProgram);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // Set this buffer as the current one for the next buffer operations

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertexCoords),
      gl.STATIC_DRAW
    );
    var sh_position = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(sh_position);
    gl.vertexAttribPointer(sh_position, coordDimensions, gl.FLOAT, false, 0, 0);
    var sh_color = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform3f(sh_color, objColor[0], objColor[1], objColor[2]);

    const sh_time = gl.getUniformLocation(shaderProgram, "u_time");
    gl.uniform1f(sh_time, Date.now() & 0xffffffff);

    gl.clearColor(0, 0, 0, 1); // defaults to white (1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCoords.length / coordDimensions);

    requestAnimationFrame(fn);
  };

  fn();
}

function resize() {
  console.log("resize");
  const canvas = document.getElementById(canvasId);
  const size = canvasSize();

  canvas.width = size[0];
  canvas.height = size[1];
}

function canvasSize() {
  return [document.body.clientWidth, document.body.clientHeight];
}

function buildShaderProgram(gl, vertShaderSrc, fragShaderSrc) {
  function buildShader(type, source) {
    var sh;
    if (type == "fragment") sh = gl.createShader(gl.FRAGMENT_SHADER);
    else if (type == "vertex") sh = gl.createShader(gl.VERTEX_SHADER);
    // Unknown shader type
    else return null;
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    // See if it compiled successfully
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.log(
        "An error occurred compiling the " +
          type +
          " shader: " +
          gl.getShaderInfoLog(sh)
      );
      return null;
    } else {
      return sh;
    }
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, buildShader("vertex", vertShaderSrc));
  gl.attachShader(prog, buildShader("fragment", fragShaderSrc));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw "Could not link the shader program!";
  }
  return prog;
}
