




var com_program; // Complex 

var com_pos;
var com_tex;

var tex_draw_program;  //Draw the textures resulting from the other two programs

var surf_program;

var td_pos;
var td_tex;

var sor_program; // The main 

var poly_program;





var gl;


var identity = new Matrix4();
var view3D = new Matrix4();

var baseRotationMat3D = new Matrix4();
var currentRotationMat3D = new Matrix4();

var offset3D = [0,0,0];
var basescale3D = 1;
var zoom3D = 1;


var user;

var com_tfb;
var com_tfb_float;
//var com_program_FB;
//var com_program_tex;

var sor_tfb;
//var sor_program_FB;
//var sor_program_tex;

var tsleft;
var tsright;
var tsfull;



var sor_tex;

var basewidth = 512;
var baseheight = 512;
var timeout;

var scale;

var zoom;
var tzoom;
var offset;
var toffset;





var dcoloring = true;
var checkerboard = true;
var originindicator = true;
var unitcircle = true;
var infstripes = true;     
var makemesh = false;
var invert = false;
var redrawmove = false;
var redrawzoom = false;

var render2D = true;
var invert3D = false;
var limitdomain3D = true;


function main() {
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl =  WebGLUtils.setupWebGL(canvas,{preserveDrawingBuffer: true})

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    
  
    if (!gl.getExtension("OES_texture_float")) {
      console.log("No OES_texture_float support");
  	}

    var surfacevs = getShaderText("surfacevs");
    var surfacefs = getShaderText("surfacefs");
    surf_program = createProgram(gl, surfacevs, surfacefs);
    surf_program.pos = gl.getAttribLocation(surf_program, "pos");
    surf_program.view = gl.getUniformLocation(surf_program, "view");
    surf_program.rot = gl.getUniformLocation(surf_program, "rot");
    surf_program.basescale = gl.getUniformLocation(surf_program, "basescale");
    surf_program.offset = gl.getUniformLocation(surf_program, "offset");
    surf_program.zoom = gl.getUniformLocation(surf_program, "zoom");


    surf_program.dcoloring = gl.getUniformLocation(surf_program, "dcoloring");
    surf_program.checkerboard = gl.getUniformLocation(surf_program, "checkerboard");
    surf_program.originindicator = gl.getUniformLocation(surf_program, "originindicator");
    surf_program.unitcircle = gl.getUniformLocation(surf_program, "unitcircle");
    surf_program.infstripes = gl.getUniformLocation(surf_program, "infstripes");
    surf_program.invert = gl.getUniformLocation(surf_program, "invert");
    surf_program.texscale = gl.getUniformLocation(surf_program, "texscale");
    surf_program.sam = gl.getUniformLocation(surf_program, "sam");



    // 
    var texdrawvs = getShaderText("texdrawvs");
    var texdrawfs = getShaderText("texdrawfs");
    tex_draw_program = createProgram(gl, texdrawvs, texdrawfs);

    if (!tex_draw_program) {
        console.log('Failed to intialize shaders for tex_draw_program.');
        return;
    }

    tex_draw_program.pos = gl.getAttribLocation(tex_draw_program, "pos");
    tex_draw_program.tcoord = gl.getAttribLocation(tex_draw_program, "tcoord");
    tex_draw_program.sam = gl.getUniformLocation(tex_draw_program, "sam");
    tex_draw_program.offset = gl.getUniformLocation(tex_draw_program, "offset");
    tex_draw_program.zoom = gl.getUniformLocation(tex_draw_program, "zoom");

    

    //window.onmouseup = function(event) {console.log("Unclick");};

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    //gl.enable(gl.BLEND);

    //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ZERO);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    sor_tfb = makeTextureFramebuffer(512, 512);
    console.log(sor_tfb);
    //com_program_FB = tfb1.fb;
    //com_program_tex = tfb2.tex;


    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    scale = [canvas.width/basewidth, canvas.height/baseheight];

    zoom = [1,1];
    tzoom = [1,1];

    offset = [0,0];
    toffset = [0,0];

    if(localStorage.getItem("zoom") != undefined) {
    	zoom = JSON.parse(localStorage.getItem("zoom"));
	    tzoom = JSON.parse(localStorage.getItem("zoom"));

	    offset = JSON.parse(localStorage.getItem("offset"));
	    toffset = JSON.parse(localStorage.getItem("offset"));
    }

    var wh = canvas.width/canvas.height;
    var hh = 1.0;
    view3D = new Matrix4().setOrtho(-wh, wh, -hh, hh, 10000, -10000);

    console.log(canvas.width);
    console.log(canvas.height);
    //canvas.width = 512 ;
    //canvas.height = 512;
    //canvas.width = canvas.clientWidth; 
    //canvas.height = canvas.clientHeight; 
    com_tfb = makeTextureFramebuffer(canvas.width, canvas.height);
    console.log(com_tfb);
    com_tfb_float = makeTextureFramebuffer(canvas.width, canvas.height, gl.FLOAT);
    console.log(com_tfb_float);
    //sor_program_FB;
    //sor_program_tex;


    tsleft = new texscreen(-1, 0, -1, 1);
    console.log(tsleft);
    tsright = new texscreen(0, 1, -1, 1);
    console.log(tsright);

    tsfull = new texscreen();
    console.log(tsfull);

    console.log(canvas);
    parseInput();

    var bbar = document.getElementById("bbar");

    canvas.onmousedown = function (ev) { click(ev); };
    bbar.onmousedown = function (ev) { click(ev); }; 

    window.onmousemove = function (ev) { move(ev); };
    window.onmouseup = function(ev) {unclick(ev);};

    canvas.ontouchstart = function (ev) { touch(ev); };
    bbar.ontouchstart = function (ev) { touch(ev); }; 
    window.ontouchmove = function (ev) { touchmove(ev); };
    canvas.ontouchmove = function(ev) { ev.preventDefault();}
    window.ontouchend = function(ev) {untouch(ev);};

    canvas.addEventListener("wheel", mouseScrolled, false);
    bbar.addEventListener("wheel", mouseScrolled, false);

    //Firefox sucks
    //canvas.addEventListener("DOMMouseScroll", mouseScrolled, false);
    //bbar.addEventListener("DOMMouseScroll", mouseScrolled, false);
    
    // Disable rightclick menu
    window.oncontextmenu = function() { return false; };

    //window.onmousedown = function(event) {console.log("Click");};
    window.onresize = function(event) { console.log(event); 
        /*
        var scalex = window.innerWidth/canvas.width;
        var scaley = window.innerHeight/canvas.height;
        var rescale = new Matrix4().scale(scalex, scaley, 1);
        scale = scale.concat(rescale);
        tscale = tscale.concat(rescale);
        */

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log(canvas.width);
        console.log(canvas.height);
        scale = [canvas.width/basewidth, canvas.height/baseheight];

        //canvas.width = canvas.clientWidth; 
        //canvas.height = canvas.clientHeight; 
        
        //com_tfb_float = make
        clearTimeout(timeout);
        timeout = setTimeout(function(){com_tfb = makeTextureFramebuffer(canvas.width, canvas.height);
        								com_tfb_float = makeTextureFramebuffer(canvas.width, canvas.height,gl.FLOAT);

        								var wh = canvas.width/canvas.height;
									    var hh = 1.0;
									    view3D = new Matrix4().setOrtho(-wh, wh, -hh, hh, 10000, -10000);
        								if(!render2D) {
        									//I was considering doing this, but maybe better to just keep at same resolution.
        									//User can go back to 2d and redo if they want rez to change
        									cleanup3D();
        									setup3D();
        								}
        								redrawScene();},
       						 100);
    };

    //requestFullScreen(canvas);
}
/*
function loadImage(ev){
  console.log(ev.target.files);
  var image = new Image();
  image.onload = function(){ loadTexture(gl, sor_tfb.tex, image);};
  image.src = $('image').value;
  

}*/

