(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MAX_STRINGS = 4;
var STRING_SPACING = 35;
var MAX_FRETS = 12;

/**
 * Makes a function to be used when a button is clicked
 * @param  {string} button The ID of the button that was clicked
 * @param {function} callback callback function to use when a button is clicked
 */
function makeFunction (button, callback) {
    return function() {
        callback(button);
    };
}

/**
 * Helper function to draw a line using KineticJS
 * @param  {int} startX    Starting X coordinate
 * @param  {int} startY    Starting Y coordinate
 * @param  {int} endX      Ending X coordinate
 * @param  {int} endY      Ending Y coordinate
 * @param  {int} width     Stroke width (optional - defaults to 10px)
 * @param  {string} colour Hex colour code (optional - defauls to black)
 * @param  {string} cap    KineticJS 'cap' type i.e. end of line (optional - defaults to butt)
 * @param  {object} layer  KineticJS layer to add the line to
 */
function drawLine (startX, startY, endX, endY, width, colour, cap, layer) {
    width = width || 10;
    colour = colour || "#000000";
    cap = cap || "butt";

    line = new Kinetic.Line({
        points: [startX, startY, endX, endY],
        stroke: colour,
        strokeWidth: width,
        lineCap: cap
    });

    layer.add(line);
}


/**
 * Helper function to draw text using KineticJS
 * @param  {string} text   The text to draw
 * @param  {int} x         The X coordinate of the text
 * @param  {int} y         The Y coordinate of the text
 * @param  {object} layer  KineticJS layer to add the text to
 * @param  {string} align  How to align the text (left/right/center) (optional - defaults to left)
 * @param  {string} font   The font name to use (optional - defaults to Arial)
 * @param  {int} size      The size of the text (optional - defaults to 16)
 * @param  {string} colour The colour of the text (optional - defaults to black)
 */
function drawText (text, x, y, layer, align, font, size, colour) {
    align = align || "left";
    font = font || "Arial";
    size = size || 16;
    colour = colour || "black";

    var label = new Kinetic.Text({
        text: text,
        x: x,
        y: y,
        align: align,
        fontFamily: font,
        fontSize: size,
        fill: colour
    });

    layer.add(label);
}

var shared = {
    TIMER_DISPLAY: document.getElementById("timer"),
    SCORE_DISPLAY: document.getElementById("score"),
    CORRECT_DISPLAY: document.getElementById("correct"),
    TOTAL_DISPLAY: document.getElementById("total"),

    // Amount of time in ms between timer ticks | default should be 1000 (1 sec)
    TIMER_TICK_MS: 1000,

    // vertical spacing between strings
    STRING_SPACING: STRING_SPACING,

    // number of strings to draw
    MAX_STRINGS: MAX_STRINGS,

    // number of frets to draw - intervals overrides this
    MAX_FRETS: MAX_FRETS,

    // start at 1 second so first update shows correct total time
    timerSeconds: 1,
    timerMinutes: localStorage.getItem("timeLimit"),
    exerciseIsRunning: false,
    score: 0,
    totalQuestions: 0,
    currentNote: 0,
    timerR: null,

    makeFunction: makeFunction,

    // array to hold the names of notes
    NOTES: [
        ["G♯", "A", "A♯", "B", "C", "C♯", "D", "D♯", "E", "F", "F♯", "G"], // G string
        ["D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯", "D"], // D string
        ["A♯", "B", "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A"], // A string
        ["F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯", "D", "D♯", "E"]  // E string
    ],

    /**
     * Helper function to draw a circle using KineticJS
     * @param  {int} centerX       The center X coordinate of the circle
     * @param  {int} centerY       The center Y coordinate of the circle
     * @param  {int} radius        The radius of the circle
     * @param  {string} id         The ID of the circle - used for tracking individual circles
     * @param  {string} fillColour The colour to fill the circle with
     * @param  {object} layer      The layer to add the circle to
     * @param  {int} opacity       The opacity of the circle (optional - defaults to 1)
     * @param {function} callback the callback to use when this circle is clicked
     */
    drawCircle: function (centerX, centerY, radius, id, fillColour, layer, opacity, callback) {
        opacity = opacity || 1;

        var circle = new Kinetic.Circle({
            x: centerX,
            y: centerY,
            radius: radius,
            fill: fillColour,
            id: id,
            opacity: opacity
        });

        layer.add(circle);
        circle.on("mousedown touchstart", makeFunction(id, callback));
    },

    /**
     * Function to draw the strings on screen.
     * @param {object} stage the stage to add the strings to
     * @param {integer} stringSpacing custom string spacing (optional)
     */
    drawStrings: function (stage, stringSpacing, maxFrets) {
        STRING_SPACING = stringSpacing || STRING_SPACING;
        MAX_FRETS = maxFrets || MAX_FRETS;
        var backgroundLayer = new Kinetic.Layer();
        var i;

        // make strings slightly smaller than width of screen
        var stringLength = stage.getWidth() - 50;

        // draw strings
        for (i = 0; i < MAX_STRINGS; i++) {
            drawLine(50, 50 + (STRING_SPACING * i), stringLength, 50 + (STRING_SPACING * i), 9, "#444", "round", backgroundLayer);
        }

        // draw string labels
        drawText("G", 20, 42, backgroundLayer);
        drawText("D", 20, 42 + STRING_SPACING, backgroundLayer);
        drawText("A", 20, 42 + (STRING_SPACING * 2), backgroundLayer);
        drawText("E", 20, 42 + (STRING_SPACING * 3), backgroundLayer);

        // draw frets
        for (i = 0; i < MAX_FRETS; i++) {

            // offset by 50 from start of the string
            fretLineX = (50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * i);
            drawLine(fretLineX, 35, fretLineX, 50 + (STRING_SPACING * 3) + 15, 5, "#aaa", "round", backgroundLayer);

            drawText(i + 1, fretLineX - 4, 10, backgroundLayer, "center");
        }

        stage.add(backgroundLayer);
    },

    drawLine: drawLine,

    drawText: drawText,
};

module.exports = shared;

},{}],2:[function(require,module,exports){
var shared = require('./exercisesShared');

var MAX_FRETS = 5;
var previousRecordIntervals = localStorage.getItem("previousRecordIntervals");

var stage = new Kinetic.Stage({
    container: 'container',
    width: window.innerWidth,
    height: 400
});

var stringLength = stage.getWidth() - 50;

/**
 * Function to draw all circle 'buttons' at each fret. Root note will be
 * highlighted red, others semi-transparent black
 */
function drawCircles() {
    var circleLayer = new Kinetic.Layer();
    var rootFret = 0;
    var rootString = 3;

    for (var string = 0; string < 4; string++) {
        for (var fret = 0; fret < 5; fret++ ) {

            if (fret == rootFret && string == rootString) {
                shared.drawCircle(
                    (50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * rootFret),
                    50 + (rootString * shared.STRING_SPACING),
                    15,
                    "rootNote",
                    "#E51400",
                    circleLayer,
                    1,
                    buttonClicked
                );
            } else {
                shared.drawCircle(
                    (50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * fret),
                    50 + (string * shared.STRING_SPACING),
                    15,
                    string.toString() + fret.toString(),
                    "black",
                    circleLayer,
                    0.75,
                    buttonClicked
                );
            }
        }
    }

    stage.add(circleLayer);
}

var textLayer = new Kinetic.Layer();
var instructions = new Kinetic.Text({
    text: "",
    x: stage.width() / 2,
    y: 180,
    fontFamily: "Arial",
    fontSize: 32,
    fill: "black",
    align: "center"
});

instructions.offsetX(instructions.getWidth() / 2);

var feedback = new Kinetic.Text({
    text: "",
    x: stage.width() / 2,
    y: 180 + instructions.height(),
    fontFamily: "Arial",
    fontSize: 32,
    fill: "black",
    align: "center",
    opacity: 0
});

feedback.offsetX(feedback.getWidth() / 2);

textLayer.add(feedback);
textLayer.add(instructions);
stage.add(textLayer);

/**
 * Function to set the instruction text and play an animation.
 */
function setInstructionText(newInstruction) {
    instructions.text(newInstruction);
    instructions.offsetX(instructions.getWidth() / 2);
    textLayer.draw();

    var scaleTween = new Kinetic.Tween({
        node: instructions,
        duration: 0.25,
        scaleX: 1.15,
        scaleY: 1.15,
        easing: Kinetic.Easings.EaseInOut,
        onFinish: function() {
            scaleTween.reverse();
        }
    });

    scaleTween.play();
}

/**
 * Function to set the feedback text and play an animation.
 */
function setFeedbackText(newFeedback, colour) {
    feedback.text(newFeedback);
    feedback.offsetX(feedback.getWidth() / 2);
    feedback.setFill(colour);
    textLayer.draw();

    var scaleTween = new Kinetic.Tween({
        node: feedback,
        duration: 0.25,
        scaleX: 1.5,
        scaleY: 1.5,
        easing: Kinetic.Easings.EaseInOut,
        onFinish: function() {
            scaleTween.reverse();
        }
    });

    scaleTween.play();

    var opacityTween = new Kinetic.Tween({
        node: feedback,
        duration: 1,
        opacity: 1,
        easing: Kinetic.Easings.ElasticEaseOut,
    });

    opacityTween.play();
}

function updateTimer() {
    var extraZero = 0;

    shared.timerSeconds -= 1;

    if (shared.timerSeconds < 0) {
        shared.timerMinutes -= 1;
        shared.timerSeconds = 59;
    }

    if (shared.timerSeconds < 10) {
        extraZero = 0;
    }
    else {
        extraZero = "";
    }

    shared.TIMER_DISPLAY.innerHTML = shared.timerMinutes + ":" + extraZero + shared.timerSeconds;

    // check if out of time
    if (shared.timerSeconds === 0 && shared.timerMinutes === 0) {
        endExercise();
    }
}

function endExercise() {
    exerciseIsRunning = false;
    clearInterval(shared.timerR);
    shared.TIMER_DISPLAY.innerHTML = "0:00";

    document.getElementById("ootHeader").innerHTML = "Time's up!";
    document.getElementById("finalCorrect").innerHTML = shared.score;
    document.getElementById("finalTotal").innerHTML = shared.totalQuestions;
    document.getElementById("outOfTime").style.display = "block";

    if (!previousRecordIntervals) {
        document.getElementById("noRecord").style.display = "block";
        document.getElementById("noPreviousRecordValue").innerHTML = shared.score;
        localStorage.setItem("previousRecordIntervals", shared.score);
    }
    else if (previousRecordIntervals < shared.score) {
        document.getElementById("beatRecord").style.display = "block";
        document.getElementById("beatPreviousRecordValue").innerHTML = previousRecordIntervals;
        localStorage.setItem("previousRecordIntervals", shared.score);
    }
    else {
        document.getElementById("lostRecord").style.display = "block";
        document.getElementById("lostPreviousRecordValue").innerHTML = previousRecordIntervals;
    }

}

var buttonLayer = new Kinetic.Layer();
var startButton = new Kinetic.Rect({
    x: stage.width() / 2 - 125,
    y: 155 / 2,
    width: 250,
    height: 50,
    fill: "lightgrey",
    stroke: "black",
    strokeWidth: 4,
    cornerRadius: 5,
});
var startButtonText = new Kinetic.Text({
    text: "Start",
    x: stage.width() / 2 - 100,
    y: 155 / 2 + 7, // magic number !!
    width: 200,
    height: 50,
    fontFamily: "Arial",
    fontSize: 32,
    fill: "black",
    align: "center"
});

buttonLayer.add(startButton);
buttonLayer.add(startButtonText);

// object to hold interval names and IDs used when drawing buttons - IDs are
// the X & Y coordinates of each interval where 00 is 1st fret of G string
var intervals = {
    "Minor 2nd": "31",
    "Major 2nd": "32",
    "Minor 3rd": "33",
    "Major 3rd": "34",
    "Perfect 4th": "20",
    "Tritone": "21",
    "Perfect 5th": "22",
    "Minor 6th": "23",
    "Major 6th": "24",
    "Minor 7th": "10",
    "Major 7th": "11",
    "Octave": "12",
};

var intervalsKeys = Object.keys(intervals);
var currentInterval;

/**
 * Function called when a circle 'button' is clicked. Marks an answer correct
 * and updates score before updating gamestate (moving onto next interval)
 * @param  {string} interval The ID of the button that was clicked
 */
function buttonClicked(interval) {
    if(exerciseIsRunning) {
        if(interval == currentInterval) {
            setFeedbackText("Correct!", "green");
            shared.score += 1;
        }
        else {
            setFeedbackText("Incorrect!", "red");
        }

        shared.totalQuestions += 1;
        shared.TOTAL_DISPLAY.innerHTML = shared.totalQuestions;
        shared.SCORE_DISPLAY.innerHTML = Math.round((shared.score / shared.totalQuestions) * 100);
        shared.CORRECT_DISPLAY.innerHTML = shared.score;

        gameState();
    }
}

// draw the strings and all circles to initialise canvas
shared.drawStrings(stage, null, MAX_FRETS);
drawCircles();

stage.add(buttonLayer);

var intervalButtons = [];

// attach interval names to correct buttons
for(var interval in intervals) {
    intervalButtons[interval] = stage.find("#" + intervals[interval])[0];

    intervalButtons[interval].off("mousedown touchstart"); //remove previous function
    intervalButtons[interval].on("mousedown touchstart", shared.makeFunction(interval, buttonClicked));
}

/**
 * Updates the gamestate - set currentInterval and updates instruction text
 */
function gameState() {
    currentInterval = intervalsKeys[Math.floor(Math.random() * intervalsKeys.length)];
    setInstructionText(currentInterval);
}

/**
 * Called to start the exercise - hides buttons, starts timer and updates game state
 */
function start() {
    buttonLayer.destroy();
    exerciseIsRunning = true;
    shared.timerR = setInterval(updateTimer, shared.TIMER_TICK_MS); // in ms - 1000 msec = 1 sec
    gameState();
    updateTimer();
}

// sets start button to start the exercise
startButton.on("mousedown touchstart", function() {
    start();
});

startButtonText.on("mousedown touchstart", function() {
    start();
});

},{"./exercisesShared":1}]},{},[2]);
