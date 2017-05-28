function cross(A, B){
    return [A[1]*B[2]-A[2]*B[1], 
            A[2]*B[0]-A[0]*B[2], 
            A[0]*B[1]-A[1]*B[0]
           ];
}

function sub(A, B) {
    return [A[0] - B[0], 
            A[1] - B[1], 
            A[2] - B[2]];
}

function add(A, B) {
    return [A[0] + B[0], 
            A[1] + B[1], 
            A[2] + B[2]];
}

function div(A, s) {
    return [A[0]/s, 
            A[1]/s, 
            A[2]/s];
}

function mul(A, s) {
    return [A[0]*s, 
            A[1]*s, 
            A[2]*s];
}

function dot(A, B) {
    return (A[0] * B[0]) + (A[1] * B[1]) + (A[2] * B[2]);
}

function norm(A) {
    return Math.sqrt(A[0]*A[0] + A[1]*A[1] + A[2]*A[2]);
}

function normalize(A) {
    return div(A, norm(A));
}

//vec1 == vec2
function veceq(vec1, vec2) {
    for(var i = 0; i < 3; i++) {
        if (vec1[i] != vec2[i]) {
            return false;
        }
    }
    return true;
}
/*
//Returns the location of vec in arr, or -1 if not found
function location(arr, vec){
    for(var i = 0; i < arr.length; i++){
         arrvec = arr[i];
         if(veceq(arrvec, vec)) return i;
    }
    return -1;
}*/



var ambColor = [0, 0, 0.2];
var plpos = [0,500,0];
var plcol = [1,1,0,1];



var cubeverts = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

for (var i = 0; i < cubeverts.length; i++) {
    cubeverts[i]*=0.1;
    if(i%3 == 1) cubeverts[i] += 0.8;
}

var cubeindices = new Uint16Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

var cubecolor = [1,1,0,1];

var lightlineverts = [0,0,0, 500,500,500];
var lightlinecolor = [1, 0,0,1]


/* Literal garbage legacy code*/

// Bind a vertex buffer and updtate its data
function update_vbuf(gl, vbuf, arr, pos) {
    // Enable the assignment to pos variable
    gl.enableVertexAttribArray(pos);

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);

    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);

}

function update_buffers(gl, vbuf, ibuf, varr, iarr, pos) {
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(varr), gl.STATIC_DRAW);
    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pos);
    
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    // Write date into the buffer object
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(iarr), gl.STATIC_DRAW);
    
}

function update_bufferscol(gl, vbuf, ibuf, varr, iarr, pos, carr) {
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(varr), gl.STATIC_DRAW);
    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pos);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(carr), gl.STATIC_DRAW);
    gl.vertexAttribPointer(col, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(col);
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    // Write date into the buffer object
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(iarr), gl.STATIC_DRAW);
    
}

/*
///////////////////////// UPDATER FUNCTIONS ////////////////////////////
*/

var showNormals = true;
function toggleNormals()
{
    showNormals = !showNormals;
    redrawScene();
}

var sorcolor = [1, 0, 0];

function colorChange() {   
    var r = document.getElementById("redRange").value/255;
    var g = document.getElementById("greenRange").value/255;
    var b = document.getElementById("blueRange").value/255;

    sorcolor = [r, g, b];
    redrawScene();
}

var flat_shading = true;

function toggleSmooth() {
    flat_shading = !flat_shading;
    redrawScene();
}

var specular = true;

function toggleSpecular() {
    specular = !specular;
    redrawScene();
}


var alpha = 1;
var refColor = [0,1,0];

function alphaChange() {
    alpha = document.getElementById("alphaRange").value;
    redrawScene();
}

function scolorChange() {   
    var r = document.getElementById("sredRange").value/255;
    var g = document.getElementById("sgreenRange").value/255;
    var b = document.getElementById("sblueRange").value/255;

    refColor = [r, g, b];
    redrawScene();
}

