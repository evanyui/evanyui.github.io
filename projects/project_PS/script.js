//Initializing canvas
var canvas = document.getElementById("canvas"),
		ctx = canvas.getContext("2d"),
		w = window.innerWidth,
		h = window.innerHeight;
canvas.height = h;
canvas.width = w;

//detects focus
$("#mass").focusin(function() {
  focus = true;
});

$("#mass").focusout(function() {
  focus = false;
});

//Variables
var particles = [];
var mouseX, mouseY;
var collisionChecked = false;
var shadowChecked = false;
var focus = false;
var insertMode = false;

//constants
var PI = Math.PI;
var VLC_SCALE = 10;		//10 because looks better on screen
// var G = 1;
var sFACTOR; 
var RESIST = 0.1;

//Get the shortcut control by key pressed
document.onkeydown = function(e) {
	if(!focus) {
	    var key = e.keyCode;

	    if(key == 48 && insertMode)
			document.getElementById("mass").value += 0;
	    else if(key == 49 && insertMode)
			document.getElementById("mass").value += 1;
	    else if(key == 50 && insertMode)
			document.getElementById("mass").value += 2;
	    else if(key == 51 && insertMode)
			document.getElementById("mass").value += 3;
		else if(key == 52 && insertMode)
			document.getElementById("mass").value += 4;
	    else if(key == 53 && insertMode)
			document.getElementById("mass").value += 5;
	    else if(key == 54 && insertMode)
			document.getElementById("mass").value += 6;
		else if(key == 55 && insertMode)
			document.getElementById("mass").value += 7;
	    else if(key == 56 && insertMode)
			document.getElementById("mass").value += 8;
	    else if(key == 57 && insertMode)
			document.getElementById("mass").value += 9;
		else if(key == 81) {	//this enters insert Mode and clear text
			document.getElementById("mass").value = "";
			if (!insertMode) 
				insertMode = true;
			else
				insertMode = false;
		}
		else if(key == 67) 
			clearCanvas();
		else if(key == 90) {
			if(collisionChecked == true) {
				document.getElementById("collision").checked = false;

				collisionChecked = false;
			}
			else {
				document.getElementById("collision").checked = true;
				collisionChecked = true;
			}
		}
		else if(key == 83) {
			if(shadowChecked == true) {
				document.getElementById("shadow").checked = false;
				shadowChecked = false;
			}
			else {
				swal({  title: "Warning",   
						text: "Turning on shadow might inscrease your cpu usage. \n Are you sure?",   
						type: "warning",   
						showCancelButton: true,   
						confirmButtonColor: "#DD6B55",   
						confirmButtonText: "Yes",   
						cancelButtonText: "No",   
						closeOnConfirm: false,   
						closeOnCancel: false }, 
						function(isConfirm){   
							if (isConfirm) {     
								swal("Okay", "Shadow effect has turned on. \nTurn it off again if fps drops", "success");   
								document.getElementById("shadow").checked = true;
								shadowChecked = true;
							} 
							else {     
								swal("Cancelled", "Shadow remains off.", "error"); 
								document.getElementById("shadow").checked = false;
								shadowChecked = false;  
							} 
						});
			}
		}
	}
}

function notify() {
	if(insertMode) {
		//insert msg
		ctx.font="18px Courier New";
		ctx.fillStyle = "#fff";
		ctx.fillText("[INSERT MODE]",30,30);
		//show mass
		ctx.font="18px Courier New";
		ctx.fillStyle = "#fff";
		ctx.fillText("[INPUT MASS: "+document.getElementById("mass").value+"]",200,30);
	}
}

function collisionMsg() {
	if(collisionChecked) {
		ctx.font="18px Courier New";
		ctx.fillStyle = "#fff";
		ctx.fillText("[COLLISION: ON]",w-220,30);
	}
	else {
		ctx.font="18px Courier New";
		ctx.fillStyle = "#fff";
		ctx.fillText("[COLLISION: OFF]",w-220,30);
	}
}

