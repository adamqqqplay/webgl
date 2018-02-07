//
// This program is written by adamqqq (adamqqq@163.com)
//

var canvas;
var gl;
var program

var vBuffer = new Array()
var cBuffer = new Array()

var points = initArray([])
var colors = initArray([])
var normals = initArray([])
var vertices = initArray([])

var axis = initArray(0)
var xAxis = initArray(0)
var yAxis = initArray(1)
var zAxis = initArray(2)
var theta = initArray([0, 0, 0])
var zoom = initArray([1.0, 1.0, 1.0])
var trans = initArray([0, 0, 0])
var pause = initArray(true)

var thetaLoc;
var transLoc;
var zoomLoc;

//light system
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(0.8, 0.8, 0.8, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
var materialSpecular = vec4(0.8, 0.8, 0.8, 1.0);
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
//end light system

//texture
var texture1, texture2;
var t1, t2;
var color;
var texCoordsArray = [];
var texSize = 16;

// Create a checkerboard pattern using floats
var image1 = new Array()
for (var i = 0; i < texSize; i++)  image1[i] = new Array();
for (var i = 0; i < texSize; i++)
	for (var j = 0; j < texSize; j++)
		image1[i][j] = new Float32Array(4);
for (var i = 0; i < texSize; i++) for (var j = 0; j < texSize; j++) {
	var color = 50 + 100 * Math.sin(i * j)
	image1[i][j] = [255 - color, color, 50, 0.9];
}

// Convert floats to ubytes for texture
var image2 = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; i++)
	for (var j = 0; j < texSize; j++)
		for (var k = 0; k < 4; k++)
			image2[4 * texSize * i + 4 * j + k] = 255 * image1[i][j][k];

var texCoord = [
	vec2(0, 0),
	vec2(0, 1),
	vec2(1, 1),
	vec2(1, 0)
];