var showpointl = true;
var showdirl = true;

function toggleOrtho() {
    showOrtho = !showOrtho;
    redrawScene();
}

var showOrtho = true;

//======================================================

function getShaderText(id) {
    //console.log(id, ": ", document.getElementById(id).text);
    return document.getElementById(id).text;
} 

function createProgramFromid(gl, id1, id2){
    return createProgram(gl, getShaderText(id1), getShaderText(id2));
}

//=======================================================

//Actually need to make this work with local storage roo
var current_com_uniforms = [];


function update_com_uniforms() {

}




parsedString = "z";
com_t = [1,0];

initial_com_t = [1,0];

com_vars = {};

function getVarString(v) {
    return ";"+v+"="+document.getElementById(v+"sliderre").value/1.0+"+"+document.getElementById(v+"sliderim").value/1.0+"i";
}

function getAllVarStrings() {
    var strings = "";
    for(var key in com_program.uniforms) {
        strings += getVarString(key);
    }
    return strings;
}

function updateVar(v) {
    console.log(v);
    var val=[document.getElementById(v+"sliderre").value/1.0, 
             document.getElementById(v+"sliderim").value/1.0];
    com_vars[v] = val;
    console.log(com_vars[v])
    localStorage.setItem(v, JSON.stringify(val));
    //initial_com_t = com_v;

    if(!render2D){
    	cleanup3D();
    	setup3D();
    }

    redrawScene();
}

function getVarInit(v) {
    var ls = localStorage.getItem(v);
    if(localStorage.getItem(v) != null) {
        return JSON.parse(ls);
    } else {
        return [1,0];
    }
}

function resetVar(v) {
    document.getElementById(v+'sliderre').value = 1.0;
    document.getElementById(v+'sliderim').value = 0; 
    updateVar(v);
}

function updateTVar() {
    com_t = [document.getElementById("tsliderre").value/1.0, 
             document.getElementById("tsliderim").value/1.0];
    localStorage.setItem("com_t", com_t);
    initial_com_t = com_t;
    redrawScene();
}

    
function resetTvar() {
    document.getElementById('tsliderre').value = 1.0;
    document.getElementById('tsliderim').value = 0; 
    updateTVar();
}

/*
com_tr = 0.0;

function updateTr() {
    com_t = [document.getElementById("tsliderre").value/1.0, 
                   document.getElementById("tsliderim").value/1.0];
    redrawScene();
}
*/

if(localStorage.getItem("inputString") != undefined && (window.location.hash == '')) {
    document.getElementById("parserInput").value = localStorage.getItem("inputString");
} else if (window.location.hash != ''){
	$("parserInput").value = decodeURI(window.location.hash.substring(1));
}
/*
if(localStorage.getItem("com_t") != undefined) {
    initial_com_t = JSON.parse("["+localStorage.getItem("com_t")+"]");
    //console.log(initial_com_t);
}*/


var aasamples = 1;

if(localStorage.getItem("aasamples") != undefined) {
    aasamples = localStorage.getItem("aasamples");
    $('aaLevel').value = aasamples;
    console.log("AA:", aasamples)
}

function setAA(){
    aasamples = Math.floor(document.getElementById("aaLevel").value);
    localStorage.setItem("aasamples", aasamples);
    parseInput();
}

