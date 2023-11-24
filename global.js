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
