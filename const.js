const vertexSource = `
attribute vec3 aVertexNormal;
attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform float maxZ;
uniform float minZ;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vKDiffuse;

void main(void) {

// Get the vertex position in eye coordinates and send to the fragment shader
vec4 vertexPositionEye4 = uMVMatrix * vec4(aVertexPosition, 1.0);
vPosition = vertexPositionEye4.xyz / vertexPositionEye4.w;

// Transform the normal (n) to eye coordinates and send to the fragment shader
vNormal = normalize(uNMatrix * aVertexNormal);

// Elevation-based colormap for the terrain
float h = (aVertexPosition.z - minZ) / (maxZ - minZ);
if (h < 0.20) {
  vKDiffuse = vec3(50.0 / 255.0, (130.0 - (0.20 - h) * 1000.0) / 255.0, 255.0 / 255.0);
} else if (h < 0.45) {
  vKDiffuse = vec3((22.0 + h * 100.0) / 255.0, 255.0 / 255.0, (h * 100.0) / 255.0);
} else if (h < 0.75) {
  vKDiffuse = vec3(230.0 / 255.0, (270.0 - h * 200.0 ) / 255.0, 63.0 / 255.0);
} else {
  vKDiffuse = vec3(1.0, 1.0, 1.0);
}

gl_Position = uPMatrix*uMVMatrix*vec4(aVertexPosition, 1.0);
}
`;

const fragmentSource = `
precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uAmbientLightColor;
uniform vec3 uDiffuseLightColor;
uniform vec3 uSpecularLightColor;

uniform vec3 uKAmbient;
uniform vec3 uKDiffuse;
uniform vec3 uKSpecular;
uniform float uShininess;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vKDiffuse;

void main(void) {
// If the material color is black or white, use it other than colormap
vec3 kDiffuse;
if (uKDiffuse == vec3(0.0, 0.0, 0.0) || uKDiffuse == vec3(1.0, 1.0, 1.0)) {kDiffuse = uKDiffuse;}
else {kDiffuse = vKDiffuse;}

// Calculate the vector (l) to the light source
vec3 vectorToLightSource = normalize(uLightPosition - vPosition);

// Calculate n dot l for diffuse lighting
float diffuseLightWeightning = max(dot(vNormal, 
                                vectorToLightSource), 0.0);                           

// The camera in eye coordinates is located in the origin and is pointing
// along the negative z-axis. Calculate viewVector (v) 
// in eye coordinates as:
// (0.0, 0.0, 0.0) - vPosition
vec3 viewVectorEye = -normalize(vPosition);

// Calculate halfway vector (h)
vec3 halfwayVector = normalize(vectorToLightSource + viewVectorEye);   

// Calculate h dot n for specular lighting
float hdotn = max(dot(halfwayVector, vNormal), 0.0);

float specularLightWeightning = pow(hdotn, uShininess);

// Sum up all three reflection components
gl_FragColor = vec4(((uAmbientLightColor*uKAmbient)
            + (uDiffuseLightColor*kDiffuse) * diffuseLightWeightning
            + ((uSpecularLightColor*uKSpecular) * specularLightWeightning)),1.0);

}
`;

const attributeMapper = {
  "mvMatrixUniform": "uMVMatrix",
  "pMatrixUniform": "uPMatrix",
  "nMatrixUniform": "uNMatrix",
  "uniformLightPositionLoc": "uLightPosition",
  "uniformAmbientLightColorLoc": "uAmbientLightColor",
  "uniformDiffuseLightColorLoc": "uDiffuseLightColor",
  "uniformSpecularLightColorLoc": "uSpecularLightColor",
  "uniformShininessLoc": "uShininess",
  "uniformAmbientMaterialColorLoc": "uKAmbient",
  "uniformDiffuseMaterialColorLoc": "uKDiffuse",
  "uniformSpecularMaterialColorLoc": "uKSpecular",
  "uniformMaxZLoc": "maxZ",
  "uniformMinZLoc": "minZ"
};
