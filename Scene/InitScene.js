createGLContext = (canvas) => {
  let names = ["webgl", "experimental-webgl"];
  let context = null;
  for (var i = 0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch (e) { }
    if (context) {
      break;
    }
  }
  if (context) {
    Utils.setViewSize(context, canvas);
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

draw = () =>{
  let transformVec = glMatrix.vec3.create();

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  glMatrix.mat4.perspective(pMatrix, Utils.degreeToRadian(55), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);

  // look down -z 
  glMatrix.vec3.add(viewPt, eyePt, viewDir);
  //generate lookat matrix and initialize the MV matrix to that view
  glMatrix.mat4.lookAt(mvMatrix, eyePt, viewPt, up);

  //Draw Terrain
  Utils.mvPushMatrix();
  glMatrix.vec3.set(transformVec, 0.0, -0.25, -2.0);
  glMatrix.mat4.translate(mvMatrix, mvMatrix, transformVec);
  glMatrix.mat4.rotateY(mvMatrix, mvMatrix, Utils.degreeToRadian(viewRot));
  glMatrix.mat4.rotateX(mvMatrix, mvMatrix, Utils.degreeToRadian(-90));
  Utils.setMatrixUniforms();
  Utils.setLightUniforms(lightPosition, lAmbient, lDiffuse, lSpecular);
  Utils.setZUniforms(myTerrain.maxZ, myTerrain.minZ);
  Utils.setMaterialUniforms(shininess, kAmbient, kTerrainDiffuse, kSpecular);
  myTerrain.drawTriangles();
  Utils.mvPopMatrix();
}

animate = () => {
  viewRot += 0.15; // rotate terrain each frame
}

onGenerate = () => {
  myTerrain = new Terrain(100, -0.5, 0.5, -0.5, 0.5);
  myTerrain.loadBuffers();
}

render = () =>{
  requestAnimationFrame(render);
  Utils.setViewSize(gl, canvas);
  animate();
  draw();
}

main = () => {
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
