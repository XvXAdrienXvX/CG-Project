/** @global The HTML5 canvas */
var canvas;

/** @global The WebGL context */
var gl;

/** @global The Modelview Matrix */
var mvMatrix = glMatrix.mat4.create();

/** @global The Projection matrix */
var pMatrix = glMatrix.mat4.create();

/** @global The Normal matrix */
var nMatrix = glMatrix.mat3.create();

/** @global The matrix stack for hierarchical modeling */
var mvMatrixStack = [];

/** @global The GLSL shader program */
var shaderProgram;

/** @global The angle of rotation around the y axis */
var viewRot = 0;

/** @global A glmatrix vector to use for transformations */
var transformVec = glMatrix.vec3.create();

// Initialize the vector....
glMatrix.vec3.set(transformVec, 0.0, 0.0, -2.0);

/** @global An object holding the geometry for a 3D terrain */
var myTerrain;

// View parameters
/** @global Location of the camera in world coordinates */
var eyePt = glMatrix.vec3.fromValues(0.0, 0.15, -1.0);
/** @global Direction of the view in world coordinates */
var viewDir = glMatrix.vec3.fromValues(0.0, -0.5, -1.0);
/** @global Up vector for view matrix creation, in world coordinates */
var up = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
/** @global Location of a point along viewDir in world coordinates */
var viewPt = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);

//Light parameters
/** @global Light position in VIEW coordinates */
var lightPosition = [0, 1, 3];
/** @global Ambient light color/intensity for Phong reflection */
var lAmbient = [0, 0, 0];
/** @global Diffuse light color/intensity for Phong reflection */
var lDiffuse = [1, 1, 1];
/** @global Specular light color/intensity for Phong reflection */
var lSpecular = [0, 0, 0];

//Material parameters
/** @global Ambient material color/intensity for Phong reflection */
var kAmbient = [1.0, 1.0, 1.0];
/** @global Diffuse material color/intensity for Phong reflection */
var kTerrainDiffuse = [205.0 / 255.0, 163.0 / 255.0, 63.0 / 255.0];
/** @global Specular material color/intensity for Phong reflection */
var kSpecular = [0.0, 0.0, 0.0];
/** @global Shininess exponent for Phong reflection */
var shininess = 23;
/** @global Edge color fpr wireframeish rendering */
var kEdgeBlack = [0.0, 0.0, 0.0];
/** @global Edge color for wireframe rendering */
var kEdgeWhite = [1.0, 1.0, 1.0];

var vertexShaderSource, fragmentShaderSource;

var initShader = new InitShader();

function setModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function setProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,
    false, pMatrix);
}

//-------------------------------------------------------------------------
/**
 * Generates and sends the normal matrix to the shader
 */
function setNormalMatrixToShader() {
  glMatrix.mat3.fromMat4(nMatrix, mvMatrix);
  glMatrix.mat3.transpose(nMatrix, nMatrix);
  glMatrix.mat3.invert(nMatrix, nMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

//----------------------------------------------------------------------------------
/**
 * Pushes matrix onto modelview matrix stack
 */
function mvPushMatrix() {
  var copy = glMatrix.mat4.clone(mvMatrix);
  mvMatrixStack.push(copy);
}


//----------------------------------------------------------------------------------
/**
 * Pops matrix off of modelview matrix stack
 */
function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}

//----------------------------------------------------------------------------------
/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
  setModelViewMatrixToShader();
  setNormalMatrixToShader();
  setProjectionMatrixToShader();
}

//----------------------------------------------------------------------------------
/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Size the size of the viewport for responsive design
 * @param {element} context WebGL context 
 * @param {element} canvas WebGL canvas
 */
function setViewportSize(context, canvas) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  context.viewportWidth = canvas.width;
  context.viewportHeight = canvas.height;
}

//----------------------------------------------------------------------------------
/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i = 0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch (e) { }
    if (context) {
      break;
    }
  }
  if (context) {
    setViewportSize(context, canvas);
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

//----------------------------------------------------------------------------------
/**
 * Setup the fragment and vertex shaders
 */
loadShaders = () => {
  vertexShaderSource = document.getElementById("shader-vs");
  fragmentShaderSource = document.getElementById("shader-fs");

 
}

//-------------------------------------------------------------------------
/**
 * Sends material information to the shader
 * @param {Float32} alpha shininess coefficient
 * @param {Float32Array} a Ambient material color
 * @param {Float32Array} d Diffuse material color
 * @param {Float32Array} s Specular material color
 */
function setMaterialUniforms(alpha, a, d, s) {
  gl.uniform1f(shaderProgram.uniformShininessLoc, alpha);
  gl.uniform3fv(shaderProgram.uniformAmbientMaterialColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseMaterialColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularMaterialColorLoc, s);
}

//-------------------------------------------------------------------------
/**
 * Sends light information to the shader
 * @param {Float32Array} loc Location of light source
 * @param {Float32Array} a Ambient light strength
 * @param {Float32Array} d Diffuse light strength
 * @param {Float32Array} s Specular light strength
 */
function setLightUniforms(loc, a, d, s) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}

/**
 * Sends maxZ and minZ to the shader
 * @param {Float32} maxZ 
 * @param {Float32} minZ 
 */
function setZUniforms(maxZ, minZ) {
  gl.uniform1f(shaderProgram.uniformMaxZLoc, maxZ);
  gl.uniform1f(shaderProgram.uniformMinZLoc, minZ);
}

/**
 * Draw the content onto the canvas.
 */
function draw() {
  //console.log("function draw()")
  var transformVec = glMatrix.vec3.create();

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // We'll use perspective 
  glMatrix.mat4.perspective(pMatrix, degToRad(55), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);

  // We want to look down -z, so create a lookat point in that direction    
  glMatrix.vec3.add(viewPt, eyePt, viewDir);
  // Then generate the lookat matrix and initialize the MV matrix to that view
  glMatrix.mat4.lookAt(mvMatrix, eyePt, viewPt, up);

  //Draw Terrain
  mvPushMatrix();
  glMatrix.vec3.set(transformVec, 0.0, -0.25, -2.0);
  glMatrix.mat4.translate(mvMatrix, mvMatrix, transformVec);
  glMatrix.mat4.rotateY(mvMatrix, mvMatrix, degToRad(viewRot));
  glMatrix.mat4.rotateX(mvMatrix, mvMatrix, degToRad(-90));
  setMatrixUniforms();
  setLightUniforms(lightPosition, lAmbient, lDiffuse, lSpecular);
  setZUniforms(myTerrain.maxZ, myTerrain.minZ);
  setMaterialUniforms(shininess, kAmbient, kTerrainDiffuse, kSpecular);
  myTerrain.drawTriangles();
  mvPopMatrix();
}

/**
 * Animation to be called from tick. Update buffers every tick.
 */
function animate() {
  viewRot += 0.15;
}

onGenerate = () => {
  myTerrain = new Terrain(100, -0.5, 0.5, -0.5, 0.5);
  myTerrain.loadBuffers();
}
/**
 * Tick called for every animation frame.
 */
function render() {
  requestAnimationFrame(render);
  setViewportSize(gl, canvas);
  animate();
  draw();
}

/**
 * The main function which starts the program.
 */
function main() {
  canvas = document.getElementById("glCanvas");
  gl = createGLContext(canvas);
  shaderProgram = gl.createProgram();
  gl.clearColor(0.0, 0.0, 0.0, 0.8);
  gl.enable(gl.DEPTH_TEST);
  initShader.createVertexShader();
  initShader.createFragmentShader();
  initShader.createShaderProgram();
  onGenerate();
  render();
}