function parseInput() {
    //console.log(gl);
    var input = document.getElementById("parserInput").value.toLowerCase();
    var parsed = '';

    localStorage.setItem("inputString", input);


    input = input.replace(/\⋅/g, '*')
				 .replace(/\÷/g, '/')
				 .replace(/\‖/g, '|')
				 .replace(/\√/g, 'sqrt')
				 .replace(/\ζ/g, 'zeta')
				 .replace(/\γ/g, 'gamma')
				 .replace(/\π/g, 'pi')
				 .replace(/\∫/g, '$')
				 .replace(/\∑/g, 'sum')
				 .replace(/\Γ/g, 'gamma');
				 

		//		 .replace()


    try {
        var functions;
        var uniforms;
        var result = parser.parse(input);

        parsed = result['parsed'][0];
        functions = result['functions'];
        uniforms = result['uniforms'];
        valfun = $('valfun').value.toLowerCase();

        var satfun = $('satfun').value.toLowerCase();
        var huefun = $('huefun').value.toLowerCase();

        var inviters = $('inviters').value.toLowerCase();
        var invtries = $('invtries').value.toLowerCase();

        console.log(parsed);

        parsed = parsed.replace(/csc/g, "ccsc")
                        .replace(/sec/g, "csec")
                        .replace(/cot/g, "ccot")
                        .replace(/sin/g, "csin")
                        .replace(/cos/g, "ccos")
                        .replace(/tan/g, "ctan")
                        .replace(/pow/g, "cpow")
                        .replace(/log/g, "clog")
                        .replace(/arg/g, "carg")
                        .replace(/exp/g, "cexp")
                        .replace(/sqrt/g, "csqrt")
                        .replace(/rand/g, "crand");

        functions = functions.replace(/csc/g, "ccsc")
                        .replace(/sec/g, "csec")
                        .replace(/cot/g, "ccot")
                        .replace(/sin/g, "csin")
                        .replace(/cos/g, "ccos")
                        .replace(/tan/g, "ctan")
                        .replace(/pow/g, "cpow")
                        .replace(/log/g, "clog")
                        .replace(/arg/g, "carg")
                        .replace(/exp/g, "cexp")
                        .replace(/sqrt/g, "csqrt")
                        .replace(/rand/g, "crand");


        var parserOutput = "\nUniforms: \n"+uniforms +"\nFunctions: \n"+functions+"\nExpression: "+parsed;


        console.log(input,"->",parserOutput);
        //document.getElementById("parserOutput").innerHTML = "Parsed as: "+parserOutput;
        document.getElementById("parserOutput").innerHTML = "";
        //parsedString = parsed;
        //console.log("expr:", parsed);
        //console.log(parsed);
        //console.log("functions:", functions);
        //console.log(functions);

        //var shad = getShaderText("complexfs-incomplete");
        //console.log(shad);
        //console.log(shad.replace("$parsed$", parsed));

        /*
        console.log(getShaderText("complexfs-incomplete").replace(/\/\/.*($|\n)/g, '' )
                                                                         .replace(/\$parsed\$/g, parsed)
                                                                         .replace(/\$aasamples\$/g, aasamples)
                                                                         .replace(/\$uniforms\$/g, uniforms)
                                                                         .replace(/\$functions\$/g, functions)
                                                                         .replace(/\$valfun\$/g, valfun));
        */

        //console.log("AASAMPLES\n\n\n\n\n\n"+aasamples+"\n\n\n\n\n\n");
        var vshader = getShaderText("complexvs");
        console.log($('numbertype').value);
        console.log($('numbertype').value+"fs-incomplete");
        var fshader = getShaderText($('numbertype').value+"fs-incomplete").replace(/\/\/.*($|\n)/g, '' )
                                                                         .replace(/\$parsed\$/g, parsed)
                                                                         .replace(/\$aasamples\$/g, aasamples)
                                                                         .replace(/\$uniforms\$/g, uniforms)
                                                                         .replace(/\$functions\$/g, functions)
                                                                         .replace(/\$valfun\$/g, valfun)
                                                                         .replace(/\$satfun\$/g, satfun)
                                                                         .replace(/\$huefun\$/g, huefun)
                                                                         .replace(/\$inviters\$/g, inviters)
                                                                         .replace(/\$invtries\$/g, invtries);

        //console.log(fshader);
        //console.log("\n\n\n\n\n");
        //console.log(fshader.slice(fshader.indexOf("aasamples")));
        //console.log("AA Samples: "+aasamples);

        com_program = createProgram(gl, vshader, fshader);

        com_program.pos = gl.getAttribLocation(com_program, "pos");
        com_program.tcoord = null
        com_program.sam = gl.getUniformLocation(com_program, "sam");

        com_program.scale = gl.getUniformLocation(com_program, "scale");
        com_program.offset = gl.getUniformLocation(com_program, "offset");
        com_program.zoom = gl.getUniformLocation(com_program, "zoom");


        com_program.dcoloring = gl.getUniformLocation(com_program, "dcoloring");
        com_program.checkerboard = gl.getUniformLocation(com_program, "checkerboard");
        com_program.originindicator = gl.getUniformLocation(com_program, "originindicator");
        com_program.unitcircle = gl.getUniformLocation(com_program, "unitcircle");
        com_program.infstripes = gl.getUniformLocation(com_program, "infstripes");
        com_program.invert = gl.getUniformLocation(com_program, "invert");

        com_program.renderImage = gl.getUniformLocation(com_program, "renderImage");
        com_program.texscale = gl.getUniformLocation(com_program, "texscale");



        //This whole section needs to output sliders for each declared variable, needs to
        //add them to the program too
        //Maybe a com_program uniform_location array

        //com_program.t = gl.getUniformLocation(com_program, "t");
        com_program.uniforms = {};

        //com_vars = {};

        console.log(com_program);
        console.log( result['uniform_names']);
        document.getElementById("tslider").innerHTML = "";
        for(var i = 0; i < result['uniform_names'].length; i++) {
            var item = result['uniform_names'][i];
            console.log("UNAME: ",item);
                    //Check if the variable t was used
            
            var init = getVarInit(item);
            com_vars[item] = init;
            com_program.uniforms[item] = gl.getUniformLocation(com_program, item);

            console.log(item);
            $("tslider").innerHTML +=
            'Sliders for variable <b>'+item+'</b>:<br>\
             Real: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; -1<input type="range" id="'+item+'sliderre" min="-1.0" max="1.0" value="1.0" step="0.025" oninput="updateVar(\''+item+'\')">1<br>\
             Imaginary:&nbsp; -1<input type="range" id="'+item+'sliderim" min="-1.0" max="1.0" value="0.0" step="0.025" oninput="updateVar(\''+item+'\')">1<br>\
             <button onclick="resetVar(\''+item+'\')">Reset variable <b>'+item+'<b></button><br>\
            ';
            
            $(item+'sliderre').value = init[0]*1.0;
            $(item+'sliderim').value = init[1]*1.0;

            //console.log(item, $(item+'sliderre').value)

                //updateVars();
            /*
            if(item.search(/(^|[^a-zA-Z])+t([^a-zA-Z]+|$)/) != -1) {
                document.getElementById("tslider").innerHTML = 
                'Sliders for variable <b>t</b>:<br>\
                 Real: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; -1<input type="range" id="tsliderre" min="-1.0" max="1.0" value="1.0" oninput="updateTVar()">1<br>\
                 Imaginary:&nbsp; -1<input type="range" id="tsliderim" min="-1.0" max="1.0" value="0.0" oninput="updateTVar()">1<br>\
                 <button onclick="resetTvar()">Reset variable <b>t<b></button>\
                ';
                document.getElementById('tsliderre').value = initial_com_t[0]*1.0;
                document.getElementById('tsliderim').value = initial_com_t[1]*1.0;

                updateTVar();
                return;
            } else {
                document.getElementById("tslider").innerHTML = "";
                initial_com_t = [1,0];
            } 
            */
        }
        console.log(com_vars)

        window.location.hash = '#' + encodeURI($("parserInput").value);




    }
    catch(err) {
        document.getElementById("parserOutput").innerHTML = err.message;
    }

    if(!render2D) {
		cleanup3D();
		setup3D();
	}
    redrawScene();
}

