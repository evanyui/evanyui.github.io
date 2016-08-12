(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

//global
var finished = 0;
var canvas2; //for effect
var canvas3;
var canvas3_copy;
var canvas4;
var canvas4_copy;
var canvas5;
var canvas5_copy;
var ctx2;
var ctx3, ctx3_copy;
var ctx4, ctx4_copy;
var ctx5, ctx5_copy;
var nodes = new Array();
var stems = new Array();
var tree1, tree2, tree3, tree4, sky1, sky2, sky3, sky4, d1, d2, d3, n1, n2;

window.onload = function() {
  var element = document.getElementById('container');
  dropAndLoad(element, init, "ArrayBuffer");

  swal("Welcome to Bloom!", "1. Configure the color panel at the side \n\n2. Then " +
    "drag your favorite music to the canvas.\n\n" +
    "*Once the magic starts, you can't change your color. \n\n " +
    "Simple refresh the page to restart. \n\n" +
    "Enjoy!");
}

function setColor() {
  tree1 = "rgba(" + $('#tree1').val() + ",";
  $('#tree1').css('background-color', tree1+"1.0)");
  tree2 = "rgba(" + $('#tree2').val() + ",";
  $('#tree2').css('background-color', tree2+"1.0)");
  tree3 = "rgba(" + $('#tree3').val() + ",";
  $('#tree3').css('background-color', tree3+"1.0)");
  tree4 = "rgba(" + $('#tree4').val() + ",";
  $('#tree4').css('background-color', tree4+"1.0)");

  sky1 = "rgba(" + $('#sky1').val() + ",";
  $('#sky1').css('background-color', sky1+"1.0)");
  sky2 = "rgba(" + $('#sky2').val() + ",";
  $('#sky2').css('background-color', sky2+"1.0)");
  sky3 = "rgba(" + $('#sky3').val() + ",";
  $('#sky3').css('background-color', sky3+"1.0)");
  sky4 = "rgba(" + $('#sky4').val() + ",";
  $('#sky4').css('background-color', sky4+"1.0)");

  d1 = "rgba(" + $('#d1').val() + ",";
  $('#d1').css('background-color', d1+"1.0)");
  d2 = "rgba(" + $('#d2').val() + ",";
  $('#d2').css('background-color', d2+"1.0)");
  d3 = "rgba(" + $('#d3').val() + ",";
  $('#d3').css('background-color', d3+"1.0)");

  n1 = "rgba(" + $('#n1').val() + ",";
  $('#n1').css('background-color', n1+"1.0)");
  n2 = "rgba(" + $('#n2').val() + ",";
  $('#n2').css('background-color', n2+"1.0)");
}

function disable() {
  $('#tree1').attr("disabled", "disabled");
  $('#tree2').attr("disabled", "disabled");
  $('#tree3').attr("disabled", "disabled");
  $('#tree4').attr("disabled", "disabled");

  $('#sky1').attr("disabled", "disabled");
  $('#sky2').attr("disabled", "disabled");
  $('#sky3').attr("disabled", "disabled");
  $('#sky4').attr("disabled", "disabled");

  $('#d1').attr("disabled", "disabled");
  $('#d2').attr("disabled", "disabled");
  $('#d3').attr("disabled", "disabled");

  $('#n1').attr("disabled", "disabled");
  $('#n2').attr("disabled", "disabled");
}

$(document).ready(function() {
  setColor();
  $('.palette').on('keypress', function (event) {
         if(event.which === 13){
            //Disable textbox to prevent multiple submit
            $(this).attr("disabled", "disabled");

            setColor();
         }
   });

   $("#brush").click(function(){
    window.print();
});


});

function dropAndLoad(dropElement, callback, readFormat) {
  var readFormat = readFormat || "DataUrl";

  dropElement.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, false);

  dropElement.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    loadFile(e.dataTransfer.files[0]);
  }, false);

  function loadFile(files) {
    var file = files;
    var reader = new FileReader();
    reader.onload = function(e) {
      callback(e.target.result);
    }
    reader['readAs'+readFormat](file);
  }
}

