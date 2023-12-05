class Terrain {

    constructor(div, minX, maxX, minY, maxY) {
      this.div = div;
      this.minX = minX;
      this.minY = minY;
      this.maxX = maxX;
      this.maxY = maxY;
  
      this.vBuffer = [];
      this.fBuffer = [];
      this.nBuffer = [];
      this.eBuffer = [];
      console.log("Terrain: Allocated buffers");
  
      this.generateTriangles();
      console.log("Terrain: Generated triangles");
  
      this.generateLines();
      console.log("Terrain: Generated lines");
  
      var ext = gl.getExtension('OES_element_index_uint');
      if (ext == null) {
        alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
      }
    }
  
    setVertex(v, i, j) {
      var vid = (i * (this.div + 1) + j) * 3;
      this.vBuffer[vid] = v[0];
      this.vBuffer[vid + 1] = v[1];
      this.vBuffer[vid + 2] = v[2];
    }

    getVertex(v, i, j) {
      var vid = (i * (this.div + 1) + j) * 3;
      v[0] = this.vBuffer[vid];
      v[1] = this.vBuffer[vid + 1];
      v[2] = this.vBuffer[vid + 2];
    }
  
    loadBuffers() {
      // Specify the vertex coordinates
      this.VertexPositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vBuffer), gl.STATIC_DRAW);
      this.VertexPositionBuffer.itemSize = 3;
      this.VertexPositionBuffer.numItems = this.numVertices;
      console.log("Loaded ", this.VertexPositionBuffer.numItems, " vertices");
  
      // Specify normals to be able to do lighting calculations
      this.VertexNormalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.nBuffer),
        gl.STATIC_DRAW);
      this.VertexNormalBuffer.itemSize = 3;
      this.VertexNormalBuffer.numItems = this.numVertices;
      console.log("Loaded ", this.VertexNormalBuffer.numItems, " normals");
  
      // Specify faces of the terrain 
      this.IndexTriBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.fBuffer),
        gl.STATIC_DRAW);
      this.IndexTriBuffer.itemSize = 1;
      this.IndexTriBuffer.numItems = this.fBuffer.length;
      console.log("Loaded ", this.IndexTriBuffer.numItems, " triangles");
  
      //Setup Edges  
      this.IndexEdgeBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.eBuffer),
        gl.STATIC_DRAW);
      this.IndexEdgeBuffer.itemSize = 1;
      this.IndexEdgeBuffer.numItems = this.eBuffer.length;
  
      console.log("triangulatedPlane: loadBuffers");
    }
  
    /**
    * Render the triangles 
    */
    drawTriangles() {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize,
        gl.FLOAT, false, 0, 0);
  
      // Bind normal buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
        this.VertexNormalBuffer.itemSize,
        gl.FLOAT, false, 0, 0);
  
      //Draw 
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
      gl.drawElements(gl.TRIANGLES, this.IndexTriBuffer.numItems, gl.UNSIGNED_INT, 0);
    }
  
    /**
    * Render the triangle edges wireframe style 
    */
    drawEdges() {
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize,
        gl.FLOAT, false, 0, 0);
  
      // Bind normal buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
        this.VertexNormalBuffer.itemSize,
        gl.FLOAT, false, 0, 0);
  
      //Draw 
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
      gl.drawElements(gl.LINES, this.IndexEdgeBuffer.numItems, gl.UNSIGNED_INT, 0);
    }
  
    /**
     * Fill the vertex and buffer arrays 
     */
    generateTriangles() {
      const deltaX = (this.maxX - this.minX) / this.div;
      const deltaY = (this.maxY - this.minY) / this.div;
    
      // Generate vertices
      for (let i = 0; i <= this.div; i++) {
        for (let j = 0; j <= this.div; j++) {
          const x = this.minX + deltaX * j;
          const y = this.minY + deltaY * i;
    
          this.vBuffer.push(x, y, 0);
          this.nBuffer.push(0, 0, 0);
        }
      }
    
      this.numVertices = this.vBuffer.length / 3;
      this.updateVertices();
      this.getMinZMaxZ();
    
      // Generate triangles
      for (let i = 0; i < this.div; i++) {
        for (let j = 0; j < this.div; j++) {
          const vid = i * (this.div + 1) + j;
    
          this.fBuffer.push(vid, vid + 1, vid + this.div + 1);
          this.fBuffer.push(vid + 1, vid + 1 + this.div + 1, vid + this.div + 1);
        }
      }
    
      this.numFaces = this.fBuffer.length / 3;
    
      this.updateNormals();
    }    
  
    /**
     * Get minZ and maxZ
     */
    getMinZMaxZ() {
      this.maxZ = -Infinity;
      this.minZ = Infinity;
      for (var i = 0; i < this.numVertices; i++) {
        if (this.vBuffer[i * 3 + 2] < this.minZ) this.minZ = this.vBuffer[i * 3 + 2];
        if (this.vBuffer[i * 3 + 2] > this.maxZ) this.maxZ = this.vBuffer[i * 3 + 2];
      }
    }
  
    /**
     * Generate the plane by randomly devide the vertices
     */
    updateVertices() {
      const iterations = 400;
      const delta = 0.0035; // height
      const randomPoint = () => [Math.random() * (this.maxX - this.minX) + this.minX, Math.random() * (this.maxY - this.minY) + this.minY];
      const randomDirection = () => glMatrix.vec2.random(glMatrix.vec2.create());
    
      for (let i = 0; i < iterations; i++) {
        const point = randomPoint();
        const direction = randomDirection();
    
        for (let j = 0; j < this.numVertices; j++) {
          const vertex = [this.vBuffer[j * 3], this.vBuffer[j * 3 + 1]]; // extract x and y coordinates from buffer
          const dotProduct = (vertex[0] - point[0]) * direction[0] + (vertex[1] - point[1]) * direction[1];
    
          this.vBuffer[j * 3 + 2] += dotProduct > 0 ? delta : -delta;
        }
      }
    }    
  
    /**
     * Calculate per-vertex normals
     */
    updateNormals() {
      const computeVector = (v1, v2) => {
        const result = glMatrix.vec3.create();
        glMatrix.vec3.sub(result, v2, v1);
        return result;
      };
    
      for (let i = 0; i < this.numFaces; i++) {
        const vid1 = this.fBuffer[i * 3];
        const vid2 = this.fBuffer[i * 3 + 1];
        const vid3 = this.fBuffer[i * 3 + 2];
    
        const v1 = this.getVertex(vid1);
        const v2 = this.getVertex(vid2);
        const v3 = this.getVertex(vid3);
    
        const n1 = this.getNormal(vid1);
        const n2 = this.getNormal(vid2);
        const n3 = this.getNormal(vid3);
    
        // Compute Normal vector
        const t1 = computeVector(v2, v1);
        const t2 = computeVector(v3, v1);
        const n = glMatrix.vec3.create();
        glMatrix.vec3.cross(n, t1, t2);
    
        // Add to normals
        glMatrix.vec3.add(n1, n1, n);
        glMatrix.vec3.add(n2, n2, n);
        glMatrix.vec3.add(n3, n3, n);
    
        this.setNormal(vid1, n1);
        this.setNormal(vid2, n2);
        this.setNormal(vid3, n3);
      }
    
      // Normalize
      for (let i = 0; i < this.numVertices; i++) {
        const n = this.getNormal(i);
        glMatrix.vec3.normalize(n, n);
        this.setNormal(i, n);
      }
    }
    
    // Helper functions for getting and setting vertices and normals
    getVertex(index) {
      return [
        this.vBuffer[index * 3],
        this.vBuffer[index * 3 + 1],
        this.vBuffer[index * 3 + 2]
      ];
    }
    
    getNormal(index) {
      return [
        this.nBuffer[index * 3],
        this.nBuffer[index * 3 + 1],
        this.nBuffer[index * 3 + 2]
      ];
    }
    
    setNormal(index, normal) {
      [
        this.nBuffer[index * 3],
        this.nBuffer[index * 3 + 1],
        this.nBuffer[index * 3 + 2]
      ] = normal;
    }    
  

    generateLines() {
      var numTris = this.fBuffer.length / 3;
      for (var f = 0; f < numTris; f++) {
        var fid = f * 3;
        this.eBuffer.push(this.fBuffer[fid]);
        this.eBuffer.push(this.fBuffer[fid + 1]);
  
        this.eBuffer.push(this.fBuffer[fid + 1]);
        this.eBuffer.push(this.fBuffer[fid + 2]);
  
        this.eBuffer.push(this.fBuffer[fid + 2]);
        this.eBuffer.push(this.fBuffer[fid]);
      }
  
    }
  
  }
  