function help() {
	swal("Instructions","Shortcut Keys:\nQ - enter/exit insert mode \nC - clear \nZ - turn on/off collision\nS - turn on/off glow effect\n\n Controls:\nClick or Drag to create particle on screen\nTotal of 11 different colors depends on the size of particle\nTurn on glow effect to make particles glow\n\n*Tips: In insert mode, you can input mass size with number keys upon creation without typing into the textbox below. \n Notice the status at the top left during insert mode.");
}

function about() {
	swal("Particle Simulation","This is a particle simulation that simulates particle's movement under the effect of gravitational force from each other.\n\n*Note: Not to physical scale. Mass is size * factor(1). \nTaken constant G as 1. \n\nHave fun!");
}

//Event handlers NOT USED YET
//document.addEventListener("click", onClick);

//convert degree to radian 
function getRad(deg) {
  	return deg * PI/180;
}

//Convert radian to degree
function getDeg(rad) {
	return rad * 180/PI;
}

//Get sign according to angular graph, produce opposite Y sign because of PC screen Y axis is opposite
function getSign(value) {
	var signX = 0;
	var signY = 0;
	var signXY = [];

	//Cases for 4 different zone of angular graph to decide the sign of x and y components
	//NOTE: because computer screen starts with left top (0,0), 
 		//instead of table A,S,T,C , computer has -A,-S,S,A (0,-90,180,90)
 	//first zone
	if(value<=0 && value>=-90) {
		signX = 1;
		signY = -1;
		signXY.push({x:signX,y:signY});
	}
	//second zone
	else if(value<=-90 && value>=-180) {
		signX = -1;
		signY = -1;
		signXY.push({x:signX, y:signY});
	}
	//third zone
	else if(value>=90 && value<=180) {
		signX = -1;
		signY = 1;
		signXY.push({x:signX,y:signY});
	}
	//fourth zone
	else if(value>=0 && value<=90) {
		signX = 1;
		signY = 1;
		signXY.push({x:signX,y:signY});
	}

	return signXY[0];
}

//convert input into logical value
//NOT USED
function checkDegreeSign(degree) {
	if(degree >= 0) {
		return degree;
	}
	else {	//negative degree input
		return checkDegreeSign(360+degree);	//recursively subtract 360 until degree is within 360
	}
}

function createParticle(a0,b0,af,bf) {
	// var x0 = e.pageX;
 	// var y0 = e.pageY;

 	//Get origin coorinate x and y
 	var x0 = a0;
 	var y0 = b0;

 	//calculate difference from origin to destination
 	var da = (af - a0);			//x-axis
 	var db = (bf - b0);			//y-axis
 	//calculate degree and decide sign for direction
 	var degree = getDeg(Math.atan2(db,da));
 	var sign = getSign(degree);

 	//calculate velocity component x and y 
 	//note: the dragging length divided by the screen size decideds the speed
 	var va = ((Math.abs(da)/sFACTOR)*VLC_SCALE) * sign.x;
 	var vb = ((Math.abs(db)/sFACTOR)*VLC_SCALE) * sign.y;

 	//acceleration value initial is 0, no acceleration upon creation
 	var accelX = 0;
 	var accelY = 0; 

    //get size in radius, SIZE DECIDES COLOR, size is also mass here
    var size = Number(document.getElementById("mass").value);

    // **NOT GOOD IDEA
    // //get ForceField radius, default = 0, max = infinity
    // var radius = Number(document.getElementById("maxRadius").value);

    //get speed and radian, find velocity in x and y
    // var speed = Number(document.getElementById("speed").value);
    // var degree = checkDegreeSign(Number((document.getElementById("angle").value)))%360;
    // var sign = getSign(degree);
    //Converting speed and degree into x and y components, also check p or n sign of direction
    // da = Math.sqrt((Math.pow(speed,2))/(1+Math.pow(Math.tan(getRad(degree)),2)));
    // db = Math.sqrt(Math.pow(speed,2)-Math.pow(da,2));
    // da = da * sign.x;	//change of x 	default = original speed and direction(no acceleration)
    // db = db * sign.y;	//change of y

    //Find effect from surroundings: resultant force and acceleration
    //>>HERE

    //TOO HEAVER FOR BROWSER
    //Save new particle data   :coordinates :initial velocity :acceleration = 0 at initial
    //Each particle has value of: x, y, dx, dy, size, acceleration, resultnt force, gravity
    // particles.push({x:x0, y:y0, dx:va, dy:vb, ddx:accelX, ddy:accelY, Fx:0, Fy:0, sz:size, angle:degree});
    particles.push({x:x0, y:y0, dx:va, dy:vb, ddx:accelX, ddy:accelY, sz:size});
}