function configureTexture(image) {
	texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
		gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
		gl.NEAREST_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

//end texture

var vertexColors = new Array()
vertexColors[0] = [
	[255 / 255, 229 / 255, 0 / 255, 1.0],
	[81 / 255, 255 / 255, 0 / 255, 1.0],
	[255 / 255, 25 / 255, 25 / 255, 1.0],
	[0 / 255, 60 / 255, 255 / 255, 1.0],
	[0 / 255, 255 / 255, 170 / 255, 1.0],
	[0 / 255, 255 / 255, 170 / 255, 1.0],
	[0 / 255, 255 / 255, 170 / 255, 1.0],
	[0 / 255, 255 / 255, 170 / 255, 1.0],
];

vertexColors[3] = [
	[0.85, 0.45, 0.85, 1.0],  // red
	[1.0, 0.92, 0.5, 1.0],  // yellow
	[0.0, 0.8, 0.8, 1.0],  // green
	[0.7, 0.2, 1.0, 1.0],  // blue
	[0.78, 0.7, 0.9, 1.0],  // cyan
	[0.78, 0.7, 0.9, 1.0],  // cyan
	[0.78, 0.7, 0.9, 1.0],  // cyan
	[0.78, 0.7, 0.9, 1.0],  // cyan
];
vertexColors[1] = [
	[143 / 255, 169 / 255, 214 / 255, 1.0],
	[114 / 255, 21 / 255, 50 / 255, 1.0],
	[224 / 255, 192 / 255, 171 / 255, 1.0],
	[50 / 255, 51 / 255, 65 / 255, 1.0],
	[67 / 255, 80 / 255, 100 / 255, 1.0],
	[67 / 255, 80 / 255, 100 / 255, 1.0],
	[67 / 255, 80 / 255, 100 / 255, 1.0],
	[67 / 255, 80 / 255, 100 / 255, 1.0],
];

vertexColors[2] = [
	[95 / 255, 217 / 255, 205 / 255, 1.0],
	[234 / 255, 247 / 255, 134 / 255, 1.0],
	[255 / 255, 181 / 255, 161 / 255, 1.0],
	[184 / 255, 255 / 255, 184 / 255, 1.0],
	[184 / 255, 244 / 255, 255 / 255, 1.0],
	[184 / 255, 244 / 255, 255 / 255, 1.0],
	[184 / 255, 244 / 255, 255 / 255, 1.0],
	[184 / 255, 244 / 255, 255 / 255, 1.0],
];

function getNormal(a, b, c) {
	var vector = new Array()
	vector[1] = vec4(a[0], a[1], a[2], 1)
	vector[2] = vec4(b[0], b[1], b[2], 1)
	vector[3] = vec4(c[0], c[1], c[2], 1)

	var t1 = subtract(vector[2], vector[1]);
	var t2 = subtract(vector[3], vector[2]);
	var normal = vec3(cross(t1, t2));
	return normal;
}
function repush(pArray, p1, p2, p3, index) {
	pArray.push(p1, p2, p3)
	var normal = getNormal(p1, p2, p3)
	for (var i = 0; i < 3; i++) {
		normals[index].push(normal)
		texCoordsArray.push(texCoord[i]);
	}
}

function getTriangular(a, b, c, index)		//将二维三角形转换为三棱柱
{
	a[2] = 0.3; b[2] = 0.3; c[2] = 0.3;
	var a1 = [a[0], a[1], -a[2]]
	var b1 = [b[0], b[1], -b[2]]
	var c1 = [c[0], c[1], -c[2]]

	var pointsArray = new Array();
	repush(pointsArray, a, b, c, index)
	repush(pointsArray, b1, b, a, index)
	repush(pointsArray, a, a1, b1, index)
	repush(pointsArray, a1, c1, b1, index)
	repush(pointsArray, c1, c, b, index)
	repush(pointsArray, b, b1, c1, index)
	repush(pointsArray, a, c, c1, index)
	repush(pointsArray, c1, a1, a, index)

	return pointsArray
}

function drawQ() {
	var v = new Array()
	var a1 = 0.6
	var b1 = a1 * 1.1
	var a2 = a1 / 1.3
	var b2 = b1 / 1.3
	v = getHollowEllipse({ "x": 0, "y": 0 }, a1, b1, a2, b2)
	var vt = [
		0.45, -0.8,
		0.7, -0.8,
		0.35, -0.55,

		0.35, -0.55,
		0.2, -0.6,
		0.45, -0.8,
	]
	v.push.apply(v, vt);
	return v
}

function drawL() {
	var v = new Array()
	var a1 = 0.6
	var b1 = a1 * 3
	var a2 = a1 / 1.3
	var b2 = b1 / 1.3
	v = getHollowEllipsePart({ "x": 0, "y": -0.04 }, b1, a1, b2, a2, 252, 280)
	v2 = getHollowEllipsePart({ "x": 0, "y": 0 }, a1, b1, a2, b2, 160, 200)
	v.push.apply(v, v2);
	return v
}

function drawH() {
	var v = new Array()
	var a1 = 0.6
	var b1 = a1 * 3
	var a2 = a1 / 1.3
	var b2 = b1 / 1.3
	v = getHollowEllipsePart({ "x": 0, "y": 0 }, a1, b1, a2, b2, -20, 20)
	v2 = getHollowEllipsePart({ "x": 0, "y": 0 }, a1, b1, a2, b2, 160, 200)
	v3 = getHollowEllipsePart({ "x": 0, "y": -0.5 }, b1, a1, b2, a2, 72, 108)
	v.push.apply(v, v2);
	v.push.apply(v, v3);
	return v
}

function drawC() {
	var v = new Array()
	var a1 = 0.6
	var b1 = a1 * 1.1
	var a2 = a1 / 1.3
	var b2 = b1 / 1.3
	v = getHollowEllipsePart({ "x": 0, "y": 0 }, a1, b1, a2, b2, 60, 300)
	return v
}

function drawS() {
	var v = new Array()
	var a1 = 0.6 / 1.25
	var b1 = a1 * 1.1 / 1.25
	var a2 = a1 / 1.3 / 1.25
	var b2 = b1 / 1.3 / 1.25
	v = getHollowEllipsePart({ "x": 0, "y": 0.34 }, a1, b1, a2, b2, 30, 270)
	v2 = getHollowEllipsePart({ "x": 0, "y": -0.34 }, a1, b1, a2, b2, -150, 90)
	v.push.apply(v, v2);
	return v
}

function BuildModel() {
	function pushTriangularInto(pointsArray, index) {
		for (var i = 0; i < pointsArray.length; i++) {
			for (var j = 0; j < 3; j++) {
				vertices[index].push(pointsArray[i][j])
			}
		}

		for (var i = 0; i < pointsArray.length / 3; i++) {
			for (var j = 0; j < 3; j++) {
				colors[index].push(vertexColors[index][i]);
			}
		}
	}

	//记录构成字母三角形的二维坐标
	var originalPoints = new Array()
	originalPoints[0] = drawQ()
	originalPoints[1] = drawL()
	originalPoints[2] = drawH()

	var length = [originalPoints[0].length / 2, originalPoints[1].length / 2, originalPoints[2].length / 2];	//记录三个字母每个字母有多少点

	//要修改成自己想要的字母，必须要修改以上两个部分

	for (var i = 0; i < length.length; i++) {
		length[i] = length[i] * 8 * 4	//每一个平面三角形转换为三棱柱后，会多出8倍的点，而每个点又有4个分量
	}

	for (var j = 0; j < 3; j++) {
		for (var i = 0; i < length[j] / 12; i = i + 6)	//将三角形转换为三棱柱
		{
			var a = [originalPoints[j][i], originalPoints[j][i + 1]]
			var b = [originalPoints[j][i + 2], originalPoints[j][i + 3]]
			var c = [originalPoints[j][i + 4], originalPoints[j][i + 5]]
			var v = getTriangular(a, b, c, j)
			pushTriangularInto(v, j)
		}
	}

	for (var j = 0; j < 3; j++) 						//有三个字母，循环三次
	{
		for (var i = 0; i < length[j]; i = i + 3) {
			var x = vertices[j][i] / 3 + 0.5 * (j - 1)		//将每个字母沿x轴平移，以使字母分开
			var y = vertices[j][i + 1] / 3
			var z = vertices[j][i + 2] / 3
			points[j].push(vec4(x, y, z, 1));				//将点传入数组points
		}
	}

}
var nBuffer = new Array()
var RotateLight=true;
window.onload = function init() {
	BuildModel()

	canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert("WebGL isn't available"); }

	//
	//  Configure WebGL
	//
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	gl.enable(gl.DEPTH_TEST);

	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);


	for (var i = 0; i < 3; i++) {
		cBuffer[i] = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(colors[i]), gl.STATIC_DRAW)
		nBuffer[i] = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(normals[i]), gl.STATIC_DRAW);

		vBuffer[i] = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(points[i]), gl.STATIC_DRAW);
	}


	thetaLoc = gl.getUniformLocation(program, "theta");
	zoomLoc = gl.getUniformLocation(program, "zoom");
	transLoc = gl.getUniformLocation(program, "trans");

	viewerPos = vec3(0.0, 0.0, -20.0);

	projection = ortho(-1, 1, -1, 1, -100, 100);

	ambientProduct = mult(lightAmbient, materialAmbient);
	diffuseProduct = mult(lightDiffuse, materialDiffuse);
	specularProduct = mult(lightSpecular, materialSpecular);





	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
	flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
		flatten(diffuseProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
		flatten(specularProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
		flatten(lightPosition));


	gl.uniform1f(gl.getUniformLocation(program,
		"shininess"), materialShininess);

	gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"),
		false, flatten(projection));

	//texture
	var tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

	var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
	gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vTexCoord);

	configureTexture(image2);
	//
	
	document.getElementById("RotateAllX").onclick = function () {
		for (var i = 0; i < 3; i++) {
			axis[i] = xAxis[i];
		}
	};

	document.getElementById("RotateAllY").onclick = function () {
		for (var i = 0; i < 3; i++) {
			axis[i] = yAxis[i];
		}
	};

	document.getElementById("RotateAllZ").onclick = function () {
		for (var i = 0; i < 3; i++) {
			axis[i] = zAxis[i];
		}
	};

	document.getElementById("ZoomInAll").onclick = function () {

		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				zoom[i][j] = zoom[i][j] + 0.1;
			}
		}
	};

	document.getElementById("ZoomOutAll").onclick = function () {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				zoom[i][j] = zoom[i][j] - 0.1;
			}
		}
	};

	document.getElementById("PauaeAll").onclick = function () {
		for (var i = 0; i < 3; i++) {
			pause[i] = !pause[i];
		}
	};

	document.getElementById("MoveDownAll").onclick = function () {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				trans[i][j] = trans[i][j] - 0.1;
			}
		}
	};

	document.getElementById("MoveUpAll").onclick = function () {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				trans[i][j] = trans[i][j] + 0.1;
			}
		}
	};

	////////////////////////////////////////////////////////////////////////////
	document.getElementById("RotateFirstX").onclick = function () {
		axis[0] = xAxis[0];
	};

	document.getElementById("RotateFirstY").onclick = function () {
		axis[0] = yAxis[0];
	};

	document.getElementById("RotateFirstZ").onclick = function () {
		axis[0] = zAxis[0];
	};

	document.getElementById("PauaeFirst").onclick = function () {
		pause[0] = !pause[0];
	};

	document.getElementById("ZoomInFirst").onclick = function () {
		for (var i = 0; i < 3; i++) {
			zoom[0][i] = zoom[0][i] + 0.1;
		}
	};

	document.getElementById("ZoomOutFirst").onclick = function () {
		for (var i = 0; i < 3; i++) {
			zoom[0][i] = zoom[0][i] - 0.1;
		}
	};

	document.getElementById("MoveDownFirst").onclick = function () {
		for (var i = 0; i < 3; i++) {
			trans[0][i] = trans[0][i] - 0.1;
		}
	};

	document.getElementById("MoveUpFirst").onclick = function () {
		for (var i = 0; i < 3; i++) {
			trans[0][i] = trans[0][i] + 0.1;
		}
	};
	/////////////////////////////////////////////////////////////////////////////////////////////
	document.getElementById("RotateSecondX").onclick = function () {
		axis[1] = xAxis[1];
	};

	document.getElementById("RotateSecondY").onclick = function () {
		axis[1] = yAxis[1];
	};

	document.getElementById("RotateSecondZ").onclick = function () {
		axis[1] = zAxis[1];
	};

	document.getElementById("PauaeSecond").onclick = function () {
		pause[1] = !pause[1];
	};

	document.getElementById("ZoomInSecond").onclick = function () {
		for (var i = 0; i < 3; i++) {
			zoom[1][i] = zoom[1][i] + 0.1;
		}
	};

	document.getElementById("ZoomOutSecond").onclick = function () {
		for (var i = 0; i < 3; i++) {
			zoom[1][i] = zoom[1][i] - 0.1;
		}
	};

	document.getElementById("MoveDownSecond").onclick = function () {
		for (var i = 0; i < 3; i++) {
			trans[1][i] = trans[1][i] - 0.1;
		}
	};

	document.getElementById("MoveUpSecond").onclick = function () {
		for (var i = 0; i < 3; i++) {
			trans[1][i] = trans[1][i] + 0.1;
		}
	};
	///////////////////////////////////////////////////////////////////////////////////////
	document.getElementById("RotateThirdX").onclick = function () {
		axis[2] = xAxis[2];
	};

	document.getElementById("RotateThirdY").onclick = function () {
		axis[2] = yAxis[2];
	};

	document.getElementById("RotateThirdZ").onclick = function () {
		axis[2] = zAxis[2];
	};

	document.getElementById("PauaeThird").onclick = function () {
		pause[2] = !pause[2];
	};

	document.getElementById("ZoomInThird").onclick = function () {
		for (var i = 0; i < 3; i++) {
			zoom[2][i] = zoom[2][i] + 0.1;
		}
	}

	document.getElementById("ZoomOutThird").onclick = function () {
		for (var i = 0; i < 3; i++) {
			zoom[2][i] = zoom[2][i] - 0.1;
		}
	};

	document.getElementById("MoveDownThird").onclick = function () {
		for (var i = 0; i < 3; i++) {
			trans[2][i] = trans[2][i] - 0.1;
		}
	};

	document.getElementById("MoveUpThird").onclick = function () {
		for (var i = 0; i < 3; i++) {
			trans[2][i] = trans[2][i] + 0.1;
		}
	};
	/////////////////////////////////////////////////////////////////////////////////////////////////////////*/
	render();
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



	for (i = 0; i < 3; i++) {
		if (pause[i]) theta[i][axis[i]] += 2.0;


		modelView = mat4();
		modelView = mult(modelView, rotate(theta[i][xAxis[i]], [1, 0, 0]));
		modelView = mult(modelView, rotate(theta[i][yAxis[i]], [0, 1, 0]));
		modelView = mult(modelView, rotate(theta[i][zAxis[i]], [0, 0, 1]));

		
		gl.uniformMatrix4fv(gl.getUniformLocation(program,
			"modelViewMatrix"), false, flatten(modelView));

		gl.uniform3fv(thetaLoc, theta[i]);
		gl.uniform3fv(zoomLoc, zoom[i]);
		gl.uniform3fv(transLoc, trans[i]);

		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer[i]);
		var vColor = gl.getAttribLocation(program, "vColor");
		gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vColor);

		gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer[i]);
		var vNormal = gl.getAttribLocation(program, "vNormal");
		gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vNormal);

		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer[i]);
		var vPosition = gl.getAttribLocation(program, "vPosition");
		gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vPosition);

		//alert( points[i].length+" "+ normals[i].length)
		gl.drawArrays(gl.TRIANGLES, 0, points[i].length);

	}

	requestAnimFrame(render);
}


//utility function

function initArray(object) {
	var numAlpha = 3;
	var array = new Array();
	for (i = 0; i < numAlpha; i++) {
		var type = typeof (object)
		if (type == "array" || type == "object") {
			array[i] = object.slice()
		}
		else {
			array[i] = object;
		}
	}
	return array
}