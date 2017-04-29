$(document).ready(function() {
		//Parameter:
		//	population, numbers select to crossOver, mutation probability
		Learn.init(12, 4, 0.5);
		Learn.startLearning();

		//UI update
		setInterval(function() {
			//debug
			// console.log(runner.horizon.obstacles);

			var playing = runner.playing? "Playing" : "Stop";
			$('#gameStatus').text('Status: ' + playing);
			$('#generation').text('Generation: ' + Learn.generation);
			$('#genome').text('Genome: #' + Learn.genome + ' / ' + Learn.genomeUnits);
			$('#mutation').text('Mutation Prob: ' + Learn.mutationProb*100 + '%');
			// $('#fitness').text('Fitness: ' + runner.distanceMeter.getActualDistance(Math.ceil(runner.distanceRan)));
			$('#fitness').text('Fitness (jumped over): ' + runner.jumpCount);
			$('#fittest').text('Current Fittest: ' + Learn.currentFittest);
			$('#prevFittest').text('Previous Fittest: ' + Learn.prevFittest);
			$("#genomes").empty();
			Learn.genomes.forEach(function(genome) {
				$("#genomes").append('<li>Genome #'+(Learn.genomes.indexOf(genome)+1)+': '+Math.ceil(genome.fitness)+'</li>');
			});
			if(runner.horizon.obstacles.length>0) {
				$('#distance').text('Distance: ' + Math.ceil(runner.horizon.obstacles[0].xPos-runner.tRex.xPos-runner.tRex.SPRITE_SIZE));
				$('#size').text('Size: ' + Math.ceil(150-runner.horizon.obstacles[0].yPos));
			} else {
				$('#distance').text('Distance: NaN');
				$('#size').text('Size: NaN');
			}
			$('#speed').text('Speed: ' + round(runner.currentSpeed, 5));
			$('#output').text('Output: ' + round(currentOutput, 10));
			$('#action').text('Action: ' + getDiscreteStateName(currentOutput));

			scrollDownLog();

		}, 1000/15);	//15fps

});

//Get action with the value
var getDiscreteStateName = function(value) {
	if (value < 0.45) {
    return "duck";
  } else if(value > 0.55) {
    return "jump";
  }

  return "none";
}

var round = function(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

//always scroll to bottom on logs
var scrollDownLog = function (){
    var element = document.getElementById("logs");
    element.scrollTop = element.scrollHeight;
}

//write log function
var prevMsgs = "";
var dotCount = 1;
var dotLength = 5;
var write = function(msgs) {
	if(msgs!=prevMsgs) {
		$("#logs").append('<li>'+msgs+'</li>');
	} else {
		$("#logs li:last-child").text(msgs);
		for(var i = 0; i < dotCount; i++) {
			$("#logs li:last-child").append('.');
		}
		dotCount++;
		if(dotCount > dotLength) {
			dotCount = 1;
		}

	}
	prevMsgs = msgs;
}
Math.ceil