//Create particles color depends on size
//DONE JUDGE, I CHOSE THIS 
function colorParticle(sz) {
	if(sz<1) {
		return "#fff";
	}
	else if(sz<5) {
		return "#e5f9ff";
	}
	else if(sz<10) {
		return "#99eaff";
	}
	else if(sz<15) {
		return "#00ccff";
	}
	else if(sz<20) {
		return "#876447";
	}
	else if(sz<25) { //sz>20
		return "#cb976b";
	}
	else if(sz<30){
		return "#ffff00";
	}
	else if(sz<35) {
		return "#ffb400";
	}
	else if(sz<40) {
		return "#ffa000";
	}
	else if(sz<45) {
		return "#ff6400";
	}
	else {
		return "#ff2000";
	}
}

//Draw on canvas
function drawParticles() {
	for(var i = 0; i < particles.length; i++) {
		//drawing the particles
		ctx.beginPath();
		ctx.arc(particles[i].x,particles[i].y,particles[i].sz,0,PI*2,false);
		if(shadowChecked) {
			ctx.shadowBlur=15;
			ctx.shadowColor=colorParticle(particles[i].sz);
		}	
		else {
			ctx.shadowBlur=0;
			ctx.shadowColor=null;
		}
		ctx.closePath();
		ctx.fillStyle=colorParticle(particles[i].sz);
    	ctx.fill();
	} 
}

//algorithm to get acceleration magnitude and direction
function getAcceleration() {
	for(var i = 0; i < particles.length; i++) {
		var sumX = 0;
		var sumY = 0;
		var x0 = particles[i].x;
		var y0 = particles[i].y;
		var m0 = particles[i].sz;
		for(var j = 0; j < particles.length; j++) {
			var x1 = particles[j].x;
			var y1 = particles[j].y;
			var m1 = particles[j].sz;

			//calculate difference from origin to destination
		 	var da = (x1 - x0);			//x-axis
		 	var db = (y1 - y0);			//y-axis
		 	//calculate degree and decide sign for direction
		 	var degree = getDeg(Math.atan2(db,da));
		 	var sign = getSign(degree);

		 	//calculate velocity component x and y 
 			//note: the dragging length divided by the screen size decideds the speed
 			var va = ((Math.abs(da)/sFACTOR)*VLC_SCALE) * sign.x;
 			var vb = ((Math.abs(db)/sFACTOR)*VLC_SCALE) * sign.y;
 			
 			//Adding mass resistant
 			if(m0 > m1) {
 				//m0 doesnt move much
 				va /= Math.pow(2,(m0-m1));
 				vb /= Math.pow(2,(m0-m1));
 			}
 			else { //m1 > m0
 				//does nothing
 			}
 			//add to sum
 			sumX += va;
 			sumY += vb;
 		}	

 		//LOOPS AND NESTED IF MAKE MISS OF ACCURACY
		// 	//NOTES: subtract resistance because negative resistance means, stronger pulll from the other mass
		// 	//calculation condition for x
		// 		//If p2 is at the right of p1
		// 	if(x0 > x1) {
		// 		if(m1 > m0) {
		// 			sumX -= x1;
		// 		}
		// 		else {
		// 			sumX -= x1*(RESIST/m0);
		// 		}
		// 	}	//If p2 is at the left of p1
		// 	else if(x0 < x1) {	
		// 		if(m1 > m0) {
		// 			sumX += x1;
		// 		}
		// 		else {
		// 			sumX += x1*(RESIST/m0);
		// 		}
		// 	}
		// 	//calculation condition for y
		// 		//If p2 is at the top of p1
		// 	if(y0 > y1) {
		// 		if(m1 > m0) {
		// 			sumY -= y1;
		// 		}
		// 		else {
		// 			sumY -= y1*(RESIST/m0);
		// 		}
		// 	}	//If p2 is at the bottom of p1
		// 	else if(y0 < y1) {	
		// 		if(m1 > m0) {
		// 			sumY += y1;
		// 		}
		// 		else {
		// 			sumY += y1*(RESIST/m0);
		// 		}
		// 	}
		// }
		//Done accumulating sumX and sumY for particles[i]
		//divide by screen factor 
		// sumX /= sFACTOR*VLC_SCALE;
		// sumY /= sFACTOR*VLC_SCALE;
		//Set to data
		particles[i].ddx = sumX/VLC_SCALE/10;
		particles[i].ddy = sumY/VLC_SCALE/10;
	}
}