function loadTexture(gl, texture, image) {
  texture.width = image.width;
  texture.height = image.height;

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    //Required for non power of 2 textures, do manually in shader.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Set the texture parameters
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  
}


function enableDraw() {

}

function fullscreen() {
    var ever = document.getElementById("everything");
    var ficon = document.getElementById("fullscreenIcon");
    if(!(document.fullscreenElement ||
	document.webkitFullscreenElement ||
	document.mozFullScreenElement ||
	document.msFullscreenElement)) {
        console.log("enterf");
        if (ever.requestFullscreen) {
	ever.requestFullscreen();
        } else if (ever.webkitRequestFullscreen) {
	  ever.webkitRequestFullscreen();
        } else if (ever.mozRequestFullScreen) {
          ever.mozRequestFullScreen();
        } else if (ever.msRequestFullscreen) {
          ever.msRequestFullscreen();
        }
        ficon.innerHTML = "fullscreen_exit"
        //ever.requestFullscreen();
    //console.log(canvas.getBoundingClientRect());
    } else {
        console.log("exitf")
        ficon.innerHTML = "fullscreen"
      if (document.exitFullscreen) {
	document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
	document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
	document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
	document.msExitFullscreen();
      }
    }
}

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  delete link;
}

function saveImage() {
   var name = $('parserInput').value+getAllVarStrings()+".png";
   if(invert) {
     name = "inverse "+name;
   }

   name = $('numbertype').value + " " + name;
   //var data = canvas.toDataURL("image/png", 1);
   name = String(name).replace(/\*/g, '⋅');
   name = String(name).replace(/\//g, '÷');
   name = String(name).replace(/\|/g, '‖');
  console.log(name);
   canvas.toBlob(function(blob){downloadURI(URL.createObjectURL(blob), name);},"image/png", 1);

   //downloadURI(data, name);
   //var blob = new Blob(data);
   //window.download(data);
}

function resetZoom() {
	if(render2D){
    	zoom = [1,1];
    	tzoom = [1,1];
	} else {
		zoom3D = 1;
	}
    redrawScene();
}

function resetPosition() {
	if(render2D){
    	offset = [0,0];
    	toffset = [0,0];
	} else {
		currentRotationMat3D = new Matrix4();
		baseRotationMat3D = new Matrix4();
	}
    redrawScene();
}

function changeRender(){
	console.log("HELLO", render2D, $('changeRenderButton'))

	if(render2D) {
		render2D = false;
		$('changeRenderButton').textContent = "2D view";
		//Call setup for 3d render
		setup3D();
	} else {
		render2D = true;
		$('changeRenderButton').textContent = "3D view";
		//Clean 3d render and call 2d draw
		cleanup3D();
	}
	redrawScene();
}


function setup3D() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, com_tfb_float.fb);

    gl.viewport(0,0,com_tfb_float.width,com_tfb_float.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(com_program);

    gl.uniform2fv(com_program.scale, new Float32Array(scale));
    gl.uniform2fv(com_program.offset, new Float32Array(offset));
    gl.uniform2fv(com_program.zoom, new Float32Array(zoom));
    gl.uniform1i(com_program.dcoloring, dcoloring);
    gl.uniform1i(com_program.checkerboard, checkerboard);
    gl.uniform1i(com_program.originindicator, originindicator);
    gl.uniform1i(com_program.unitcircle, unitcircle);
    gl.uniform1i(com_program.infstripes, infstripes);
    gl.uniform1i(com_program.invert, invert&&!invert3D);
    gl.uniform1i(com_program.renderImage, false);


    for(var key in com_program.uniforms) {
        gl.uniform2fv(com_program.uniforms[key], com_vars[key]);
    }

    tsfull.draw(null, com_program)


    var result = new Float32Array(com_tfb_float.width*com_tfb_float.height*4);
    gl.readPixels(0,0,com_tfb_float.width,com_tfb_float.height,gl.RGBA,gl.FLOAT,result);
    surf_program.count = com_tfb_float.width*com_tfb_float.height;

    var p0 = [result[0], result[1]];
    var last = (com_tfb_float.width*com_tfb_float.height - 1)*4 -1
    var p1 = [result[last+1], result[last+2]];

    console.log(p0,p1);
    

    offset3D = [-0.5*(p0[0] + p1[0]), -0.5*(p0[1] + p1[1]), 0];
    basescale3D = 1/Math.abs((p0[1] - p1[1])*0.5);

  //Make a 3D mesh if options selected
    if( (invert3D || !invert) && makemesh){
        var resmesh = [];
        var x = 0;
        var y = 0;
        var w = com_tfb_float.width;
        var h = com_tfb_float.height;
        var xinc = 1;
        var yinc = 1;
        var step = 1;
        var maxres = 256*256*9999999;
      
        if(w*h > maxres){
          var downscale = Math.sqrt(maxres/(w*h));
          step = 1/downscale;
        }
      console.log("3D Mesh generation step: ", step);      
        for(var x = 0; x+1 < w; x+=step){
            var index = 0;
            for(var y = 0; y+1 < h; y+=step){

                index = y*w + x;
              index = Math.round(index);
              index*=4;
              


                if(limitdomain3D && invert && (result[index+2] < p0[0] || result[index+3] < p0[1] || result[index+2] > p1[0] || result[index+3] > p1[1])){
                    continue;
                }

                for(var i = 0; i<4; i++){
                    resmesh.push(result[index+i]);
                }
              
              index = y*w + x+step;
              index = Math.round(index);
              index*=4;                
                for(var i = 0; i<4; i++){
                    resmesh.push(result[index+i]);
                }
              
              index = (y+step)*w + x;
              index = Math.round(index);
              index*=4;
              for(var i = 0; i<4; i++){
                    resmesh.push(result[index+i]);
                }

                index = (y+step)*w + x+step;
                index = Math.round(index);
              index*=4;
                for(var i = 0; i<4; i++){
                    resmesh.push(result[index+i]);
                }

                index = y*w + x+step;
                index = Math.round(index);
              index*=4;
                for(var i = 0; i<4; i++){
                    resmesh.push(result[index+i]);
                }

              index = (y+step)*w + x;
              index = Math.round(index);
              index*=4;
                for(var i = 0; i<4; i++){
                    resmesh.push(result[index+i]);
                }
            }
        }
       
        result = new Float32Array(resmesh);
        surf_program.count = resmesh.length/4;
    }
    else if(invert3D && limitdomain3D){
      var newresult = [];
      for(var index = 0; index < result.length; index+=4){
        if(result[index+2] < p0[0] || result[index+3] < p0[1] || result[index+2] > p1[0] || result[index+3] > p1[1]){
          continue;
        }
        for(var i = 0; i<4; i++){
          newresult.push(result[index+i]);
        }
        
      }
      result = new Float32Array(newresult);
      surf_program.count = result.length/4;
      
    }


    surf_program.vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, surf_program.vbuf);
	gl.bufferData(gl.ARRAY_BUFFER, result, gl.STATIC_DRAW);
	gl.vertexAttribPointer(surf_program.pos, 4, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(surf_program.pos);
    //$('info').innerHTML = ("<t>"+(result)+"</t>").replace(/,/g,", ");
    //console.log(result);

    



}



