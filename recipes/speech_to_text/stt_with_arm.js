/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var TJBot = require('tjbot');
var config = require('./config');

// obtain our credentials from config.js
var credentials = config.credentials;

// these are the hardware capabilities that our TJ needs for this recipe
var hardware = ['led', 'microphone'];

// set up TJBot's configuration
var tjConfig = {
    log: {
        level: 'debug'
    }
};

// instantiate our TJBot!
var tj = new TJBot(hardware, tjConfig, credentials);

// arm vars
var waveinterval = 1500;
var mincycle = 500;
var maxcycle = 2300;
var midcycle = 1400;
var dutycycle = mincycle;

// Init board, setup software PWM on pin 26.
var Gpio = require('pigpio').Gpio;
var motor = new Gpio(7, {
    mode: Gpio.OUTPUT
});

// full list of colors that TJ recognizes, e.g. ['red', 'green', 'blue']
var tjColors = tj.shineColors();

console.log("I understand lots of colors.  You can tell me to shine my light a different color by saying 'turn the light red' or 'change the light to green' or 'turn the light off'.");

// uncomment to see the full list of colors TJ understands
// console.log("Here are all the colors I understand:");
// console.log(tjColors.join(", "));

// hash map to easily test if TJ understands a color, e.g. {'red': 1, 'green': 1, 'blue': 1}
var colors = {};
tjColors.forEach(function(color) {
    colors[color] = 1;
});

tj.shine('red');

// listen for speech
tj.listen(function(msg) {
    var containsTurn = msg.indexOf("turn") >= 0;
    var containsChange = msg.indexOf("change") >= 0;
    var containsSet = msg.indexOf("set") >= 0;
    var containsLight = msg.indexOf("the light") >= 0;
    var containsDisco = msg.indexOf("disco") >= 0;
    var containsWave = msg.indexOf("wave") >= 0;
    var containsFive = msg.indexOf("five") >= 0;

    if ((containsTurn || containsChange || containsSet) && containsLight) {
        // was there a color uttered?
        var words = msg.split(" ");
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
		console.log(word);
            if (colors[word] != undefined || word == "on" || word == "off") {
                // yes!
                console.log("found a color");
                tj.shine(word);
		console.log("motor: reset to", maxcycle)
		motor.servoWrite(maxcycle);
		setTimeout(function() {
		    console.log("motor: reset to", mincycle)
		    motor.servoWrite(mincycle);
		}, waveinterval / 3);
                break;
            }
        }
    } else if (containsDisco) {
        discoParty();
    } else if (containsWave ) {
        wave();
    } else if (containsFive ) {
        five();
    }
});

// High five with the user
function five() {
	motor.servoWrite(midcycle);
	setTimeout(function() {
	    console.log("motor: reset to", mincycle)
	    motor.servoWrite(mincycle);
	}, waveinterval / 3);
}

// wave to the user
function wave() {
	motor.servoWrite(maxcycle);
	setTimeout(function() {
	    console.log("motor: reset to", mincycle)
	    motor.servoWrite(mincycle);
	}, waveinterval / 3);
}

// let's have a disco party!
function discoParty() {
    for (i = 0; i < 30; i++) {
        setTimeout(function() {
            var randIdx = Math.floor(Math.random() * tjColors.length);
            var randColor = tjColors[randIdx];
            tj.shine(randColor);
        }, i * 250);
    }
    var cycle = 500;
    for (i = 0; i < 10; i++) {
        setTimeout(function() {
            console.log(i);
            if ( i & 1 ) {
            cycle = maxcycle;
            console.log("even");
            } else {
            cycle = mincycle;
            console.log("odd");
            };
             
            console.log(cycle);
	    motor.servoWrite(cycle);
        }, i * 1500);
    }
    console.log("made it");
}

