var col, row;
var scl = 10;

//data structure for each point, contains z value,
//could contains sprites or anykind of material meshes
//for now it is a 2 dimensional array storing z value
var terrain;

//Animation illusioni offset
var wave_offset = 0.0;

function setup() {
	// var w = 1280;
	// var h = 800;
	createCanvas(windowWidth, windowHeight, WEBGL);
	frameRate(60);

	col = windowWidth*1.5 / scl;
	row = windowHeight / scl;


	terrain = [];
	for (var i = 0; i < col; i++) {
	  terrain[i] = [];
	}
}

function draw() {
	background(30);
	stroke(0);
	fill(0,120,255,30);

	var step = 0.20;
	var floatY = wave_offset;
	for(var y = 0; y < row; y++) {
		var floatX = 0;
		for(var x = 0; x < col; x++) {
			// terrain[x][y] = random(-20,20);
			terrain[x][y] = map(noise(floatX,floatY), 0, 1, -40, 40);
			floatX += step;
		}
		floatY += step;
	}
	wave_offset -= 0.1;

	// translate(width/2, height/2);
	rotateX(-PI/3);
	translate(-width/2*1.5, -height/2*0.6);

	for(var y = 0; y < row-1; y++) {
		beginShape(TRIANGLE_STRIP);
		for(var x = 0; x < col; x++) {
			vertex(x*scl, y*scl, terrain[x][y]);
			vertex(x*scl, (y+1)*scl, terrain[x][y+1]);
		}
		endShape();
	}
}

// Resize as window size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