function cleanup3D(){
	gl.deleteBuffer(surf_program.vbuf);
}

function redraw3D() {

	console.log("rd3d")
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(surf_program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, surf_program.vbuf);
	gl.vertexAttribPointer(surf_program.pos, 4, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(surf_program.pos);

	//var vmat = new Matrix4().setOrtho(-2, 2, -2, 2, 0.1, 999999999);
	gl.uniformMatrix4fv(surf_program.view, false, view3D.elements);

	//var rmat = new Matrix4();
	gl.uniformMatrix4fv(surf_program.rot, false, currentRotationMat3D.elements);


	console.log(offset3D, basescale3D);
	gl.uniform3fv(surf_program.offset, new Float32Array(offset3D));
	gl.uniform1f(surf_program.basescale, basescale3D);
	gl.uniform1f(surf_program.zoom, zoom3D);


	gl.uniform1i(surf_program.dcoloring, dcoloring);
    gl.uniform1i(surf_program.checkerboard, checkerboard);
    gl.uniform1i(surf_program.originindicator, originindicator);
    gl.uniform1i(surf_program.unitcircle, unitcircle);
    gl.uniform1i(surf_program.infstripes, infstripes);
    gl.uniform1i(surf_program.invert, invert3D&&invert);

    var imtex = sor_tfb.tex;
    gl.uniform2fv(surf_program.texscale, new Float32Array([512/imtex.width,512/imtex.height]));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imtex);
    gl.uniform1i(surf_program.sam, 0);

    
    if((invert3D || !invert)&&makemesh){
		gl.drawArrays(gl.TRIANGLES, 0, surf_program.count);
	} else {
		gl.drawArrays(gl.POINTS, 0, surf_program.count);
	}
}

