var	Network = synaptic.Network,
		Architect = synaptic.Architect,
		computation;

//DEBUG
// $(document).ready(function() {
//     $(this).on('keydown', function(event) {
//         if (event.keyCode == 13) { //enter pressed
//
//         }
//     });
// })

//TODO: (1) UI
//			(2) Compare fitness with parents
//			(3)	Check Converge, if always 0, then make 2nd tier decision.
//			(4) Train by user inputs
//			(5) Optimization (threading?)
//			(6) Finding the best mutation and crossOver

var Learn = {

  // Array of networks for generation ith Genomes
  genomes: [],

  // Current runnning genome/generation/fittest so far/fittest from last generation
  genome: 0,
  generation: 0,

	currentFittest: 0,
	prevFittest: 0,

	mutationCount: 0,
	crossCount: 0,

	watchYouPlay: false,

  // Set this, to verify genome experience BEFORE running it
  shouldCheckExperience: true,

};

$(document).ready(function() {
	// Initialize the Learner
	Learn.init = function (genomeUnits, selection, mutationProb) {
		write("Initializing Learn...");
	  Learn.genome = 0;
	  Learn.generation = 0;

	  Learn.genomeUnits = genomeUnits;
	  Learn.selection = selection;
	  Learn.mutationProb = mutationProb;
	}

	// Build initial genomes
	Learn.startLearning = function () {
		write("Learn Start");
	  while (Learn.genomes.length < Learn.genomeUnits) {
	    Learn.genomes.push(Learn.buildGenome(3, 1));
	  }

	  Learn.executeGeneration();
	}

	//make neural networks
	Learn.buildGenome = function (inputs, outputs) {
		write("Building neural network...");
	  var network = new Architect.Perceptron(inputs, 4, 4, outputs);

	  return network;
	}

	// Given the the array genomes,
	// apply method `executeGenome` for each genome.
	// After all genomes have completed, execute:
	//
	// 1) Select best genomes (Choose 4)
	// 2) Does cross over (except for 2 genomes)
	// 3) Does Mutation-only on remaining genomes and fill up the genomes for next generation
	// 4) Execute next generation
	Learn.executeGeneration = function (){

	  Learn.generation++;
		write("=====================================");
		write("<b>Execute generation </b>" + Learn.generation);
		Learn.currentFittest = 0;
	  Learn.genome = 0;

	  async.mapSeries(Learn.genomes, Learn.executeGenome, function (argument) {
			//clear logs for optimization
			$("#logs").empty();

	    // Kill worst genomes
	    Learn.genomes = Learn.selectBestGenomes(Learn.selection);

	    // Copy best genomes
	    var bestGenomes = _.clone(Learn.genomes);
			Learn.prevFittest = bestGenomes[0].fitness;

			// For UI purposes, clear the genomes
			Learn.genomes = [];

	    // Cross Over
			Learn.crossCount = 0;
	    while (Learn.genomes.length < Learn.genomeUnits - 2) {
	      // Get two random Genomes
	      var genA = _.sample(bestGenomes).toJSON();
	      var genB = _.sample(bestGenomes).toJSON();

	      // Cross over and Mutate
	      var newGenome = Learn.mutate(Learn.crossOver(genA, genB));
				var newGenome2 = Learn.crossOver(genA, genB);

	      // Add to generation
	      Learn.genomes.push(Network.fromJSON(newGenome));
				Learn.genomes.push(Network.fromJSON(newGenome2));

				Learn.crossCount+=2;

	    }
			write("Crossed " + Learn.crossCount + " new genome");

	    // Mutation-only
			Learn.mutationCount = 0;
	    while (Learn.genomes.length < Learn.genomeUnits) {
	      // Get one random Genomes
	      var gen = _.sample(bestGenomes).toJSON();

	      // Mutate
	      var newGenome = Learn.mutate(gen);

	      // Add to generation
	      Learn.genomes.push(Network.fromJSON(newGenome));

				Learn.mutationCount++;
	    }
			write("Mutated " + Learn.mutationCount + " new genome");

			write("=====================================");

	    // Execute next generation
	    Learn.executeGeneration();
	  });
	}

	// Sort all the genomes, and delete the worst one
	// until the genome list has selectN elements.
	Learn.selectBestGenomes = function (selectN){
	  var selected = _.sortBy(Learn.genomes, 'fitness').reverse();
	  while (selected.length > selectN) {
	    selected.pop();
	  }

	  return selected;
	}

	// Does random mutations across all
	// the biases and weights of the Networks
	// (This must be done in the JSON to
	// prevent modifying the current one)
	Learn.mutate = function (net){
	  // Mutate
	  Learn.mutateDataKeys(net.neurons, 'bias', Learn.mutationProb);
	  Learn.mutateDataKeys(net.connections, 'weight', Learn.mutationProb);

	  return net;
	}

	// Given an Array of objects with key `key`,
	// and also a `mutationRate`, randomly Mutate
	// the value of each key if random value is
	// lower than mutationRate for each element.
	Learn.mutateDataKeys = function (a, key, mutationRate){
	  for (var k = 0; k < a.length; k++) {
	    // Should mutate?
	    if (Math.random() > mutationRate) {
	      continue;
	    }

	    a[k][key] += a[k][key] * (Math.random() - 0.5) * 3 + (Math.random() - 0.5);
	  }
	}

	// Mating genomes. Crossing their Neural Network.
	// Those two methods convert from JSON to Array, and from Array to JSON
	Learn.crossOver = function (netA, netB) {
	  // Swap (50% prob.)
	  if (Math.random() > 0.5) {
	    var tmp = netA;
	    netA = netB;
	    netB = tmp;
	  }

	  // Clone network
	  netA = _.cloneDeep(netA);
	  netB = _.cloneDeep(netB);

	  // Cross over data keys
	  Learn.crossOverDataKey(netA.neurons, netB.neurons, 'bias');

	  return netA;
	}

	// Given an Object A and an object B, both Arrays
	// of Objects:
	//
	// 1) Select a cross over point (cutLocation)
	//    randomly (going from 0 to A.length)
	// 2) Swap values from `key` one to another,
	//    starting by cutLocation
	Learn.crossOverDataKey = function (a, b, key) {
	  var cutLocation = Math.round(a.length * Math.random());

	  var tmp;
	  for (var k = cutLocation; k < a.length; k++) {
	    // Swap
	    tmp = a[k][key];
	    a[k][key] = b[k][key];
	    b[k][key] = tmp;
	  }
	}

	// Waits the game to end, and start a new one, then:
	// 1) Take input data from game
	// 2) On data read, applies the neural network, and
	//    set it's output
	// 3) When the game has ended and compute the fitness
	//
	//TODO: add-ones: watch you play
	Learn.executeGenome = function (genome, next){
		write("-------------------------------------");
		write("<b>Execute genome #" + (Learn.genomes.indexOf(genome)+1) + "</b>");
	  Learn.genome = Learn.genomes.indexOf(genome) + 1;


		var prevAction = null;
		Learn.oneKey = true;
		computation = setInterval(function(){

			// If dinosaur crashed or not playing
			if(!runner.playing || runner.crashed) {

				write("Ended");
				clearInterval(computation);

				//Check if the genome only press one key, that doesn't count
				if(Learn.oneKey) {
					genome.fitness = 0;
				} else {
				//fitness is the distance trex ran in pixel
					// genome.fitness = runner.distanceMeter.getActualDistance(Math.ceil(runner.distanceRan));
					genome.fitness = runner.jumpCount;
				}
				write("Result: " + genome.fitness);

				if(genome.fitness > Learn.currentFittest) {
					Learn.currentFittest = genome.fitness;
					write("Result is fittest!");
				}

				write("-------------------------------------");
				// next && next();
		    startNewGame(next);
			}

			//ELSE, dinosaur computes neural network and make action
			write("Computing network...");
			var inputs;
			if(runner.horizon.obstacles.length>0) {
				inputs = [
					// Math.ceil(runner.horizon.obstacles[0].xPos-runner.tRex.xPos),
					Math.ceil(runner.horizon.obstacles[0].xPos-runner.tRex.xPos)-runner.tRex.SPRITE_SIZE,
					Math.ceil(150-runner.horizon.obstacles[0].yPos),
					runner.currentSpeed
				];
			} else {
				inputs = [
					9999,
					0,
					runner.currentSpeed
				];
			}
			// Apply to network
			var outputs = genome.activate(inputs);
			setGameOutput(outputs[0]);
			if(getDiscreteState(outputs[0]) != prevAction) {
				Learn.oneKey = false;
			}
			prevAction = getDiscreteState(outputs[0]);


		}, 1000/30);
	}

	// Load genomes saved from JSON file
	// Parameter: genomes array, boolean to delete current genomes
	// Learn.loadGenomes = function (genomes, delete){
	//   if (delete) {
	//     Learn.genomes = [];
	//   }
	//
	//   var loaded = 0;
	//   for (var k in genomes) {
	//     Learn.genomes.push(Network.fromJSON(genomes[k]));
	//     loaded++;
	//   }
	//
	//   write('Loaded ' + loaded + ' genomes');
	// }

});
