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

 // integer representing the selected key - 0 for A, 11 for G#
var selectedKey = localStorage.getItem("selectedKey");

// integer representing the selected scale (see intervalssettings.html & SCALE_NAMES)
var selectedScale = localStorage.getItem("selectedScale");

// holds names of the scales
var SCALE_NAMES = [
    "Major",
    "Minor Pentatonic",
    "Major Pentatonic",
    "Major Triad",
    "Major 7th",
    "Dominant 7th",
    "Mixolydian"
];

// holds coordinates for each root note - x being the string, y the fret
var ROOT_NOTE_COORDINATES = [
    [3,4], // A
    [3,5], // A♯
    [3,6], // B
    [2,2], // C
    [2,3], // C♯
    [2,4], // D
    [2,5], // D♯
    [2,6], // E
    [2,7], // F
    [2,8], // F♯
    [3,2], // G
    [3,3]  // G♯
];

// holds a list of all intervals in each scale
var SCALE_LIST = [
    Major = [
        "Major 2nd",
        "Major 3rd",
        "Perfect 4th",
        "Perfect 5th",
        "Major 6th",
        "Major 7th",
        "Octave"
    ],

    MinorPentatonic =[
        "Minor 3rd",
        "Perfect 4th",
        "Perfect 5th",
        "Minor 7th",
        "Octave"
    ],

    MajorPentatonic =[
        "Major 2nd",
        "Major 3rd",
        "Perfect 5th",
        "Major 6th",
        "Octave"
    ],

    MajorTriad = [
        "Major 3rd",
        "Perfect 5th",
        "Octave"
    ],

    Major7th = [
        "Major 3rd",
        "Perfect 5th",
        "Major 7th",
        "Octave"
    ],

    Dominant7th = [
        "Major 3rd",
        "Perfect 5th",
        "Minor 7th",
        "Octave"
    ],

    Mixolydian =[
        "Major 2nd",
        "Major 3rd",
        "Perfect 4th",
        "Perfect 5th",
        "Major 6th",
        "Minor 7th",
        "Octave"
    ]
];

// the position of the root note for the scale in the given key
var ROOT_NOTE = ROOT_NOTE_COORDINATES[selectedKey];

var INTERVAL_DIFFERENCE = {
    "Minor 2nd": [0,1],
    "Major 2nd": [0,2],
    "Minor 3rd": [0, 3],
    "Major 3rd": [-1,-1],
    "Perfect 4th": [-1,0],
    "Tritone": [-1,1],
    "Perfect 5th": [-1,2],
    //"minor 6th": "", //UNUSED
    "Major 6th": [-2,-1],
    "Minor 7th": [-2,0],
    "Major 7th": [-2,1],
    "Octave": [-2,2],
};

var scalesConstants = {
    ROOT_NOTE: ROOT_NOTE,

    // the list of intervals in the selected scale
    SELECTED_SCALE_LIST: SCALE_LIST[selectedScale],

    // the name of the selected scale
    SCALE_NAME: shared.NOTES[ROOT_NOTE[0]][ROOT_NOTE[1]] + " " + SCALE_NAMES[selectedScale],

    // the coordinates of each interval relative to the root note
    INTERVAL_DIFFERENCE: INTERVAL_DIFFERENCE,

    // the keys of the above object (i.e. the name of each interval)
    INTERVAL_DIFFERENCE_KEYS: Object.keys(INTERVAL_DIFFERENCE)
};