//var t = 1.0;
function redrawScene(cx =0, cy=0, pick=false, ox, oy){

	if(!render2D) {
		redraw3D();
		return;
	}




    //console.log("redrawScene!!!");


    //Render the texture under f(z)

    gl.bindFramebuffer(gl.FRAMEBUFFER, com_tfb.fb);


    //var xmin = com_tfb.width - basewidth;
    //var ymin = com_tfb.height - baseheight;

    gl.viewport(0,0,com_tfb.width,com_tfb.height);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(com_program);



    //basezoom = new Matrix4().setScale(1, 1, 1);
    //console.log(scale.elements);
    //console.log(com_program.scale);
    gl.uniform2fv(com_program.scale, new Float32Array(scale));
    gl.uniform2fv(com_program.offset, new Float32Array(offset));
    gl.uniform2fv(com_program.zoom, new Float32Array(zoom));
    gl.uniform1i(com_program.dcoloring, dcoloring);
    gl.uniform1i(com_program.checkerboard, checkerboard);
    gl.uniform1i(com_program.originindicator, originindicator);
    gl.uniform1i(com_program.unitcircle, unitcircle);
    gl.uniform1i(com_program.infstripes, infstripes);
    gl.uniform1i(com_program.invert, invert);
    gl.uniform1i(com_program.renderImage, true);

    var imtex = sor_tfb.tex;
    gl.uniform2fv(com_program.texscale, new Float32Array([512/imtex.width,512/imtex.height]));
  //gl.uniform2fv(com_program.texscale, new Float32Array([1,1]));
    for(var key in com_program.uniforms) {
        gl.uniform2fv(com_program.uniforms[key], com_vars[key]);
    }


    tsfull.draw(sor_tfb.tex, com_program)



    //gl.program = sor_program;
    //Render to com_program_texture

    //Draw both to each half of main window

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.useProgram(tex_draw_program);
    gl.uniform2fv(tex_draw_program.offset, new Float32Array([0,0]));
    gl.uniform2fv(tex_draw_program.zoom, new Float32Array([1,1]));
    //tsleft.draw(sor_tfb.tex, tex_draw_program);
    //tsright.draw(com_tfb.tex, tex_draw_program);
    tsfull.draw(com_tfb.tex, tex_draw_program);

    //gl.useProgram(com_program);

    
    //gl.useProgram(poly_program);
    //gl.clear(gl.DEPTH_BUFFER_BIT);
    //divider.draw();
    
}