// Once the file is loaded, we start getting our hands dirty.
function init(arrayBuffer) {
  canvas2 = document.getElementById('canvas2'); //for effect
  ctx2 = canvas2.getContext("2d");
  canvas3 = document.getElementById('canvas3'); //for 2nd layer
  ctx3 = canvas3.getContext("2d");
  canvas3_copy = document.getElementById('canvas3copy'); //for reflection
  ctx3_copy = canvas3_copy.getContext("2d");
  canvas4 = document.getElementById('canvas4'); //for 3rd layer
  ctx4 = canvas4.getContext("2d");
  canvas4_copy = document.getElementById('canvas4copy'); //for reflection
  ctx4_copy = canvas4_copy.getContext("2d");
  canvas5 = document.getElementById('canvas5');
  ctx5 = canvas5.getContext("2d");
  canvas5_copy = document.getElementById('canvas5copy'); //for reflection
  ctx5_copy = canvas5_copy.getContext("2d");

  document.getElementById('instructions').innerHTML = 'Loading ...';
  // Create a new `audioContext` and its `analyser`
  window.audioCtx = new AudioContext();
  window.analyser = audioCtx.createAnalyser();
  // If a sound is still playing, stop it.
  if (window.source)
    source.noteOff(0);
  // Decode the data in our array into an audio buffer
  audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
    // Use the audio buffer with as our audio source
    window.source = audioCtx.createBufferSource();
    source.buffer = buffer;
    // Connect to the analyser
    source.connect(analyser);
    // and back to the destination, to play the sound after the analysis.
    analyser.connect(audioCtx.destination);
    // Start playing the buffer.
    source.start(0);
    //when finished
    source.onended = function() {
      finished = 1;
      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
      swal("Like it?", "Click on the brush to save it!")
    }
    // Initialize a visualizer object
    var viz = new nodeViz();
    // Finally, initialize the visualizer.
    new visualizer(viz['update'], analyser);
    document.getElementById('instructions').innerHTML = '';
    //disable buttons
    disable();

  });
}