//TOO HEAVY FOR BROWSER
// //calculation using gravitational force to get particular force between two particles
// function getUnivGrav(p1, p2) {
// 	//distance formula
// 	var d = Math.sqrt(Math.pow((p2.x-p1.x),2)+Math.pow((p2.y-p1.y),2));
// 	return (G*p1.sz*p2.sz)/d;
// }

// function convertToXY(force, p1, p2) {
// 	//calculate difference from origin to destination
//  	var da = (p2.x - p1.x);			//x-axis
//  	var db = (p2.y - p1.y);			//y-axis
// 	//calculate degree and decide sign for calculation
//  	var degree = getDeg(Math.atan2(db,da));
// 	//calculate using formula to get x y components magnitude NOTE: it is sqrt, so it is always positive
// 	var fa = Math.sqrt((Math.pow(force,2))/(1+Math.pow(Math.tan(getRad(degree)),2)));
//     var fb = Math.sqrt(Math.pow(force,2)-Math.pow(fa,2));
//     //Find the angle between them and change the sign for the magnitude
//     var FDXsign = getForceDirection(p1, p2).x;
//     var FDYsign = getForceDirection(p1, p2).y;
//     fa = FDXsign*fa;
//     fb = FDYsign*fb;

//     var fs = [];
//     fs.push({forceX:fa, forceY:fb});
// 	return fs;
// }

// function getForceDirection(p1, p2) {
// 	//calculate difference from origin to destination
//  	var da = (p2.x - p1.x);			//x-axis
//  	var db = (p2.y - p1.y);			//y-axis
// 	//calculate degree and decide sign for calculation
//  	var degree = getDeg(Math.atan2(db,da));
//  	var np = []
//  	np = getSign(degree);
//  	return np;
// }

// //calculate resultant force in x and y components to get acceleration in x and y
// function saveResultantForce() {
// 	//for each particles do
// 	for(var i = 0; i < particles.length; i++) {
// 		var fx = 0;
// 		var fy = 0;
// 		var totalF = 0;
// 		var sign = 0;
// 		//compare other particles than itself 
// 		for(var j = 0; j < particles.length; j++) {
// 			if(particles[i] !== particles[j]) {
// 				//Find resultant force between two points
// 				totalF = getUnivGrav(particles[i],particles[j]);
// 				//for every comparison, get the fx and fy separately, with SIGN
// 				fx += convertToXY(totalF, particles[i], particles[j]).forceX;
// 				fy += convertToXY(totalF, particles[i], particles[j]).forceY;
// 			}
// 		}
// 		//at the end of innerloop, save end result of fx and fy into data
// 		particles[i].Fx = fx;
// 		particles[i].Fy = fy;
// 	}
// }