function redrawTex(offset, zoom=[1,1]) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(tex_draw_program);
    gl.uniform2fv(tex_draw_program.offset, new Float32Array(offset));
    gl.uniform2fv(tex_draw_program.zoom, new Float32Array(zoom));
    //tsleft.draw(sor_tfb.tex, tex_draw_program);
    //tsright.draw(com_tfb.tex, tex_draw_program);
    tsfull.draw(com_tfb.tex, tex_draw_program);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
}


//Create a new vertex buffer
function make_buffer(gl) {
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    return vertexBuffer;
}


function TFB() {
    this.fb;
    this.tex;
    this.width;
    this.height;
}

function makeTextureFramebuffer(width, height, type=gl.UNSIGNED_BYTE) {
    //Create Framebuffer
    var newfb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, newfb);
    newfb.width = width;
    newfb.height = height;

    //Create texture
    var newtex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, newtex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    
    //Create depth buffer
    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    //Assign texture and depth buffer to framebuffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, newtex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    console.log(e);
    if(e !== gl.FRAMEBUFFER_COMPLETE) {
        console.log('Framebuffer object is incomplete: ' + e.toString());
    }

    //Restore to defaults
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    tfb = new TFB();
    tfb.fb = newfb;
    tfb.tex = newtex;
    tfb.width = width;
    tfb.height = height;
    console.log(tfb.fb, tfb.tex);
    return tfb;
}


