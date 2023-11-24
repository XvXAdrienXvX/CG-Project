/*
 * Static utility class
*/
class Utils {
    static {
        console.log('static classes cannot be instantiated');
    }

    static #setModelViewMatrixToShader = () => { // private static
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    }

    static #setProjectionMatrixToShader = () => { // private static
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    }

    static #setNormalMatrixToShader = () => { // private static
        glMatrix.mat3.fromMat4(nMatrix, mvMatrix);
        glMatrix.mat3.transpose(nMatrix, nMatrix);
        glMatrix.mat3.invert(nMatrix, nMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
    }

    /**
     * Pushes matrix onto modelview matrix stack
    */
    static mvPushMatrix = () => {
        let copy = glMatrix.mat4.clone(mvMatrix);
        mvMatrixStack.push(copy);
    }

    static mvPopMatrix = () => {
        if (mvMatrixStack.length == 0) {
            throw "Invalid matrix!"; // fail fast principle
        }
        mvMatrix = mvMatrixStack.pop();
    }

    static degreeToRadian = (degrees) => {
        return degrees * Math.PI / 180;
    }

    static setViewSize = (context, canvas) => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        context.viewportWidth = canvas.width;
        context.viewportHeight = canvas.height;
    }

    static setMaterialUniforms = (alpha, a, d, s) => {
        gl.uniform1f(shaderProgram.uniformShininessLoc, alpha);
        gl.uniform3fv(shaderProgram.uniformAmbientMaterialColorLoc, a);
        gl.uniform3fv(shaderProgram.uniformDiffuseMaterialColorLoc, d);
        gl.uniform3fv(shaderProgram.uniformSpecularMaterialColorLoc, s);
    }

    /**
     * Sends light information to the shader
     * @param {Float32Array} loc Location of light source
     * @param {Float32Array} a Ambient light strength
     * @param {Float32Array} d Diffuse light strength
     * @param {Float32Array} s Specular light strength
     */
    static setLightUniforms = (loc, a, d, s) => {
        gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
        gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
        gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
        gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
    }

    static setZUniforms = (maxZ, minZ) => {
        gl.uniform1f(shaderProgram.uniformMaxZLoc, maxZ);
        gl.uniform1f(shaderProgram.uniformMinZLoc, minZ);
    }

    static setMatrixUniforms = () => {
        this.#setModelViewMatrixToShader();
        this.#setNormalMatrixToShader();
        this.#setProjectionMatrixToShader();
    }

}