// //update each particle's acceleration due to new gravitational field into data of particles
// //return resultant acceleration with direction and magnitude
// function getAcceleration(p) {
// 	var A = [];
// 	var Ax = p.Fx/p.sz;
// 	var Ay = p.Fy/p.sz;
// 	A.push({ax:Ax, ay:Ay});
// 	return A;
// }

//edge collision check and delete particles out of canvas
function edgeCollisionCheck() {
	for(var i = 0; i < particles.length; i++) {
		if(particles[i].x-particles[i].sz > w || particles[i].x+particles[i].sz < 0 
			|| particles[i].y+particles[i].sz < 0 || particles[i].y-particles[i].sz > h) {
			//delete from data
			particles.splice(i,1);
		}
	}
}

//check collision between particles
function collisionCheck() {
	for(var i = 0; i < particles.length; i++) {
		for(var j = 0; j < particles.length; j++) {
			if(particles[i].x !== particles[j].x && particles[i].y !== particles[j].y) {
				//calculate difference from origin to destination
			 	var d = Math.sqrt(Math.pow((particles[i].x-particles[j].x),2)+Math.pow((particles[i].y-particles[j].y),2));
				if(d <= Math.abs(particles[i].sz+particles[j].sz)) {
					//check who is bigger. smaller dies
					if(particles[i].sz > particles[j].sz) {
						var dif = particles[i].sz - particles[j].sz;
						absorb(particles[i],particles[j].sz);
						//change acceleration
						accelAftCol(particles[i],particles[j]);
						//delete data
						particles.splice(j,1);
						return;
					}
					else if(particles[i].sz < particles[j].sz) {
						var dif = particles[i].sz - particles[j].sz;
						absorb(particles[j],particles[i].sz);
						//change acceleration
						accelAftCol(particles[j],particles[i]);
						//delete data
						particles.splice(i,1);
						return;
					}
					else {	//if same choose one
						absorb(particles[i],particles[j].sz);
						//change acceleration
						accelAftCol(particles[i],particles[j]);
						//delete data
						particles.splice(j,1);
						return;
					}			
				}
			}		
		}
	}
}

//calculation include acceleration change after collision
function accelAftCol(p1,p2) {
	//variable mass
	var m0 = p1.sz;
	var m1 = p2.sz;

	//calculate net velocity with momentum
 	var da = (p2.dx*m1 + p1.dx*m0)/((m0+m1));			//x-axis
 	var db = (p2.dy*m1 + p1.dy*m0)/((m0+m1));			//y-axis
 	//calculate degree and decide sign for direction
 	var degreeA = getDeg(Math.atan2(db,da));
 	var sign = getSign(degreeA);
 	//calculate velocity component x and y 
	//note: the dragging length divided by the screen size decideds the speed
	var vela = da * sign.x;
	var velb = db * sign.y;
	console.log(degreeA);
	console.log(sign.x);
	console.log(da);
	console.log(vela);

	p1.dx = da;
	p1.dy = db;
	//set acceleration to zero
	p1.ddx = 0;
	p1.ddy = 0;
}

//Do absorbtion of particles if mass is bigger, by 0.2*mass difference for each absorbtion
function absorb(particle, addition) {
	particle.sz += addition;
}

//switch for collision checkbox
function collisionSwitch(boolean) {
	collisionChecked = boolean.checked;
	console.log("Collision is " + collisionChecked);
}

function shadowSwitch(boolean) {
	shadowChecked = boolean.checked;
	if(shadowChecked == true) {
		swal({  title: "Warning",   
						text: "Turning on glow effect might inscrease your cpu usage. \n Are you sure?",   
						type: "warning",   
						showCancelButton: true,   
						confirmButtonColor: "#DD6B55",   
						confirmButtonText: "Yes",   
						cancelButtonText: "No",   
						closeOnConfirm: false,   
						closeOnCancel: false }, 
						function(isConfirm){   
							if (isConfirm) {     
								swal("Okay", "Glow effect has turned on. \nTurn it off again if fps drops", "success");   
								shadowChecked = true;
							} 
							else {     
								swal("Cancelled", "glow remains off.", "error"); 
								document.getElementById("shadow").checked = false;
								shadowChecked = false;  
							} 
						});
	}
	else {
		shadowChecked = false;
	}
}