var x0 = 0;
var y0 = 0;

var zoomx = 1;
var zoomy = 1;

var clicked = false;

function click(ev) {
    clicked = true; //Used to have this at then end, shouldn't matter

    if(render2D) {
	    x0 = (2*ev.clientX/canvas.width)*(scale[0]*zoom[0]);
	    y0 = (2*ev.clientY/canvas.height)*(scale[1]*zoom[1]);
	} else {
		x0 = (2*ev.clientX/canvas.width);
	    y0 = (2*ev.clientY/canvas.height);
		//3D rotate
	}
    
   
}

function unclick(ev) {

    if(!clicked) return false;

    clicked = false;
    //console.log("unclick");
    var x = (2*ev.clientX/canvas.width);
	var y = (2*ev.clientY/canvas.height);

    if(render2D) {
	    x *= (scale[0]*zoom[0]);
	    y *= (scale[1]*zoom[1]);

	    //console.log(x0, y0, x, y);

	    toffset[0] -= (x-x0);
	    toffset[1] += (y-y0);

	    offset[0] = toffset[0];
	    offset[1] = toffset[1];

	    //Only redraw if movement occured.
	    if( x-x0 != 0 || y-y0 != 0){ 
	        redrawScene();
	    }
	} else {
		//3D rotate
	    var clickVector = [x-x0, y-y0];
	    console.log(clickVector)
        var rotAxis = [-clickVector[1], clickVector[0], 0];
        var rotAmt = 90* Math.sqrt(clickVector[0]*clickVector[0] + clickVector[1]*clickVector[1]);

        if(rotAmt != 0){
        	var trmat = new Matrix4().setRotate(rotAmt, rotAxis[0], -rotAxis[1], rotAxis[2]);
        	/*
        	currentRotationMat3D = baseRotationMat3D.concat(trmat);
        	baseRotationMat3D = new Matrix4().concat(currentRotationMat3D);
        	*/
        	currentRotationMat3D = trmat.concat(baseRotationMat3D);
        	baseRotationMat3D = new Matrix4().concat(currentRotationMat3D);

    	}

    	redrawScene();
	}


	/*


	SAVE ZOOM/POSITION


    */
    localStorage.setItem("zoom", JSON.stringify(zoom));
    localStorage.setItem("offset", JSON.stringify(offset));
}

function move(ev) {
    if(!clicked) return;
    //console.log("move");

    var x = (2*ev.clientX/canvas.width);
	var y = (2*ev.clientY/canvas.height);

    if(render2D) {
	    x *= (scale[0]*zoom[0]);
	    y *= (scale[1]*zoom[1]);

	    //console.log(x0, y0, x, y);

	    offset[0] = toffset[0] - (x-x0);
	    offset[1] = toffset[1] + (y-y0);

	    var ofs = [1*-(x-x0)/(zoom[0]*scale[0]), 1*(y-y0)/(zoom[1]*scale[1])];

	    if(redrawmove){
	        redrawScene();
	    } else {
	        redrawTex(ofs);
	    }
	} else {
		//3D rotate
		var clickVector = [x-x0, y-y0];
        var rotAxis = [-clickVector[1], clickVector[0], 0];
        var rotAmt = 90* Math.sqrt(clickVector[0]*clickVector[0] + clickVector[1]*clickVector[1]);

        if(rotAmt != 0){
        	var trmat = new Matrix4().setRotate(rotAmt, rotAxis[0], -rotAxis[1], rotAxis[2]);
        	//currentRotationMat3D = new Matrix4().set(baseRotationMat3D).multiply(trmat);

        	currentRotationMat3D = new Matrix4().set(trmat).multiply(baseRotationMat3D);
        	//baseRotationMat3D = new Matrix4().concat(currentRotationMat3D);
        }

    	redrawScene();
	}

}

