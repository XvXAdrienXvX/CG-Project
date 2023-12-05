var canvas;

var gl;

var mvMatrix = glMatrix.mat4.create();

var pMatrix = glMatrix.mat4.create();

var nMatrix = glMatrix.mat3.create();

var mvMatrixStack = [];

var shaderProgram;

var viewRot = 0;

var transformVec = glMatrix.vec3.create();

glMatrix.vec3.set(transformVec, 0.0, 0.0, -2.0);

var myTerrain;

var eyePt = glMatrix.vec3.fromValues(0.0, 0.15, -1.0);
var viewDir = glMatrix.vec3.fromValues(0.0, -0.5, -1.0);
var up = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
var viewPt = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);

var lightPosition = [0, 1, 3];
var lAmbient = [0, 0, 0];
var lDiffuse = [1, 1, 1];
var lSpecular = [0, 0, 0];

var kAmbient = [1.0, 1.0, 1.0];
var kTerrainDiffuse = [205.0 / 255.0, 163.0 / 255.0, 63.0 / 255.0];
var kSpecular = [0.0, 0.0, 0.0];
var shininess = 23;
var kEdgeBlack = [0.0, 0.0, 0.0];
var kEdgeWhite = [1.0, 1.0, 1.0];

var vertexShaderSource, fragmentShaderSource;

var initShader = new InitShader();