module.exports = scalesConstants;

},{"./exercisesShared":1}],3:[function(require,module,exports){
var consts = require('./scalesConstants');
var shared = require('./exercisesShared');

var previousRecordScales = localStorage.getItem("previousRecordScales");

var scale = [
    consts.ROOT_NOTE
];

// Creates the scale table with positions of each note in the selected scale
for (var i = 0; i < consts.INTERVAL_DIFFERENCE_KEYS.length; i++) {
    for (var j = 0; j < consts.SELECTED_SCALE_LIST.length; j++) {
        if(consts.SELECTED_SCALE_LIST[j] == consts.INTERVAL_DIFFERENCE_KEYS[i]) {
            scale.push([
                consts.ROOT_NOTE[0] + consts.INTERVAL_DIFFERENCE[consts.INTERVAL_DIFFERENCE_KEYS[i]][0],
                consts.ROOT_NOTE[1] + consts.INTERVAL_DIFFERENCE[consts.INTERVAL_DIFFERENCE_KEYS[i]][1]
            ]);
        }
    }
}

/**
 * Gets the name of the interval from a given note
 * @param  {int} currentNote The coordinates of a note
 * @return {string}          The name of the interval from root note to the given note
 */
function getIntervalName(currentNote) {
    for (var i = 0; i < scale.length; i++) {

        // if the given note matches one in the scale it is the correct interval
        if (currentNote.toString() == scale[i].toString()) {
            // -1 because no root note in selectedScale table
            return(consts.SELECTED_SCALE_LIST[i - 1]);
        }
    }
}

/**
 * Gets the name of a note from a given string & fret
 * @param  {int} string The string the note is on
 * @param  {int} fret   The fret the note is on
 * @return {string}     The name of the note at the given string/fret
 */
function getNoteName(string, fret) {
    return shared.NOTES[string][fret];
}

var stage = new Kinetic.Stage({
    container: 'container',
    width: window.innerWidth,
    height: 400
});

var stringLength = stage.getWidth() - 50;

/**
 * Draws buttons on each fret
 */
function drawCircles() {
    var circleLayer = new Kinetic.Layer();
    var rootFret = scale[0][1];
    var rootString = scale[0][0];

    for (var string = 0; string < 4; string++) {
        for (var fret = 0; fret < shared.MAX_FRETS; fret++ ) {
            if (fret == rootFret && string == rootString) {
                shared.drawCircle((50 + ((stringLength / shared.MAX_FRETS) / 2)) + (((stringLength - 50) / shared.MAX_FRETS)  * rootFret), 50 + (rootString * shared.STRING_SPACING), 15, [string,fret], "#E51400", circleLayer, 1, buttonClicked);
            }
            else {
                shared.drawCircle((50 + ((stringLength / shared.MAX_FRETS) / 2)) + (((stringLength - 50) / shared.MAX_FRETS)  * fret), 50 + (string * shared.STRING_SPACING), 15, [string,fret],  "black", circleLayer, 0.75, buttonClicked);
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
 * Sets the text for instructions
 * @param {string} The new instruction text
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
 * Sets the text for feedback (correct/incorrect)
 * @param {string} newFeedback The new feedback text
 * @param {string} colour      The colour of the text
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

shared.drawStrings(stage);

/**
 * Function called on a button click
 * @param  {string} note The coordinates of the clicked note
 */
function buttonClicked(note) {
    note = note.join(separator = "");
    if(exerciseIsRunning) {
        if(note == currentNote.join(separator="")) {
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

/**
 * Sets the current note to a random note on the scale that isn't the root
 */
function gameState() {
    do {
        currentNote = scale[Math.floor(Math.random() * scale.length)];
    } while (currentNote == scale[0]);

    setInstructionText(getIntervalName(currentNote) + " (" + getNoteName(currentNote[0], currentNote[1]) + ")");
}

/**
 * Called once a second to update the timer text
 */
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

/**
 * Called at the end of the exercise to display score & highscores
 */
function endExercise() {
    exerciseIsRunning = false;
    clearInterval(shared.timerR);
    shared.TIMER_DISPLAY.innerHTML = "0:00";

    document.getElementById("ootHeader").innerHTML = "Time's up!";
    document.getElementById("finalCorrect").innerHTML = shared.score;
    document.getElementById("finalTotal").innerHTML = shared.totalQuestions;
    document.getElementById("outOfTime").style.display = "block";
console.log(previousRecordScales)
    if (!previousRecordScales) {
        document.getElementById("noRecord").style.display = "block";
        document.getElementById("noPreviousRecordValue").innerHTML = shared.score;
        localStorage.setItem("previousRecordScales", shared.score);
    }
    else if (previousRecordScales < shared.score) {
        document.getElementById("beatRecord").style.display = "block";
        document.getElementById("beatPreviousRecordValue").innerHTML = previousRecordScales;
        localStorage.setItem("previousRecordScales", shared.score);
    }
    else {
        document.getElementById("lostRecord").style.display = "block";
        document.getElementById("lostPreviousRecordValue").innerHTML = previousRecordScales;
    }

}

var buttonLayer = new Kinetic.Layer();

/**
 * Draws the buttons for viewing a scale and starting the exercise
 */
function drawButtons() {
    var startButton = new Kinetic.Rect({
        x: stage.width() / 3 - 150,
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
        x: stage.width() / 3 - 125,
        y: 155 / 2 + 7, // magic number !!
        width: 200,
        height: 50,
        fontFamily: "Arial",
        fontSize: 32,
        fill: "black",
        align: "center"
    });

    var viewScaleButton = new Kinetic.Rect({
        x: stage.width() / 3 + 150,
        y: 155 / 2,
        width: 250,
        height: 50,
        fill: "lightgrey",
        stroke: "black",
        strokeWidth: 4,
        cornerRadius: 5,
    });
    var viewScaleButtonText = new Kinetic.Text({
        text: "View Scale",
        x: stage.width() / 3 + 175,
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
    buttonLayer.add(viewScaleButton);
    buttonLayer.add(viewScaleButtonText);
    stage.add(buttonLayer);

    startButton.on("mousedown touchstart", function() {
        start();
    });

    startButtonText.on("mousedown touchstart", function() {
        start();
    });

    viewScaleButton.on("mousedown touchstart", function() {
        viewScale();
    });

    viewScaleButtonText.on("mousedown touchstart", function() {
        viewScale();
    });
}

/**
 * Starts the exercise - hides buttons, starts timer and draws circle buttons
 */
function start() {
    buttonLayer.destroy();
    exerciseIsRunning = true;
    shared.timerR = setInterval(updateTimer, shared.TIMER_TICK_MS); // in ms - 1000 msec = 1 sec
    drawCircles();
    gameState();
    updateTimer();
}

var circleLayer = new Kinetic.Layer();

/**
 * Function to view the selected scale
 */
function viewScale() {
    buttonLayer.destroy();
    drawBackButton();
    setInstructionText(consts.SCALE_NAME);

    for (var string = 0; string < 4; string++) {
        for (var fret = 0; fret < shared.MAX_FRETS; fret++ ) {
            for (var i = 0; i < scale.length; i++) {
                if (scale[0][0] == string && scale[0][1] == fret) {
                    shared.drawCircle(
                        (50 + ((stringLength / shared.MAX_FRETS) / 2)) + (((stringLength - 50) / shared.MAX_FRETS)  * fret),
                        50 + (string * shared.STRING_SPACING), 15, "", "#E51400", circleLayer, 1, buttonClicked
                    );

                    shared.drawText(
                        getNoteName(scale[0][0], scale[0][1]),
                        (50 + ((stringLength / shared.MAX_FRETS) / 2)) + (((stringLength - 50) / shared.MAX_FRETS)  * fret) - 6,
                        50 + (string * shared.STRING_SPACING) - 7, circleLayer
                    );
                } else if (scale[i][0] == string && scale[i][1] == fret) {
                    shared.drawCircle((50 + ((stringLength / shared.MAX_FRETS) / 2)) + (((stringLength - 50) / shared.MAX_FRETS)  * fret), 50 + (string * shared.STRING_SPACING), 15, "", "black", circleLayer, 1, buttonClicked);
                    shared.drawText(getNoteName(scale[i][0], scale[i][1]), (50 + ((stringLength / shared.MAX_FRETS) / 2)) + (((stringLength - 50) / shared.MAX_FRETS)  * fret) - 6, 50 + (string * shared.STRING_SPACING) - 7, circleLayer, false, false, false, "white");
                }
            }
        }
    }

    stage.add(circleLayer);
}

/**
 * Resets the exercise to initial state
 */
function resetExercise() {
    backButtonLayer.destroy();
    drawButtons();
    circleLayer.destroy();
    setInstructionText("");
}

var backButtonLayer = new Kinetic.Layer();

/**
 * Draws the back button when viewing an exercise
 */
function drawBackButton() {
    var backButton = new Kinetic.Rect({
        x: stage.width() / 2 - 125,
        y: 155 / 2 + 150,
        width: 250,
        height: 50,
        fill: "lightgrey",
        stroke: "black",
        strokeWidth: 4,
        cornerRadius: 5,
    });
    var backButtonText = new Kinetic.Text({
        text: "Back",
        x: stage.width() / 2 - 100,
        y: 155 / 2 + 157, // 7 = magic number !!
        width: 200,
        height: 50,
        fontFamily: "Arial",
        fontSize: 32,
        fill: "black",
        align: "center",
    });

    backButtonLayer.add(backButton);
    backButtonLayer.add(backButtonText);
    stage.add(backButtonLayer);

    backButtonLayer.draw();

    backButton.on("mousedown touchstart", function() {
        resetExercise();
    });

    backButtonText.on("mousedown touchstart", function() {
        resetExercise();
    });
}

drawButtons();

},{"./exercisesShared":1,"./scalesConstants":2}]},{},[3]);
