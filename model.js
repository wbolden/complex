

var tsverts = [-1,-1,  1, -1,  -1,1,
               -1,1,    1, -1,   1,1];

var tscoords = [0,0,  1, 0,  0,1,
                0,1,   1, 0,  1,1];

function make_plane(xmin, xmax, ymin, ymax) {
    return [xmin,ymin,  xmax,ymin,  xmin,ymax,
            xmin,ymax,  xmax,ymin,  xmax,ymax];
}

function texscreen(xmin, xmax, ymin, ymax) {

    this.vertices = tsverts;
    this.texcoords = tscoords;

    if(ymax != undefined) this.vertices = make_plane(xmin, xmax, ymin, ymax);
    //if(vertices != undefined) this.texcoords = texcoords;

    console.log("\n\n\nTSCREEN VERTS:")
    console.log(this.vertices);

    this.vbuffer = make_buffer(gl);
    this.tbuffer = make_buffer(gl);

    this.setup_buffers = function(program) {
        
        gl.enableVertexAttribArray(program.pos);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.pos, 2, gl.FLOAT, false, 0, 0);
        

        if(program.tcoord != null) {
            gl.enableVertexAttribArray(program.tcoord);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.tbuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texcoords), gl.STATIC_DRAW);
            gl.vertexAttribPointer(program.tcoord, 2, gl.FLOAT, false, 0, 0);
        }   
    }

    this.draw = function(texture, program) {
        this.setup_buffers(program);

        if(texture != null){ 
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
        }
        gl.uniform1i(program.sam, 0);
        //console.log(this.vertices);
        //console.log(this.vertices.length);
        //console.log(this.texcoords.length);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}