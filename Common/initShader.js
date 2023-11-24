class InitShader {
    indexEdgeBuffer;
    vertexPositionBuffer;
    vertexNormalBuffer;
    indexTriBuffer
    constructor() {

    }

    createVertexShader = () => {
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        if (vertexShader) {
            this._vertexShader = vertexShader;
        }

        return this._vertexShader;
    }

    createFragmentShader = () => {
        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (fragmentShader) {
            this._fragmentShader = fragmentShader;
        }

        return this._fragmentShader;
    }

    createShaderProgram = () => {
        gl.shaderSource(this._vertexShader, vertexSource);
        gl.compileShader(this._vertexShader);

        if (!gl.getShaderParameter(this._vertexShader, gl.COMPILE_STATUS)) {
            console.error("Error in vertex shader:  " + gl.getShaderInfoLog(this._vertexShader));
        }

        gl.shaderSource(this._fragmentShader, fragmentSource);
        gl.compileShader(this._fragmentShader);
        if (!gl.getShaderParameter(this._fragmentShader, gl.COMPILE_STATUS)) {
            console.error("Error in fragment shader:  " + gl.getShaderInfoLog(this.fragmentSource));
        }

        gl.attachShader(shaderProgram, this._vertexShader);
        gl.attachShader(shaderProgram, this._fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error("Link error in program:  " + gl.getProgramInfoLog(this.shaderProgram));
        }

        this.#bindShaderAttributes();

    }

    #bindShaderAttributes = () => {

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        for (const key in attributeMapper) {
            const uniformLocationName = attributeMapper[key];
            shaderProgram[key] = gl.getUniformLocation(shaderProgram, uniformLocationName);
        }
    }
}