//Render
function update() {
	//clear previous drawings
	ctx.clearRect(0,0,w,h);

	//TOO HEAVY FOR BROWSER
	// if(particles.length>1) {
	// 	saveResultantForce();
	// }

	//Update acceleration coordinates if universe has more than one particle.
	if(particles.length > 1) {
		getAcceleration();
	}

	//Draw particles on screen
	drawParticles();
	//make new drawings with new coordinates, 
	for(var i = 0; i < particles.length; i++) {
		//TOO HEAVY FOR BROWSER
		// if(particles.length>1) {
		//  	particles[i].ddx = 0.005;
		//  	particles[i].ddy = 0;
		// }
		//update velocity as it accelerates... 
		particles[i].dx += particles[i].ddx;
		particles[i].dy += particles[i].ddy;
		//update coordinates as it moves
		particles[i].x += particles[i].dx;		
		particles[i].y += particles[i].dy;
	}

	//TOO HEAVY FOR BROWSER
	// if(particles.length > 1) {
		//update acceleration magnitude and direction
		// motionChange();

	// }

	//notification
	notify();
	collisionMsg();

	//update cursor posiiton with cross
	drawCross();

	//draw line when holding
	if(hold) {
		drawVector();
	}

	//Check collision and clear particles that is out of canvas
	edgeCollisionCheck();

	//if checkbox is checked, check particles collision
	if(collisionChecked) {
		collisionCheck();
	}
}

//Event Listener coded on CSS to detect mouse moves
function trackMouse(e) {
	mouseX = e.pageX - canvas.offsetLeft;
    mouseY = e.pageY - canvas.offsetTop;
}

//Drawing X Y ruler on cursor
function drawCross() {
    //draw vertical line
    ctx.beginPath();
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, canvas.height);
    ctx.strokeStyle="rgba(0,255,255,0.1)";
    ctx.stroke();
    //draw horizontol line
    ctx.moveTo(0, mouseY);
    ctx.lineTo(canvas.width, mouseY);
    ctx.strokeStyle="rgba(0,255,255,0.5)";
    ctx.stroke();
    ctx.closePath();
}

//variable to manipulate origin point to destination, and holding state of mouse
var a0, b0, a, b, hold = false;

//Upon holding down mouse click
function dragging(e) {
	a0 = e.pageX;
	b0 = e.pageY;
	hold = true;

	//cancel input mode
	insertMode = false;
}

//When release mouse click
function dropping(e) {
	a = e.pageX;
	b = e.pageY;
	hold = false;

	//Create particle with origin point and dragged point
	createParticle(a0,b0,a,b);
}

function drawVector() {
	//drawing line to where the cursor is from dragging source point
	ctx.beginPath();
	ctx.moveTo(a0,b0);
	ctx.lineTo(mouseX,mouseY);
	ctx.strokeStyle="rgba(0,255,255,0.8)";
	ctx.stroke();
	ctx.closePath();
}

function clearCanvas() {
	//clear canvas
	ctx.clearRect(0,0,w,h);

	//clear particles data in array
	while(particles.length>0) {
		particles.pop();
	}
}

//Animation loop starts during initiliaze
function init() {
	sFACTOR= Math.sqrt(Math.pow(w,2)+Math.pow(h,2));

	//show message
	swal("Welcome", "Click or drag to create particles. \nScroll down to see controls in menu bar. \n\nTo learn more about advance controls, \nclick on 'Learn More Controls' at the bottom. \n\nEnjoy! :)");

	//100 frames per sec
	setInterval(update, 1000/60);
}

//Initialize after content is loaded
document.addEventListener("DOMContentLoaded", function(event) { 
	init();
});