function zoom_to_point(inx, iny, zoomAmt) {
    var dz = zoom[0] - zoom[0]*zoomAmt;

    zoom[0] *= zoomAmt;
    zoom[1] *= zoomAmt;
    tzoom[0] = zoom[0];
    tzoom[1] = zoom[1];


    //Shift offset so mouse stays at the same position;
    var x = (2*inx/canvas.width -1) *(scale[0]);
    var y = -(2*iny/canvas.height -1) *(scale[1]);
    offset[0] += x*dz;
    offset[1] += y*dz;
    toffset[0] = offset[0];
    toffset[1] = offset[1]

    return [x*dz/scale[0], y*dz/scale[1]];
    //redrawScene();
}


function mouseScrolled(ev) {
	
    var delta = ev.wheelDelta;
    if(delta == undefined) {
        console.log(delta)
        console.log(ev.deltaY);
        delta = Math.sign(ev.deltaY)/10;
    } else {
        delta /= -1200;
    }


    var zoomAmt = Math.pow(2, delta); //-ev.wheelDelta/1200
    console.log(delta);
    console.log("scrolled");

	if(render2D) {
	    var ofs = zoom_to_point(ev.clientX, ev.clientY, zoomAmt);

	    clearTimeout(timeout);
	    timeout = setTimeout(endscroll,  100);

	    totalzoom *= zoomAmt;

	    totalofs[0] += ofs[0]/(initialZoom);
	    totalofs[1] += ofs[1]/(initialZoom);


	    //totalofs[0] /= initialZoom;
	    //totalofs[1] /= initialZoom;
	    //totalofs = add(totalofs, ofs);
	    //totalofs = div(totalofs, initialZoom);
	    
	    //firstResize = false;
	    //redrawScene();
	    if(redrawzoom){
	        redrawScene();
	    } else {
	        redrawTex(totalofs, [totalzoom, totalzoom]);
	    }
	} else {
		//3D zoom
		zoom3D /= zoomAmt;
		redrawScene();
	}
    
}

function endscroll() {
    totalofs = [0,0];
    totalzoom = 1;
    initialZoom = zoom[0];

    toffset[0] = offset[0];
    toffset[1] = offset[1];

    /*


	SAVE ZOOM/POSITION


    */
    localStorage.setItem("zoom", JSON.stringify(zoom));
    localStorage.setItem("offset", JSON.stringify(offset));


    redrawScene();
}


var touched = false;

function touch(ev) {

    //console.log("touch");
    totalofs = [0,0];
    totalzoom = 1;
    initialZoom = zoom[0];
    var te0 = ev.touches[0];

    x0 = (2*te0.pageX/canvas.width);
    y0 = (2*te0.pageY/canvas.height);

    if(render2D) {
    	x0 *=(scale[0]*zoom[0]);
		y0 *=(scale[1]*zoom[1]);
    } 

    console.log(x0, y0);
    touched = true;
}


var lastx = null;
var lasty = null;

function untouch(ev) {

    if(!touched) return false;
    firstResize = true;
    totalofs = [0,0];
    totalzoom = 1;
    touched = false;
    //console.log("untouch");

    //var te0 = ev.touches[0];

    //var x = (2*te0.pageX/canvas.width)*(scale[0]*zoom[0]);
    //var y = (2*te0.pageY/canvas.height)*(scale[1]*zoom[1]);

   // console.log(x0, y0, x, y);
   	if(render2D) {
	    toffset[0] = offset[0];
	    toffset[1] = offset[1];

	    if(moved){
	        redrawScene();
	    }
	} else {
		if(lastx != null) {
			var clickVector = [lastx-x0, lasty-y0];
	        var rotAxis = [-clickVector[1], clickVector[0], 0];
	        var rotAmt = 90* Math.sqrt(clickVector[0]*clickVector[0] + clickVector[1]*clickVector[1]);

	        if(rotAmt != 0){
	        	var trmat = new Matrix4().setRotate(rotAmt, rotAxis[0], -rotAxis[1], rotAxis[2]);
	        	//currentRotationMat3D = new Matrix4().set(baseRotationMat3D).multiply(trmat);

	        	currentRotationMat3D = trmat.concat(baseRotationMat3D);
        		baseRotationMat3D = new Matrix4().concat(currentRotationMat3D);
	        	//baseRotationMat3D = new Matrix4().concat(currentRotationMat3D);
	        }

	    	redrawScene();
		}
	}
	lastx = null;
	lasty = null;
    moved = false;


        /*


	SAVE ZOOM/POSITION


    */
    localStorage.setItem("zoom", JSON.stringify(zoom));
    localStorage.setItem("offset", JSON.stringify(offset));

}