function visualizer(visualization, analyser) {
  var self = this;
  this.visualization = visualization;
  var last = Date.now();
  var loop = function() {
    var dt = Date.now() - last;
    // we get the current byteFreq data from our analyser
    var byteFreq = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(byteFreq);
    last = Date.now();
    // We might want to use a delta time (`dt`) too for our visualization.
    self.visualization(byteFreq, dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

//First style: node and strokes
function nodeViz(canvas) {
  var self = this;
  this.canvas = document.getElementById('canvas');
  this.ctx = this.canvas.getContext("2d");
  //for calculating frequency
  this.barWidth = 10;
  this.barGap = 4;
  this.bars = Math.floor(this.canvas.width / (this.barWidth + this.barGap));
  //variables
  var cx = 0;
  var cy = 0;
  var randx = 0;
  var randy = 0;
  //nodes color
  var color1 = n1; //"rgba(255,255,255,";
  var color2 = n2; //"rgba(200,190,255,";
  var nodeColorArray = [color1,color2];
  //trees color
  var treeColor1 = tree1; //"rgba(49,91,22,";
  var treeColor2 = tree2; //"rgba(70,100,40,";
  var treeColor3 = tree3; //"rgba(126,150,0,";
  var treeColor4 = tree4; //"rgba(70,60,28,";
  var treeColorArray = [treeColor1,treeColor2,treeColor3,treeColor4];
  // decoration color
  var decColor1 = d1;
  var decColor2 = d2;
  var decColor3 = d3;
  var decColorArray = [decColor1,decColor2,decColor3];
  //sky color
  var skyColor1 = sky1; // "rgba(255,255,255,";
  var skyColor2 = sky2; //"rgba2(255,170,0,";
  var skyColor3 = sky3; //"rgba(200,20,140,";
  var skyColor4 = sky4; //"rgba(250,250,0,";
  var skyColorArray1 = [skyColor1,skyColor2,skyColor3,skyColor4];
  var skyColorArray2 = [skyColor3,skyColor4];
  //water color
  var waterColor = "rgba(255,255,255,";
  //all color
  var colorPalette = [treeColor1,treeColor2,treeColor3,treeColor4,skyColor1,skyColor2,skyColor3,skyColor4,waterColor];
  //delays
  var stayTime = 0;
  //create first origin
  cx = (Math.floor(Math.random() * 400)+200);
  cy = (Math.floor(Math.random() * 300)+150);
  //initialize
  drawOrigin();

  //globals
  var previous = 0;
  var delay = 600;
  var i = 0;
  var j = 0;
  var newOrig = 0;
  var haloSize = 20;
  var skyLayer = 0;
  var blinkLevel = 0;
  var counter = 0;
  var ratio = 1.5;

  //##########################################################
  //#                      FUNCTIONS                         #
  //##########################################################
  //get new origin point
  function randOrigin() {
    //leave white stain
    var stain = 0;
    if(stayTime>=1000) {
      stain = 30;
    } else if(stayTime>=500) {
      stain = 20;
    } else if(stayTime>=200) {
      stain = 10;
    } else {
      stain = 5;
    }
    self.ctx.beginPath();
    self.ctx.arc(cx,cy,stain, 0, 2*Math.PI, false);
    self.ctx.arc(cx,cy,0, 0, 2*Math.PI, true);
    var radialGradient = self.ctx.createRadialGradient(cx, cy, 0, cx, cy, stain-2);
    radialGradient.addColorStop(0, "rgba(255,255,255,0.2)");
    radialGradient.addColorStop(1, color1+"0.0)");
    self.ctx.fillStyle = radialGradient;
    self.ctx.fill();
    self.ctx.closePath();

    stayTime = 0;
    // ** origin around center, a half squeezed from side
    // cx = (Math.floor(Math.random() * 400)+200);
    // cy = (Math.floor(Math.random() * 300)+150);
    // ** origin around canvas, a quarter away from side
    // cx = (Math.floor(Math.random() * 1200)-200);
    // cy = (Math.floor(Math.random() * 750)-150);
    // ** limit in the canvas but away from each other 20px
    cx = (Math.floor(Math.random() * 800));
    cy = (Math.floor(Math.random() * 600));
  }

  //draw origin
  function drawOrigin() {
    // self.ctx.beginPath();
    // self.ctx.arc(cx,cy,15, 0, 2*Math.PI, true);
    // self.ctx.strokeStyle = 'rgba(238,130,238,1.0)';
    // self.ctx.lineWidth=1;
    // self.ctx.shadowColor = "rgba(238,130,238,1.0)";
    // self.ctx.shadowOffsetX = 0;
    // self.ctx.shadowOffsetY = 0;
    // self.ctx.shadowBlur    = 15;
    // self.ctx.fillStyle = 'rgba(255,255,255,0.0)';
    // self.ctx.fill();
    // self.ctx.stroke();
    self.ctx.beginPath();
    self.ctx.arc(cx,cy,100, 0, 2*Math.PI, false);
    self.ctx.arc(cx,cy,20, 0, 2*Math.PI, true);
    var radialGradient = self.ctx.createRadialGradient(cx, cy, 22, cx, cy, 40);
    radialGradient.addColorStop(0, color1+"0.1)");
    radialGradient.addColorStop(1, color1+"0.0)");
    self.ctx.fillStyle = radialGradient;
    self.ctx.fill();
    self.ctx.closePath();

    //save into array
    nodes.push({x:cx, y:cy});
    stems.push({x:cx, y:cy});
  }

  //draw strokes
  function drawStroke() {
    //longer it stays, bigger the pollen
    stayTime++;

    //randomize
    var angle = Math.random()*Math.PI*2;
    var range = Math.floor(Math.random() * 30)+20;
    var randLimit = (Math.floor(Math.random() * range)+50);
    var radius = (Math.floor(Math.random() * randLimit)+20);  //plus center offset
    randx = Math.cos(angle)*radius+cx;
    randy = Math.sin(angle)*radius+cy;
    var randColor = nodeColorArray[(Math.floor(Math.random() * nodeColorArray.length))];

    //draw node
    self.ctx.beginPath();
    self.ctx.arc(randx,randy,1, 0, 2*Math.PI, false);
    self.ctx.fillStyle = randColor+'0.1)';
    self.ctx.fill();
    self.ctx.closePath();
    //draw line
    self.ctx.beginPath();
    self.ctx.shadowColor = randColor+"1.0)";
    self.ctx.shadowOffsetX = 0;
    self.ctx.shadowOffsetY = 0;
    self.ctx.shadowBlur    = 12;
    self.ctx.moveTo(cx,cy);
    self.ctx.lineTo(randx,randy);
    self.ctx.strokeStyle= randColor+"0.03)";
    self.ctx.lineWidth=1;
    self.ctx.stroke();
    self.ctx.fill();
    self.ctx.closePath();
  }

  //############### MAIN LOOP ##################
  //#      animation loop starts here!         #
  //############################################
  this.update = function(byteFreq) {
    //change origin
    if(((byteFreq[32]>240 && previous<240) || (byteFreq[0]+byteFreq[32]==0)) && delay<=0 && !finished){
      randOrigin();
      //draw origin
      drawOrigin();
      newOrig = 1;
      delay = 600;
    }
    if(delay>0){
      delay--;
    }
    previous = byteFreq[32];

    //strokes
    drawStroke();

    //manage trees layers
    if(j>=799) {
      counter++;
    }
    if(counter==0){
      ratio = 1.6;
    } else if(counter<=4) {
      ratio = 1.5;
    } else if(counter<=8) {
      ratio = 1.4;
    } else if(counter<=12) {
      ratio = 1.3;
    } else if(counter<=16) {
      ratio = 1.2;
    } else {
      ratio = 1.0;
    }

    //draw trees
    drawTrees(ratio);

    //draw sky
    drawSky();

    //draw water reflection(white)
    drawWater();

    // music visualization here
    ctx2.clearRect(0, 0, self.canvas.width, self.canvas.height);
    animate();
    //animate halo and flashes
    if(newOrig) {
      haloSize = 20;
      halo(haloSize);
      newOrig = 0;
    }
    else {
      haloSize+=20;
      halo(haloSize);
    }

    function drawLand(){

    }

    function drawTrees(ratio) {
      var randColor = treeColorArray[(Math.floor(Math.random() * treeColorArray.length))];
      ctx3.beginPath();
      ctx3.shadowColor = randColor+"1.0)";
      ctx3.shadowOffsetX = 0;
      ctx3.shadowOffsetY = 0;
      ctx3.shadowBlur    = 12;
      ctx3.fillStyle = randColor+"0.05)";
      ctx3_copy.beginPath();
      ctx3_copy.shadowColor = randColor+"1.0)";
      ctx3_copy.shadowOffsetX = 0;
      ctx3_copy.shadowOffsetY = 0;
      ctx3_copy.shadowBlur    = 35;
      ctx3_copy.fillStyle = randColor+"0.015)";
        // NOTE: not a loop because outer animation code loops
        // Draw each bar
        j = (j%800);
        j++;
        if(j<400) {
          i = (i % 400);
          i++;
        } else if(j==400) {
          i = 400;
        } else if(j>=400) {
          i--;
        } else if(j<=0) {
          i = 0;
        }
        var barHeight = byteFreq[i];
        ctx3_copy.fillRect(j,barHeight*ratio,6,-barHeight*ratio);
        ctx3.fillRect(j,300-barHeight*0.6*ratio,2,barHeight*0.6*ratio);
        ctx3.closePath();
        ctx3_copy.closePath();

        //draw decoration
        var chance = Math.floor(Math.random()*30);
        if(chance==0 && barHeight*0.6*ratio>30){
          var decColor = decColorArray[(Math.floor(Math.random() * decColorArray.length))];
          var randH = 300-Math.floor(Math.random()*(barHeight*0.6*ratio-20)+20);
          ctx5.shadowColor = decColor+"1.0)";
          ctx5.shadowOffsetX = 0;
          ctx5.shadowOffsetY = 0;
          ctx5.shadowBlur    = 40;
          ctx5.beginPath();
          ctx5.arc(j,randH,2, 0, 2*Math.PI, false);
          ctx5.fillStyle = decColor+'0.2)';
          ctx5.fill();
          ctx5.closePath();
        }

        // draw ground grass
        ctx3.beginPath();
        ctx3_copy.beginPath();
        var randColor2 = treeColorArray[(Math.floor(Math.random() * treeColorArray.length))];
        ctx3.shadowColor = randColor2+"1.0)";
        ctx3.shadowOffsetX = 0;
        ctx3.shadowOffsetY = 0;
        ctx3.shadowBlur    = 20;
        ctx3.fillStyle = randColor2+"0.02)";
        ctx3.fillRect(j,300-byteFreq[32]/20,3,byteFreq[32]/20);
        ctx3_copy.fillStyle = randColor2+"0.005)";
        ctx3_copy.fillRect(j,byteFreq[32]/10,6,-byteFreq[32]/10);
      ctx3.closePath();
      ctx3_copy.closePath();

      //clear off middle
      ctx3.beginPath();
      ctx3.fillStyle = "white";
      ctx3.shadowColor = "rgba(0,0,0,0)";
      ctx3.fillRect(0,300,800,1);
      ctx3.closePath();
      ctx5_copy.beginPath();
      var grd = ctx5_copy.createLinearGradient(0,0,0,1);
      grd.addColorStop(0,"rgba(255,255,255,0.01)");
      grd.addColorStop(1,"rgba(255,255,255,0.0)");
      ctx5_copy.fillStyle = grd;
      ctx5_copy.shadowColor = "rgba(0,0,0,0)";
      ctx5_copy.fillRect(0,0,800,10);
      ctx5_copy.closePath();

    }

    //#########################################################################
    //#                         ANIMATION & EFFECTS                           #
    //#########################################################################
    function animate() {
      if(!finished) {
        for(var i = 0; i < nodes.length; i++) {
          var pulse = (byteFreq[32]/4 <= 30? 30: byteFreq[32]/4);
          ctx2.beginPath();
          ctx2.arc(nodes[i].x,nodes[i].y,pulse+10, 0, 2*Math.PI, false);
          ctx2.arc(nodes[i].x,nodes[i].y,20, 0, 2*Math.PI, true);
          var radialGradient = ctx2.createRadialGradient(nodes[i].x, nodes[i].y, 22, nodes[i].x, nodes[i].y, pulse-2);
          radialGradient.addColorStop(0, color2+"0.4)");
          radialGradient.addColorStop(1, "rgba(255,255,255,0.0)");
          ctx2.fillStyle = radialGradient;
          ctx2.fill();
          ctx2.closePath();
        }
      }
    }

    //draw expand halo
    function halo(rad) {
      if(rad<500) {
        var halo = rad;
        ctx2.beginPath();
        ctx2.arc(nodes[nodes.length-1].x,nodes[nodes.length-1].y,halo+10, 0, 2*Math.PI, false);
        ctx2.arc(nodes[nodes.length-1].x,nodes[nodes.length-1].y,halo, 0, 2*Math.PI, true);
        var radialGradient = ctx2.createRadialGradient(nodes[nodes.length-1].x,
          nodes[nodes.length-1].y, halo+20, nodes[nodes.length-1].x, nodes[nodes.length-1].y, halo-20);
        radialGradient.addColorStop(0, "rgba(255,255,255,0.0)");
        radialGradient.addColorStop(0.5, color2+"0.1)");
        radialGradient.addColorStop(1, "rgba(255,255,255,0.0)");
        ctx2.fillStyle = radialGradient;
        ctx2.fill();
        ctx2.closePath();
      }
    }

    //draw background sky
    //TODO: need another strategy for better night sky
    function drawSky() {
      //randomize around center
      var centerX = 400;
      var centerY = 300;
      var angle = Math.random()*Math.PI;
      var radius = byteFreq[skyLayer];
      var randLimit = (Math.floor(Math.random() * 150));
      var radius2 = (Math.floor(Math.random() * randLimit));
      var skyx0 = Math.cos(angle+Math.PI)*radius2*5+centerX;
      var skyy0 = Math.sin(angle+Math.PI)*radius2*5+centerY;
      var skyx0_r = skyx0;
      var skyy0_r = 300-skyy0;
      var skyx = Math.cos(angle+Math.PI)*radius+skyx0;
      var skyy = Math.sin(angle+Math.PI)*radius+skyy0;
      var skyx_r = skyx;
      var skyy_r = 300-skyy;
      var randColor = skyColorArray1[(Math.floor(Math.random() * skyColorArray1.length))];

      ctx4.beginPath();
      ctx4.shadowColor = randColor+"0.8)";
      ctx4.shadowOffsetX = 0;
      ctx4.shadowOffsetY = 0;
      ctx4.shadowBlur    = 20;
      ctx4.strokeStyle = randColor+"0.006)";
      ctx4.strokeCap = "round";
      ctx4.lineWidth = 20;
      ctx4_copy.beginPath();
      ctx4_copy.shadowColor = randColor+"0.2)";
      ctx4_copy.shadowOffsetX = 0;
      ctx4_copy.shadowOffsetY = 0;
      ctx4_copy.shadowBlur    = 25;
      ctx4_copy.strokeStyle = randColor+"0.004)";
      ctx4_copy.strokeCap = "round";
      ctx4_copy.lineWidth = 25;
        // Draw each bar
        ctx4.moveTo(skyx0,skyy0);
        ctx4.lineTo(skyx,skyy);
        ctx4_copy.moveTo(skyx0_r,skyy0_r*0.6);
        ctx4_copy.lineTo(skyx_r,skyy_r);
        ctx4.stroke();
        ctx4_copy.stroke();
      ctx4.closePath();
      ctx4_copy.closePath();

    }

    //Draw water
    //TODO: another strategy needed, maybe linear brush
    function drawWater() {
      //randomize around center
      // var centerX = 400;
      // var centerY = 300;
      // var angle = Math.random()*Math.PI;
      // var randLimit = (Math.floor(Math.random() * 150));
      // var radius = (Math.floor(Math.random() * randLimit));
      // var randLimit2 = (Math.floor(Math.random() * 150));
      // var radius2 = (Math.floor(Math.random() * randLimit2));
      // var x0 = Math.cos(angle+Math.PI)*radius*5+centerX;
      // var y0 = Math.sin(angle+Math.PI)*radius*5+centerY;
      // var x0_r = x0;
      // var y0_r = 300-y0;
      // var x = Math.cos(angle+Math.PI)*radius2+x0;
      // var y = Math.sin(angle+Math.PI)*radius2+y0;
      // var x_r = x;
      // var y_r = 300-y;
      //
      // ctx4_copy.beginPath();
      // ctx4_copy.shadowColor = waterColor+"0.8)";
      // ctx4_copy.shadowOffsetX = 0;
      // ctx4_copy.shadowOffsetY = 0;
      // ctx4_copy.shadowBlur    = 20;
      // ctx4_copy.strokeStyle = waterColor+"0.004)";
      // ctx4_copy.lineWidth = 16;
      //   // Draw each bar
      //   ctx4_copy.moveTo(x0_r,y0_r);
      //   ctx4_copy.lineTo(x_r,y_r);
      //   ctx4_copy.stroke();
      // ctx4_copy.closePath();

      // by chance draw lake refraction
      var chance = Math.floor(Math.random()*30);
      if(chance==0) {
        var randx0 = Math.floor(Math.random()*1000)-100;
        var range = Math.floor(Math.random()*250)+50;
        var randx1 = randx0 + range;
        var randy0 = Math.floor(Math.random()*300);
        var thick = Math.floor(Math.random()*3*(randy0/100));
        ctx3_copy.beginPath();
        ctx3_copy.shadowColor = waterColor+"1.0)";
        ctx3_copy.shadowOffsetX = 0;
        ctx3_copy.shadowOffsetY = 0;
        ctx3_copy.shadowBlur    = 40;
        ctx3_copy.strokeStyle = waterColor+"0.05)";
        ctx3_copy.lineCap = "round";
        ctx3_copy.lineWidth = thick;
        ctx3_copy.moveTo(randx0,randy0);
        ctx3_copy.lineTo(randx1,randy0);
        ctx3_copy.stroke();
        ctx3_copy.closePath();
        ctx4_copy.beginPath();
        ctx4_copy.shadowColor = waterColor+"1.0)";
        ctx4_copy.shadowOffsetX = 0;
        ctx4_copy.shadowOffsetY = 0;
        ctx4_copy.shadowBlur    = 40;
        ctx4_copy.strokeStyle = waterColor+"0.05)";
        ctx4_copy.lineCap = "round";
        ctx4_copy.lineWidth = thick;
        ctx4_copy.moveTo(randx0,randy0);
        ctx4_copy.lineTo(randx1,randy0);
        ctx4_copy.stroke();
        ctx4_copy.closePath();
      }




    }
  }
}