//var tp0 = [0,0];
//var tp1 = [0,0];
var oldDist = 1;
var firstResize = true;
var totalofs = [0,0];
var totalzoom = 1;
var initialZoom = 1;
if(localStorage.getItem('zoom') != undefined) {
	initialZoom = JSON.parse(localStorage.getItem('zoom'))[0];
}


var moved = false;

function touchmove(ev) {
    //ev.preventDefault();

    if(!touched) return;
    //console.log("touchmove");

    lastx = null;
	lasty = null;

    var te0 = ev.touches[0];
    var te1 = ev.touches[1];
    moved = true;
    //console.log(ev.touches[1]);
    //console.log(ev.touches);

    if(te1 == undefined) {
        var x = (2*te0.pageX/canvas.width)
        var y = (2*te0.pageY/canvas.height)

        //console.log(x0, y0, x, y);

        if(render2D) {
        	x *=(scale[0]*zoom[0]);
			y *=(scale[1]*zoom[1]);
	        offset[0] = toffset[0] - (x-x0);
	        offset[1] = toffset[1] + (y-y0);

	        var ofs = [-(x-x0)/(zoom[0]*scale[0]), (y-y0)/(zoom[1]*scale[1])];
	        if(redrawmove){
	            redrawScene();
	        } else {
	            redrawTex(ofs);
	        }
	    } else {
	    	var clickVector = [x-x0, y-y0];
	    	lastx = x;
	    	lasty = y;
	        var rotAxis = [-clickVector[1], clickVector[0], 0];
	        var rotAmt = 90* Math.sqrt(clickVector[0]*clickVector[0] + clickVector[1]*clickVector[1]);

	        if(rotAmt != 0){
	        	var trmat = new Matrix4().setRotate(rotAmt, rotAxis[0], -rotAxis[1], rotAxis[2]);
	        	//currentRotationMat3D = new Matrix4().set(baseRotationMat3D).multiply(trmat);

	        	currentRotationMat3D = new Matrix4().set(trmat).multiply(baseRotationMat3D);
	        	//baseRotationMat3D = new Matrix4().concat(currentRotationMat3D);
	        }

	    	redrawScene();
	    }
    } else {
        var p0 = [te0.pageX, te0.pageY, 0];
        var p1 = [te1.pageX, te1.pageY, 0];
        //console.log(p0);
        //console.log(p1);

        var center = [(p0[0] + p1[0])/2, (p0[1] +p1[1])/2];

        //console.log(center);

        var dist = norm(sub(p1, p0));
        //console.log(dist);
        if(firstResize) {
            oldDist = dist;
        }
        firstResize = false;

        //console.log(oldDist)
        var zoomAmt = oldDist/dist;
        oldDist = dist;

        console.log(zoomAmt);
        if(render2D) {
	        var ofs = zoom_to_point(center[0], center[1], zoomAmt);
	        //ofs[0] /= (zoom[0]*scale[0]);
	        //ofs[1] /= (zoom[1]*scale[1]);
	        //console.log("ofs:");
	        //console.log(ofs);
	        
	        totalzoom *= zoomAmt;

	        totalofs[0] += ofs[0]/(initialZoom);
	        totalofs[1] += ofs[1]/(initialZoom);


	        //totalofs[0] /= initialZoom;
	        //totalofs[1] /= initialZoom;
	        //totalofs = add(totalofs, ofs);
	        //totalofs = div(totalofs, initialZoom);
	        
	        
	        //redrawScene();
	        if(redrawzoom){
	            redrawScene();
	        } else {
	            redrawTex(totalofs, [totalzoom, totalzoom]);
	        }
	    } else {
	    	zoom3D /= zoomAmt;
	    	console.log(zoomAmt);
	    	redrawScene();
	    }

    }

    //tp0 = [te0.pageX, te0.pageY];
    //tp1 = [te1.pageX, te1.pageY];
    //redrawScene();
}



