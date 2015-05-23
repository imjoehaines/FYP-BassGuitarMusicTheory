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
     * @param {object} localStage the stage to add the strings to
     */
    drawStrings: function (localStage) {
        stage = localStage || stage;
        var backgroundLayer = new Kinetic.Layer();
        var i;

        // make strings slightly smaller than width of screen
        stringLength = stage.getWidth() - 50;

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

},{"./exercisesShared":1,"./scalesConstants":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9leGVyY2lzZXMvZXhlcmNpc2VzU2hhcmVkLmpzIiwianMvZXhlcmNpc2VzL3NjYWxlc0NvbnN0YW50cy5qcyIsImpzL2V4ZXJjaXNlcy9zY2FsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIE1BWF9TVFJJTkdTID0gNDtcbnZhciBTVFJJTkdfU1BBQ0lORyA9IDM1O1xudmFyIE1BWF9GUkVUUyA9IDEyO1xuXG4vKipcbiAqIE1ha2VzIGEgZnVuY3Rpb24gdG8gYmUgdXNlZCB3aGVuIGEgYnV0dG9uIGlzIGNsaWNrZWRcbiAqIEBwYXJhbSAge3N0cmluZ30gYnV0dG9uIFRoZSBJRCBvZiB0aGUgYnV0dG9uIHRoYXQgd2FzIGNsaWNrZWRcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHVzZSB3aGVuIGEgYnV0dG9uIGlzIGNsaWNrZWRcbiAqL1xuZnVuY3Rpb24gbWFrZUZ1bmN0aW9uIChidXR0b24sIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBjYWxsYmFjayhidXR0b24pO1xuICAgIH07XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGRyYXcgYSBsaW5lIHVzaW5nIEtpbmV0aWNKU1xuICogQHBhcmFtICB7aW50fSBzdGFydFggICAgU3RhcnRpbmcgWCBjb29yZGluYXRlXG4gKiBAcGFyYW0gIHtpbnR9IHN0YXJ0WSAgICBTdGFydGluZyBZIGNvb3JkaW5hdGVcbiAqIEBwYXJhbSAge2ludH0gZW5kWCAgICAgIEVuZGluZyBYIGNvb3JkaW5hdGVcbiAqIEBwYXJhbSAge2ludH0gZW5kWSAgICAgIEVuZGluZyBZIGNvb3JkaW5hdGVcbiAqIEBwYXJhbSAge2ludH0gd2lkdGggICAgIFN0cm9rZSB3aWR0aCAob3B0aW9uYWwgLSBkZWZhdWx0cyB0byAxMHB4KVxuICogQHBhcmFtICB7c3RyaW5nfSBjb2xvdXIgSGV4IGNvbG91ciBjb2RlIChvcHRpb25hbCAtIGRlZmF1bHMgdG8gYmxhY2spXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGNhcCAgICBLaW5ldGljSlMgJ2NhcCcgdHlwZSBpLmUuIGVuZCBvZiBsaW5lIChvcHRpb25hbCAtIGRlZmF1bHRzIHRvIGJ1dHQpXG4gKiBAcGFyYW0gIHtvYmplY3R9IGxheWVyICBLaW5ldGljSlMgbGF5ZXIgdG8gYWRkIHRoZSBsaW5lIHRvXG4gKi9cbmZ1bmN0aW9uIGRyYXdMaW5lIChzdGFydFgsIHN0YXJ0WSwgZW5kWCwgZW5kWSwgd2lkdGgsIGNvbG91ciwgY2FwLCBsYXllcikge1xuICAgIHdpZHRoID0gd2lkdGggfHwgMTA7XG4gICAgY29sb3VyID0gY29sb3VyIHx8IFwiIzAwMDAwMFwiO1xuICAgIGNhcCA9IGNhcCB8fCBcImJ1dHRcIjtcblxuICAgIGxpbmUgPSBuZXcgS2luZXRpYy5MaW5lKHtcbiAgICAgICAgcG9pbnRzOiBbc3RhcnRYLCBzdGFydFksIGVuZFgsIGVuZFldLFxuICAgICAgICBzdHJva2U6IGNvbG91cixcbiAgICAgICAgc3Ryb2tlV2lkdGg6IHdpZHRoLFxuICAgICAgICBsaW5lQ2FwOiBjYXBcbiAgICB9KTtcblxuICAgIGxheWVyLmFkZChsaW5lKTtcbn1cblxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBkcmF3IHRleHQgdXNpbmcgS2luZXRpY0pTXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHRleHQgICBUaGUgdGV4dCB0byBkcmF3XG4gKiBAcGFyYW0gIHtpbnR9IHggICAgICAgICBUaGUgWCBjb29yZGluYXRlIG9mIHRoZSB0ZXh0XG4gKiBAcGFyYW0gIHtpbnR9IHkgICAgICAgICBUaGUgWSBjb29yZGluYXRlIG9mIHRoZSB0ZXh0XG4gKiBAcGFyYW0gIHtvYmplY3R9IGxheWVyICBLaW5ldGljSlMgbGF5ZXIgdG8gYWRkIHRoZSB0ZXh0IHRvXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGFsaWduICBIb3cgdG8gYWxpZ24gdGhlIHRleHQgKGxlZnQvcmlnaHQvY2VudGVyKSAob3B0aW9uYWwgLSBkZWZhdWx0cyB0byBsZWZ0KVxuICogQHBhcmFtICB7c3RyaW5nfSBmb250ICAgVGhlIGZvbnQgbmFtZSB0byB1c2UgKG9wdGlvbmFsIC0gZGVmYXVsdHMgdG8gQXJpYWwpXG4gKiBAcGFyYW0gIHtpbnR9IHNpemUgICAgICBUaGUgc2l6ZSBvZiB0aGUgdGV4dCAob3B0aW9uYWwgLSBkZWZhdWx0cyB0byAxNilcbiAqIEBwYXJhbSAge3N0cmluZ30gY29sb3VyIFRoZSBjb2xvdXIgb2YgdGhlIHRleHQgKG9wdGlvbmFsIC0gZGVmYXVsdHMgdG8gYmxhY2spXG4gKi9cbmZ1bmN0aW9uIGRyYXdUZXh0ICh0ZXh0LCB4LCB5LCBsYXllciwgYWxpZ24sIGZvbnQsIHNpemUsIGNvbG91cikge1xuICAgIGFsaWduID0gYWxpZ24gfHwgXCJsZWZ0XCI7XG4gICAgZm9udCA9IGZvbnQgfHwgXCJBcmlhbFwiO1xuICAgIHNpemUgPSBzaXplIHx8IDE2O1xuICAgIGNvbG91ciA9IGNvbG91ciB8fCBcImJsYWNrXCI7XG5cbiAgICB2YXIgbGFiZWwgPSBuZXcgS2luZXRpYy5UZXh0KHtcbiAgICAgICAgdGV4dDogdGV4dCxcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSxcbiAgICAgICAgYWxpZ246IGFsaWduLFxuICAgICAgICBmb250RmFtaWx5OiBmb250LFxuICAgICAgICBmb250U2l6ZTogc2l6ZSxcbiAgICAgICAgZmlsbDogY29sb3VyXG4gICAgfSk7XG5cbiAgICBsYXllci5hZGQobGFiZWwpO1xufVxuXG52YXIgc2hhcmVkID0ge1xuICAgIFRJTUVSX0RJU1BMQVk6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGltZXJcIiksXG4gICAgU0NPUkVfRElTUExBWTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY29yZVwiKSxcbiAgICBDT1JSRUNUX0RJU1BMQVk6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29ycmVjdFwiKSxcbiAgICBUT1RBTF9ESVNQTEFZOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvdGFsXCIpLFxuXG4gICAgLy8gQW1vdW50IG9mIHRpbWUgaW4gbXMgYmV0d2VlbiB0aW1lciB0aWNrcyB8IGRlZmF1bHQgc2hvdWxkIGJlIDEwMDAgKDEgc2VjKVxuICAgIFRJTUVSX1RJQ0tfTVM6IDEwMDAsXG5cbiAgICAvLyB2ZXJ0aWNhbCBzcGFjaW5nIGJldHdlZW4gc3RyaW5nc1xuICAgIFNUUklOR19TUEFDSU5HOiBTVFJJTkdfU1BBQ0lORyxcblxuICAgIC8vIG51bWJlciBvZiBzdHJpbmdzIHRvIGRyYXdcbiAgICBNQVhfU1RSSU5HUzogTUFYX1NUUklOR1MsXG5cbiAgICAvLyBudW1iZXIgb2YgZnJldHMgdG8gZHJhdyAtIGludGVydmFscyBvdmVycmlkZXMgdGhpc1xuICAgIE1BWF9GUkVUUzogTUFYX0ZSRVRTLFxuXG4gICAgLy8gc3RhcnQgYXQgMSBzZWNvbmQgc28gZmlyc3QgdXBkYXRlIHNob3dzIGNvcnJlY3QgdG90YWwgdGltZVxuICAgIHRpbWVyU2Vjb25kczogMSxcbiAgICB0aW1lck1pbnV0ZXM6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidGltZUxpbWl0XCIpLFxuICAgIGV4ZXJjaXNlSXNSdW5uaW5nOiBmYWxzZSxcbiAgICBzY29yZTogMCxcbiAgICB0b3RhbFF1ZXN0aW9uczogMCxcbiAgICBjdXJyZW50Tm90ZTogMCxcbiAgICB0aW1lclI6IG51bGwsXG5cbiAgICAvLyBhcnJheSB0byBob2xkIHRoZSBuYW1lcyBvZiBub3Rlc1xuICAgIE5PVEVTOiBbXG4gICAgICAgIFtcIkfima9cIiwgXCJBXCIsIFwiQeKZr1wiLCBcIkJcIiwgXCJDXCIsIFwiQ+KZr1wiLCBcIkRcIiwgXCJE4pmvXCIsIFwiRVwiLCBcIkZcIiwgXCJG4pmvXCIsIFwiR1wiXSwgLy8gRyBzdHJpbmdcbiAgICAgICAgW1wiROKZr1wiLCBcIkVcIiwgXCJGXCIsIFwiRuKZr1wiLCBcIkdcIiwgXCJH4pmvXCIsIFwiQVwiLCBcIkHima9cIiwgXCJCXCIsIFwiQ1wiLCBcIkPima9cIiwgXCJEXCJdLCAvLyBEIHN0cmluZ1xuICAgICAgICBbXCJB4pmvXCIsIFwiQlwiLCBcIkNcIiwgXCJD4pmvXCIsIFwiRFwiLCBcIkTima9cIiwgXCJFXCIsIFwiRlwiLCBcIkbima9cIiwgXCJHXCIsIFwiR+KZr1wiLCBcIkFcIl0sIC8vIEEgc3RyaW5nXG4gICAgICAgIFtcIkZcIiwgXCJG4pmvXCIsIFwiR1wiLCBcIkfima9cIiwgXCJBXCIsIFwiQeKZr1wiLCBcIkJcIiwgXCJDXCIsIFwiQ+KZr1wiLCBcIkRcIiwgXCJE4pmvXCIsIFwiRVwiXSAgLy8gRSBzdHJpbmdcbiAgICBdLFxuXG4gICAgLyoqXG4gICAgICogSGVscGVyIGZ1bmN0aW9uIHRvIGRyYXcgYSBjaXJjbGUgdXNpbmcgS2luZXRpY0pTXG4gICAgICogQHBhcmFtICB7aW50fSBjZW50ZXJYICAgICAgIFRoZSBjZW50ZXIgWCBjb29yZGluYXRlIG9mIHRoZSBjaXJjbGVcbiAgICAgKiBAcGFyYW0gIHtpbnR9IGNlbnRlclkgICAgICAgVGhlIGNlbnRlciBZIGNvb3JkaW5hdGUgb2YgdGhlIGNpcmNsZVxuICAgICAqIEBwYXJhbSAge2ludH0gcmFkaXVzICAgICAgICBUaGUgcmFkaXVzIG9mIHRoZSBjaXJjbGVcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGlkICAgICAgICAgVGhlIElEIG9mIHRoZSBjaXJjbGUgLSB1c2VkIGZvciB0cmFja2luZyBpbmRpdmlkdWFsIGNpcmNsZXNcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGZpbGxDb2xvdXIgVGhlIGNvbG91ciB0byBmaWxsIHRoZSBjaXJjbGUgd2l0aFxuICAgICAqIEBwYXJhbSAge29iamVjdH0gbGF5ZXIgICAgICBUaGUgbGF5ZXIgdG8gYWRkIHRoZSBjaXJjbGUgdG9cbiAgICAgKiBAcGFyYW0gIHtpbnR9IG9wYWNpdHkgICAgICAgVGhlIG9wYWNpdHkgb2YgdGhlIGNpcmNsZSAob3B0aW9uYWwgLSBkZWZhdWx0cyB0byAxKVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIHRoZSBjYWxsYmFjayB0byB1c2Ugd2hlbiB0aGlzIGNpcmNsZSBpcyBjbGlja2VkXG4gICAgICovXG4gICAgZHJhd0NpcmNsZTogZnVuY3Rpb24gKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgaWQsIGZpbGxDb2xvdXIsIGxheWVyLCBvcGFjaXR5LCBjYWxsYmFjaykge1xuICAgICAgICBvcGFjaXR5ID0gb3BhY2l0eSB8fCAxO1xuXG4gICAgICAgIHZhciBjaXJjbGUgPSBuZXcgS2luZXRpYy5DaXJjbGUoe1xuICAgICAgICAgICAgeDogY2VudGVyWCxcbiAgICAgICAgICAgIHk6IGNlbnRlclksXG4gICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgICAgIGZpbGw6IGZpbGxDb2xvdXIsXG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICBvcGFjaXR5OiBvcGFjaXR5XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVyLmFkZChjaXJjbGUpO1xuICAgICAgICBjaXJjbGUub24oXCJtb3VzZWRvd24gdG91Y2hzdGFydFwiLCBtYWtlRnVuY3Rpb24oaWQsIGNhbGxiYWNrKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGRyYXcgdGhlIHN0cmluZ3Mgb24gc2NyZWVuLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsb2NhbFN0YWdlIHRoZSBzdGFnZSB0byBhZGQgdGhlIHN0cmluZ3MgdG9cbiAgICAgKi9cbiAgICBkcmF3U3RyaW5nczogZnVuY3Rpb24gKGxvY2FsU3RhZ2UpIHtcbiAgICAgICAgc3RhZ2UgPSBsb2NhbFN0YWdlIHx8IHN0YWdlO1xuICAgICAgICB2YXIgYmFja2dyb3VuZExheWVyID0gbmV3IEtpbmV0aWMuTGF5ZXIoKTtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgLy8gbWFrZSBzdHJpbmdzIHNsaWdodGx5IHNtYWxsZXIgdGhhbiB3aWR0aCBvZiBzY3JlZW5cbiAgICAgICAgc3RyaW5nTGVuZ3RoID0gc3RhZ2UuZ2V0V2lkdGgoKSAtIDUwO1xuXG4gICAgICAgIC8vIGRyYXcgc3RyaW5nc1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgTUFYX1NUUklOR1M7IGkrKykge1xuICAgICAgICAgICAgZHJhd0xpbmUoNTAsIDUwICsgKFNUUklOR19TUEFDSU5HICogaSksIHN0cmluZ0xlbmd0aCwgNTAgKyAoU1RSSU5HX1NQQUNJTkcgKiBpKSwgOSwgXCIjNDQ0XCIsIFwicm91bmRcIiwgYmFja2dyb3VuZExheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRyYXcgc3RyaW5nIGxhYmVsc1xuICAgICAgICBkcmF3VGV4dChcIkdcIiwgMjAsIDQyLCBiYWNrZ3JvdW5kTGF5ZXIpO1xuICAgICAgICBkcmF3VGV4dChcIkRcIiwgMjAsIDQyICsgU1RSSU5HX1NQQUNJTkcsIGJhY2tncm91bmRMYXllcik7XG4gICAgICAgIGRyYXdUZXh0KFwiQVwiLCAyMCwgNDIgKyAoU1RSSU5HX1NQQUNJTkcgKiAyKSwgYmFja2dyb3VuZExheWVyKTtcbiAgICAgICAgZHJhd1RleHQoXCJFXCIsIDIwLCA0MiArIChTVFJJTkdfU1BBQ0lORyAqIDMpLCBiYWNrZ3JvdW5kTGF5ZXIpO1xuXG4gICAgICAgIC8vIGRyYXcgZnJldHNcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IE1BWF9GUkVUUzsgaSsrKSB7XG5cbiAgICAgICAgICAgIC8vIG9mZnNldCBieSA1MCBmcm9tIHN0YXJ0IG9mIHRoZSBzdHJpbmdcbiAgICAgICAgICAgIGZyZXRMaW5lWCA9ICg1MCArICgoc3RyaW5nTGVuZ3RoIC8gTUFYX0ZSRVRTKSAvIDIpKSArICgoKHN0cmluZ0xlbmd0aCAtIDUwKSAvIE1BWF9GUkVUUykgICogaSk7XG4gICAgICAgICAgICBkcmF3TGluZShmcmV0TGluZVgsIDM1LCBmcmV0TGluZVgsIDUwICsgKFNUUklOR19TUEFDSU5HICogMykgKyAxNSwgNSwgXCIjYWFhXCIsIFwicm91bmRcIiwgYmFja2dyb3VuZExheWVyKTtcblxuICAgICAgICAgICAgZHJhd1RleHQoaSArIDEsIGZyZXRMaW5lWCAtIDQsIDEwLCBiYWNrZ3JvdW5kTGF5ZXIsIFwiY2VudGVyXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhZ2UuYWRkKGJhY2tncm91bmRMYXllcik7XG4gICAgfSxcblxuICAgIGRyYXdMaW5lOiBkcmF3TGluZSxcblxuICAgIGRyYXdUZXh0OiBkcmF3VGV4dCxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2hhcmVkO1xuIiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vZXhlcmNpc2VzU2hhcmVkJyk7XG5cbiAvLyBpbnRlZ2VyIHJlcHJlc2VudGluZyB0aGUgc2VsZWN0ZWQga2V5IC0gMCBmb3IgQSwgMTEgZm9yIEcjXG52YXIgc2VsZWN0ZWRLZXkgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInNlbGVjdGVkS2V5XCIpO1xuXG4vLyBpbnRlZ2VyIHJlcHJlc2VudGluZyB0aGUgc2VsZWN0ZWQgc2NhbGUgKHNlZSBpbnRlcnZhbHNzZXR0aW5ncy5odG1sICYgU0NBTEVfTkFNRVMpXG52YXIgc2VsZWN0ZWRTY2FsZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic2VsZWN0ZWRTY2FsZVwiKTtcblxuLy8gaG9sZHMgbmFtZXMgb2YgdGhlIHNjYWxlc1xudmFyIFNDQUxFX05BTUVTID0gW1xuICAgIFwiTWFqb3JcIixcbiAgICBcIk1pbm9yIFBlbnRhdG9uaWNcIixcbiAgICBcIk1ham9yIFBlbnRhdG9uaWNcIixcbiAgICBcIk1ham9yIFRyaWFkXCIsXG4gICAgXCJNYWpvciA3dGhcIixcbiAgICBcIkRvbWluYW50IDd0aFwiLFxuICAgIFwiTWl4b2x5ZGlhblwiXG5dO1xuXG4vLyBob2xkcyBjb29yZGluYXRlcyBmb3IgZWFjaCByb290IG5vdGUgLSB4IGJlaW5nIHRoZSBzdHJpbmcsIHkgdGhlIGZyZXRcbnZhciBST09UX05PVEVfQ09PUkRJTkFURVMgPSBbXG4gICAgWzMsNF0sIC8vIEFcbiAgICBbMyw1XSwgLy8gQeKZr1xuICAgIFszLDZdLCAvLyBCXG4gICAgWzIsMl0sIC8vIENcbiAgICBbMiwzXSwgLy8gQ+KZr1xuICAgIFsyLDRdLCAvLyBEXG4gICAgWzIsNV0sIC8vIETima9cbiAgICBbMiw2XSwgLy8gRVxuICAgIFsyLDddLCAvLyBGXG4gICAgWzIsOF0sIC8vIEbima9cbiAgICBbMywyXSwgLy8gR1xuICAgIFszLDNdICAvLyBH4pmvXG5dO1xuXG4vLyBob2xkcyBhIGxpc3Qgb2YgYWxsIGludGVydmFscyBpbiBlYWNoIHNjYWxlXG52YXIgU0NBTEVfTElTVCA9IFtcbiAgICBNYWpvciA9IFtcbiAgICAgICAgXCJNYWpvciAybmRcIixcbiAgICAgICAgXCJNYWpvciAzcmRcIixcbiAgICAgICAgXCJQZXJmZWN0IDR0aFwiLFxuICAgICAgICBcIlBlcmZlY3QgNXRoXCIsXG4gICAgICAgIFwiTWFqb3IgNnRoXCIsXG4gICAgICAgIFwiTWFqb3IgN3RoXCIsXG4gICAgICAgIFwiT2N0YXZlXCJcbiAgICBdLFxuXG4gICAgTWlub3JQZW50YXRvbmljID1bXG4gICAgICAgIFwiTWlub3IgM3JkXCIsXG4gICAgICAgIFwiUGVyZmVjdCA0dGhcIixcbiAgICAgICAgXCJQZXJmZWN0IDV0aFwiLFxuICAgICAgICBcIk1pbm9yIDd0aFwiLFxuICAgICAgICBcIk9jdGF2ZVwiXG4gICAgXSxcblxuICAgIE1ham9yUGVudGF0b25pYyA9W1xuICAgICAgICBcIk1ham9yIDJuZFwiLFxuICAgICAgICBcIk1ham9yIDNyZFwiLFxuICAgICAgICBcIlBlcmZlY3QgNXRoXCIsXG4gICAgICAgIFwiTWFqb3IgNnRoXCIsXG4gICAgICAgIFwiT2N0YXZlXCJcbiAgICBdLFxuXG4gICAgTWFqb3JUcmlhZCA9IFtcbiAgICAgICAgXCJNYWpvciAzcmRcIixcbiAgICAgICAgXCJQZXJmZWN0IDV0aFwiLFxuICAgICAgICBcIk9jdGF2ZVwiXG4gICAgXSxcblxuICAgIE1ham9yN3RoID0gW1xuICAgICAgICBcIk1ham9yIDNyZFwiLFxuICAgICAgICBcIlBlcmZlY3QgNXRoXCIsXG4gICAgICAgIFwiTWFqb3IgN3RoXCIsXG4gICAgICAgIFwiT2N0YXZlXCJcbiAgICBdLFxuXG4gICAgRG9taW5hbnQ3dGggPSBbXG4gICAgICAgIFwiTWFqb3IgM3JkXCIsXG4gICAgICAgIFwiUGVyZmVjdCA1dGhcIixcbiAgICAgICAgXCJNaW5vciA3dGhcIixcbiAgICAgICAgXCJPY3RhdmVcIlxuICAgIF0sXG5cbiAgICBNaXhvbHlkaWFuID1bXG4gICAgICAgIFwiTWFqb3IgMm5kXCIsXG4gICAgICAgIFwiTWFqb3IgM3JkXCIsXG4gICAgICAgIFwiUGVyZmVjdCA0dGhcIixcbiAgICAgICAgXCJQZXJmZWN0IDV0aFwiLFxuICAgICAgICBcIk1ham9yIDZ0aFwiLFxuICAgICAgICBcIk1pbm9yIDd0aFwiLFxuICAgICAgICBcIk9jdGF2ZVwiXG4gICAgXVxuXTtcblxuLy8gdGhlIHBvc2l0aW9uIG9mIHRoZSByb290IG5vdGUgZm9yIHRoZSBzY2FsZSBpbiB0aGUgZ2l2ZW4ga2V5XG52YXIgUk9PVF9OT1RFID0gUk9PVF9OT1RFX0NPT1JESU5BVEVTW3NlbGVjdGVkS2V5XTtcblxudmFyIElOVEVSVkFMX0RJRkZFUkVOQ0UgPSB7XG4gICAgXCJNaW5vciAybmRcIjogWzAsMV0sXG4gICAgXCJNYWpvciAybmRcIjogWzAsMl0sXG4gICAgXCJNaW5vciAzcmRcIjogWzAsIDNdLFxuICAgIFwiTWFqb3IgM3JkXCI6IFstMSwtMV0sXG4gICAgXCJQZXJmZWN0IDR0aFwiOiBbLTEsMF0sXG4gICAgXCJUcml0b25lXCI6IFstMSwxXSxcbiAgICBcIlBlcmZlY3QgNXRoXCI6IFstMSwyXSxcbiAgICAvL1wibWlub3IgNnRoXCI6IFwiXCIsIC8vVU5VU0VEXG4gICAgXCJNYWpvciA2dGhcIjogWy0yLC0xXSxcbiAgICBcIk1pbm9yIDd0aFwiOiBbLTIsMF0sXG4gICAgXCJNYWpvciA3dGhcIjogWy0yLDFdLFxuICAgIFwiT2N0YXZlXCI6IFstMiwyXSxcbn07XG5cbnZhciBzY2FsZXNDb25zdGFudHMgPSB7XG4gICAgUk9PVF9OT1RFOiBST09UX05PVEUsXG5cbiAgICAvLyB0aGUgbGlzdCBvZiBpbnRlcnZhbHMgaW4gdGhlIHNlbGVjdGVkIHNjYWxlXG4gICAgU0VMRUNURURfU0NBTEVfTElTVDogU0NBTEVfTElTVFtzZWxlY3RlZFNjYWxlXSxcblxuICAgIC8vIHRoZSBuYW1lIG9mIHRoZSBzZWxlY3RlZCBzY2FsZVxuICAgIFNDQUxFX05BTUU6IHNoYXJlZC5OT1RFU1tST09UX05PVEVbMF1dW1JPT1RfTk9URVsxXV0gKyBcIiBcIiArIFNDQUxFX05BTUVTW3NlbGVjdGVkU2NhbGVdLFxuXG4gICAgLy8gdGhlIGNvb3JkaW5hdGVzIG9mIGVhY2ggaW50ZXJ2YWwgcmVsYXRpdmUgdG8gdGhlIHJvb3Qgbm90ZVxuICAgIElOVEVSVkFMX0RJRkZFUkVOQ0U6IElOVEVSVkFMX0RJRkZFUkVOQ0UsXG5cbiAgICAvLyB0aGUga2V5cyBvZiB0aGUgYWJvdmUgb2JqZWN0IChpLmUuIHRoZSBuYW1lIG9mIGVhY2ggaW50ZXJ2YWwpXG4gICAgSU5URVJWQUxfRElGRkVSRU5DRV9LRVlTOiBPYmplY3Qua2V5cyhJTlRFUlZBTF9ESUZGRVJFTkNFKVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzY2FsZXNDb25zdGFudHM7XG4iLCJ2YXIgY29uc3RzID0gcmVxdWlyZSgnLi9zY2FsZXNDb25zdGFudHMnKTtcbnZhciBzaGFyZWQgPSByZXF1aXJlKCcuL2V4ZXJjaXNlc1NoYXJlZCcpO1xuXG52YXIgcHJldmlvdXNSZWNvcmRTY2FsZXMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInByZXZpb3VzUmVjb3JkU2NhbGVzXCIpO1xuXG52YXIgc2NhbGUgPSBbXG4gICAgY29uc3RzLlJPT1RfTk9URVxuXTtcblxuLy8gQ3JlYXRlcyB0aGUgc2NhbGUgdGFibGUgd2l0aCBwb3NpdGlvbnMgb2YgZWFjaCBub3RlIGluIHRoZSBzZWxlY3RlZCBzY2FsZVxuZm9yICh2YXIgaSA9IDA7IGkgPCBjb25zdHMuSU5URVJWQUxfRElGRkVSRU5DRV9LRVlTLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb25zdHMuU0VMRUNURURfU0NBTEVfTElTVC5sZW5ndGg7IGorKykge1xuICAgICAgICBpZihjb25zdHMuU0VMRUNURURfU0NBTEVfTElTVFtqXSA9PSBjb25zdHMuSU5URVJWQUxfRElGRkVSRU5DRV9LRVlTW2ldKSB7XG4gICAgICAgICAgICBzY2FsZS5wdXNoKFtcbiAgICAgICAgICAgICAgICBjb25zdHMuUk9PVF9OT1RFWzBdICsgY29uc3RzLklOVEVSVkFMX0RJRkZFUkVOQ0VbY29uc3RzLklOVEVSVkFMX0RJRkZFUkVOQ0VfS0VZU1tpXV1bMF0sXG4gICAgICAgICAgICAgICAgY29uc3RzLlJPT1RfTk9URVsxXSArIGNvbnN0cy5JTlRFUlZBTF9ESUZGRVJFTkNFW2NvbnN0cy5JTlRFUlZBTF9ESUZGRVJFTkNFX0tFWVNbaV1dWzFdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBuYW1lIG9mIHRoZSBpbnRlcnZhbCBmcm9tIGEgZ2l2ZW4gbm90ZVxuICogQHBhcmFtICB7aW50fSBjdXJyZW50Tm90ZSBUaGUgY29vcmRpbmF0ZXMgb2YgYSBub3RlXG4gKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgIFRoZSBuYW1lIG9mIHRoZSBpbnRlcnZhbCBmcm9tIHJvb3Qgbm90ZSB0byB0aGUgZ2l2ZW4gbm90ZVxuICovXG5mdW5jdGlvbiBnZXRJbnRlcnZhbE5hbWUoY3VycmVudE5vdGUpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNjYWxlLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgLy8gaWYgdGhlIGdpdmVuIG5vdGUgbWF0Y2hlcyBvbmUgaW4gdGhlIHNjYWxlIGl0IGlzIHRoZSBjb3JyZWN0IGludGVydmFsXG4gICAgICAgIGlmIChjdXJyZW50Tm90ZS50b1N0cmluZygpID09IHNjYWxlW2ldLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgIC8vIC0xIGJlY2F1c2Ugbm8gcm9vdCBub3RlIGluIHNlbGVjdGVkU2NhbGUgdGFibGVcbiAgICAgICAgICAgIHJldHVybihjb25zdHMuU0VMRUNURURfU0NBTEVfTElTVFtpIC0gMV0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIG5hbWUgb2YgYSBub3RlIGZyb20gYSBnaXZlbiBzdHJpbmcgJiBmcmV0XG4gKiBAcGFyYW0gIHtpbnR9IHN0cmluZyBUaGUgc3RyaW5nIHRoZSBub3RlIGlzIG9uXG4gKiBAcGFyYW0gIHtpbnR9IGZyZXQgICBUaGUgZnJldCB0aGUgbm90ZSBpcyBvblxuICogQHJldHVybiB7c3RyaW5nfSAgICAgVGhlIG5hbWUgb2YgdGhlIG5vdGUgYXQgdGhlIGdpdmVuIHN0cmluZy9mcmV0XG4gKi9cbmZ1bmN0aW9uIGdldE5vdGVOYW1lKHN0cmluZywgZnJldCkge1xuICAgIHJldHVybiBzaGFyZWQuTk9URVNbc3RyaW5nXVtmcmV0XTtcbn1cblxudmFyIHN0YWdlID0gbmV3IEtpbmV0aWMuU3RhZ2Uoe1xuICAgIGNvbnRhaW5lcjogJ2NvbnRhaW5lcicsXG4gICAgd2lkdGg6IHdpbmRvdy5pbm5lcldpZHRoLFxuICAgIGhlaWdodDogNDAwXG59KTtcblxuLyoqXG4gKiBEcmF3cyBidXR0b25zIG9uIGVhY2ggZnJldFxuICovXG5mdW5jdGlvbiBkcmF3Q2lyY2xlcygpIHtcbiAgICB2YXIgY2lyY2xlTGF5ZXIgPSBuZXcgS2luZXRpYy5MYXllcigpO1xuICAgIHZhciByb290RnJldCA9IHNjYWxlWzBdWzFdO1xuICAgIHZhciByb290U3RyaW5nID0gc2NhbGVbMF1bMF07XG5cbiAgICBmb3IgKHZhciBzdHJpbmcgPSAwOyBzdHJpbmcgPCA0OyBzdHJpbmcrKykge1xuICAgICAgICBmb3IgKHZhciBmcmV0ID0gMDsgZnJldCA8IHNoYXJlZC5NQVhfRlJFVFM7IGZyZXQrKyApIHtcbiAgICAgICAgICAgIGlmIChmcmV0ID09IHJvb3RGcmV0ICYmIHN0cmluZyA9PSByb290U3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc2hhcmVkLmRyYXdDaXJjbGUoKDUwICsgKChzdHJpbmdMZW5ndGggLyBzaGFyZWQuTUFYX0ZSRVRTKSAvIDIpKSArICgoKHN0cmluZ0xlbmd0aCAtIDUwKSAvIHNoYXJlZC5NQVhfRlJFVFMpICAqIHJvb3RGcmV0KSwgNTAgKyAocm9vdFN0cmluZyAqIHNoYXJlZC5TVFJJTkdfU1BBQ0lORyksIDE1LCBbc3RyaW5nLGZyZXRdLCBcIiNFNTE0MDBcIiwgY2lyY2xlTGF5ZXIsIDEsIGJ1dHRvbkNsaWNrZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hhcmVkLmRyYXdDaXJjbGUoKDUwICsgKChzdHJpbmdMZW5ndGggLyBzaGFyZWQuTUFYX0ZSRVRTKSAvIDIpKSArICgoKHN0cmluZ0xlbmd0aCAtIDUwKSAvIHNoYXJlZC5NQVhfRlJFVFMpICAqIGZyZXQpLCA1MCArIChzdHJpbmcgKiBzaGFyZWQuU1RSSU5HX1NQQUNJTkcpLCAxNSwgW3N0cmluZyxmcmV0XSwgIFwiYmxhY2tcIiwgY2lyY2xlTGF5ZXIsIDAuNzUsIGJ1dHRvbkNsaWNrZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhZ2UuYWRkKGNpcmNsZUxheWVyKTtcbn1cblxudmFyIHRleHRMYXllciA9IG5ldyBLaW5ldGljLkxheWVyKCk7XG52YXIgaW5zdHJ1Y3Rpb25zID0gbmV3IEtpbmV0aWMuVGV4dCh7XG4gICAgdGV4dDogXCJcIixcbiAgICB4OiBzdGFnZS53aWR0aCgpIC8gMixcbiAgICB5OiAxODAsXG4gICAgZm9udEZhbWlseTogXCJBcmlhbFwiLFxuICAgIGZvbnRTaXplOiAzMixcbiAgICBmaWxsOiBcImJsYWNrXCIsXG4gICAgYWxpZ246IFwiY2VudGVyXCJcbn0pO1xuXG5pbnN0cnVjdGlvbnMub2Zmc2V0WChpbnN0cnVjdGlvbnMuZ2V0V2lkdGgoKSAvIDIpO1xuXG52YXIgZmVlZGJhY2sgPSBuZXcgS2luZXRpYy5UZXh0KHtcbiAgICB0ZXh0OiBcIlwiLFxuICAgIHg6IHN0YWdlLndpZHRoKCkgLyAyLFxuICAgIHk6IDE4MCArIGluc3RydWN0aW9ucy5oZWlnaHQoKSxcbiAgICBmb250RmFtaWx5OiBcIkFyaWFsXCIsXG4gICAgZm9udFNpemU6IDMyLFxuICAgIGZpbGw6IFwiYmxhY2tcIixcbiAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICBvcGFjaXR5OiAwXG59KTtcblxuZmVlZGJhY2sub2Zmc2V0WChmZWVkYmFjay5nZXRXaWR0aCgpIC8gMik7XG5cbnRleHRMYXllci5hZGQoZmVlZGJhY2spO1xudGV4dExheWVyLmFkZChpbnN0cnVjdGlvbnMpO1xuc3RhZ2UuYWRkKHRleHRMYXllcik7XG5cbi8qKlxuICogU2V0cyB0aGUgdGV4dCBmb3IgaW5zdHJ1Y3Rpb25zXG4gKiBAcGFyYW0ge3N0cmluZ30gVGhlIG5ldyBpbnN0cnVjdGlvbiB0ZXh0XG4gKi9cbmZ1bmN0aW9uIHNldEluc3RydWN0aW9uVGV4dChuZXdJbnN0cnVjdGlvbikge1xuICAgIGluc3RydWN0aW9ucy50ZXh0KG5ld0luc3RydWN0aW9uKTtcbiAgICBpbnN0cnVjdGlvbnMub2Zmc2V0WChpbnN0cnVjdGlvbnMuZ2V0V2lkdGgoKSAvIDIpO1xuICAgIHRleHRMYXllci5kcmF3KCk7XG5cbiAgICB2YXIgc2NhbGVUd2VlbiA9IG5ldyBLaW5ldGljLlR3ZWVuKHtcbiAgICAgICAgbm9kZTogaW5zdHJ1Y3Rpb25zLFxuICAgICAgICBkdXJhdGlvbjogMC4yNSxcbiAgICAgICAgc2NhbGVYOiAxLjE1LFxuICAgICAgICBzY2FsZVk6IDEuMTUsXG4gICAgICAgIGVhc2luZzogS2luZXRpYy5FYXNpbmdzLkVhc2VJbk91dCxcbiAgICAgICAgb25GaW5pc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2NhbGVUd2Vlbi5yZXZlcnNlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHNjYWxlVHdlZW4ucGxheSgpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIHRleHQgZm9yIGZlZWRiYWNrIChjb3JyZWN0L2luY29ycmVjdClcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXdGZWVkYmFjayBUaGUgbmV3IGZlZWRiYWNrIHRleHRcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvdXIgICAgICBUaGUgY29sb3VyIG9mIHRoZSB0ZXh0XG4gKi9cbmZ1bmN0aW9uIHNldEZlZWRiYWNrVGV4dChuZXdGZWVkYmFjaywgY29sb3VyKSB7XG4gICAgZmVlZGJhY2sudGV4dChuZXdGZWVkYmFjayk7XG4gICAgZmVlZGJhY2sub2Zmc2V0WChmZWVkYmFjay5nZXRXaWR0aCgpIC8gMik7XG4gICAgZmVlZGJhY2suc2V0RmlsbChjb2xvdXIpO1xuICAgIHRleHRMYXllci5kcmF3KCk7XG5cbiAgICB2YXIgc2NhbGVUd2VlbiA9IG5ldyBLaW5ldGljLlR3ZWVuKHtcbiAgICAgICAgbm9kZTogZmVlZGJhY2ssXG4gICAgICAgIGR1cmF0aW9uOiAwLjI1LFxuICAgICAgICBzY2FsZVg6IDEuNSxcbiAgICAgICAgc2NhbGVZOiAxLjUsXG4gICAgICAgIGVhc2luZzogS2luZXRpYy5FYXNpbmdzLkVhc2VJbk91dCxcbiAgICAgICAgb25GaW5pc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2NhbGVUd2Vlbi5yZXZlcnNlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHNjYWxlVHdlZW4ucGxheSgpO1xuXG4gICAgdmFyIG9wYWNpdHlUd2VlbiA9IG5ldyBLaW5ldGljLlR3ZWVuKHtcbiAgICAgICAgbm9kZTogZmVlZGJhY2ssXG4gICAgICAgIGR1cmF0aW9uOiAxLFxuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICBlYXNpbmc6IEtpbmV0aWMuRWFzaW5ncy5FbGFzdGljRWFzZU91dCxcbiAgICB9KTtcblxuICAgIG9wYWNpdHlUd2Vlbi5wbGF5KCk7XG59XG5cbnNoYXJlZC5kcmF3U3RyaW5ncyhzdGFnZSk7XG5cbi8qKlxuICogRnVuY3Rpb24gY2FsbGVkIG9uIGEgYnV0dG9uIGNsaWNrXG4gKiBAcGFyYW0gIHtzdHJpbmd9IG5vdGUgVGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBjbGlja2VkIG5vdGVcbiAqL1xuZnVuY3Rpb24gYnV0dG9uQ2xpY2tlZChub3RlKSB7XG4gICAgbm90ZSA9IG5vdGUuam9pbihzZXBhcmF0b3IgPSBcIlwiKTtcbiAgICBpZihleGVyY2lzZUlzUnVubmluZykge1xuICAgICAgICBpZihub3RlID09IGN1cnJlbnROb3RlLmpvaW4oc2VwYXJhdG9yPVwiXCIpKSB7XG4gICAgICAgICAgICBzZXRGZWVkYmFja1RleHQoXCJDb3JyZWN0IVwiLCBcImdyZWVuXCIpO1xuICAgICAgICAgICAgc2hhcmVkLnNjb3JlICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZXRGZWVkYmFja1RleHQoXCJJbmNvcnJlY3QhXCIsIFwicmVkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hhcmVkLnRvdGFsUXVlc3Rpb25zICs9IDE7XG4gICAgICAgIHNoYXJlZC5UT1RBTF9ESVNQTEFZLmlubmVySFRNTCA9IHNoYXJlZC50b3RhbFF1ZXN0aW9ucztcbiAgICAgICAgc2hhcmVkLlNDT1JFX0RJU1BMQVkuaW5uZXJIVE1MID0gTWF0aC5yb3VuZCgoc2hhcmVkLnNjb3JlIC8gc2hhcmVkLnRvdGFsUXVlc3Rpb25zKSAqIDEwMCk7XG4gICAgICAgIHNoYXJlZC5DT1JSRUNUX0RJU1BMQVkuaW5uZXJIVE1MID0gc2hhcmVkLnNjb3JlO1xuXG4gICAgICAgIGdhbWVTdGF0ZSgpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBjdXJyZW50IG5vdGUgdG8gYSByYW5kb20gbm90ZSBvbiB0aGUgc2NhbGUgdGhhdCBpc24ndCB0aGUgcm9vdFxuICovXG5mdW5jdGlvbiBnYW1lU3RhdGUoKSB7XG4gICAgZG8ge1xuICAgICAgICBjdXJyZW50Tm90ZSA9IHNjYWxlW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHNjYWxlLmxlbmd0aCldO1xuICAgIH0gd2hpbGUgKGN1cnJlbnROb3RlID09IHNjYWxlWzBdKTtcblxuICAgIHNldEluc3RydWN0aW9uVGV4dChnZXRJbnRlcnZhbE5hbWUoY3VycmVudE5vdGUpICsgXCIgKFwiICsgZ2V0Tm90ZU5hbWUoY3VycmVudE5vdGVbMF0sIGN1cnJlbnROb3RlWzFdKSArIFwiKVwiKTtcbn1cblxuLyoqXG4gKiBDYWxsZWQgb25jZSBhIHNlY29uZCB0byB1cGRhdGUgdGhlIHRpbWVyIHRleHRcbiAqL1xuZnVuY3Rpb24gdXBkYXRlVGltZXIoKSB7XG4gICAgdmFyIGV4dHJhWmVybyA9IDA7XG5cbiAgICBzaGFyZWQudGltZXJTZWNvbmRzIC09IDE7XG5cbiAgICBpZiAoc2hhcmVkLnRpbWVyU2Vjb25kcyA8IDApIHtcbiAgICAgICAgc2hhcmVkLnRpbWVyTWludXRlcyAtPSAxO1xuICAgICAgICBzaGFyZWQudGltZXJTZWNvbmRzID0gNTk7XG4gICAgfVxuXG4gICAgaWYgKHNoYXJlZC50aW1lclNlY29uZHMgPCAxMCkge1xuICAgICAgICBleHRyYVplcm8gPSAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZXh0cmFaZXJvID0gXCJcIjtcbiAgICB9XG5cbiAgICBzaGFyZWQuVElNRVJfRElTUExBWS5pbm5lckhUTUwgPSBzaGFyZWQudGltZXJNaW51dGVzICsgXCI6XCIgKyBleHRyYVplcm8gKyBzaGFyZWQudGltZXJTZWNvbmRzO1xuXG4gICAgLy8gY2hlY2sgaWYgb3V0IG9mIHRpbWVcbiAgICBpZiAoc2hhcmVkLnRpbWVyU2Vjb25kcyA9PT0gMCAmJiBzaGFyZWQudGltZXJNaW51dGVzID09PSAwKSB7XG4gICAgICAgIGVuZEV4ZXJjaXNlKCk7XG4gICAgfVxufVxuXG4vKipcbiAqIENhbGxlZCBhdCB0aGUgZW5kIG9mIHRoZSBleGVyY2lzZSB0byBkaXNwbGF5IHNjb3JlICYgaGlnaHNjb3Jlc1xuICovXG5mdW5jdGlvbiBlbmRFeGVyY2lzZSgpIHtcbiAgICBleGVyY2lzZUlzUnVubmluZyA9IGZhbHNlO1xuICAgIGNsZWFySW50ZXJ2YWwoc2hhcmVkLnRpbWVyUik7XG4gICAgc2hhcmVkLlRJTUVSX0RJU1BMQVkuaW5uZXJIVE1MID0gXCIwOjAwXCI7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9vdEhlYWRlclwiKS5pbm5lckhUTUwgPSBcIlRpbWUncyB1cCFcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbmFsQ29ycmVjdFwiKS5pbm5lckhUTUwgPSBzaGFyZWQuc2NvcmU7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaW5hbFRvdGFsXCIpLmlubmVySFRNTCA9IHNoYXJlZC50b3RhbFF1ZXN0aW9ucztcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm91dE9mVGltZVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuY29uc29sZS5sb2cocHJldmlvdXNSZWNvcmRTY2FsZXMpXG4gICAgaWYgKCFwcmV2aW91c1JlY29yZFNjYWxlcykge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vUmVjb3JkXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm9QcmV2aW91c1JlY29yZFZhbHVlXCIpLmlubmVySFRNTCA9IHNoYXJlZC5zY29yZTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJwcmV2aW91c1JlY29yZFNjYWxlc1wiLCBzaGFyZWQuc2NvcmUpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwcmV2aW91c1JlY29yZFNjYWxlcyA8IHNoYXJlZC5zY29yZSkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJlYXRSZWNvcmRcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJiZWF0UHJldmlvdXNSZWNvcmRWYWx1ZVwiKS5pbm5lckhUTUwgPSBwcmV2aW91c1JlY29yZFNjYWxlcztcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJwcmV2aW91c1JlY29yZFNjYWxlc1wiLCBzaGFyZWQuc2NvcmUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb3N0UmVjb3JkXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9zdFByZXZpb3VzUmVjb3JkVmFsdWVcIikuaW5uZXJIVE1MID0gcHJldmlvdXNSZWNvcmRTY2FsZXM7XG4gICAgfVxuXG59XG5cbnZhciBidXR0b25MYXllciA9IG5ldyBLaW5ldGljLkxheWVyKCk7XG5cbi8qKlxuICogRHJhd3MgdGhlIGJ1dHRvbnMgZm9yIHZpZXdpbmcgYSBzY2FsZSBhbmQgc3RhcnRpbmcgdGhlIGV4ZXJjaXNlXG4gKi9cbmZ1bmN0aW9uIGRyYXdCdXR0b25zKCkge1xuICAgIHZhciBzdGFydEJ1dHRvbiA9IG5ldyBLaW5ldGljLlJlY3Qoe1xuICAgICAgICB4OiBzdGFnZS53aWR0aCgpIC8gMyAtIDE1MCxcbiAgICAgICAgeTogMTU1IC8gMixcbiAgICAgICAgd2lkdGg6IDI1MCxcbiAgICAgICAgaGVpZ2h0OiA1MCxcbiAgICAgICAgZmlsbDogXCJsaWdodGdyZXlcIixcbiAgICAgICAgc3Ryb2tlOiBcImJsYWNrXCIsXG4gICAgICAgIHN0cm9rZVdpZHRoOiA0LFxuICAgICAgICBjb3JuZXJSYWRpdXM6IDUsXG4gICAgfSk7XG4gICAgdmFyIHN0YXJ0QnV0dG9uVGV4dCA9IG5ldyBLaW5ldGljLlRleHQoe1xuICAgICAgICB0ZXh0OiBcIlN0YXJ0XCIsXG4gICAgICAgIHg6IHN0YWdlLndpZHRoKCkgLyAzIC0gMTI1LFxuICAgICAgICB5OiAxNTUgLyAyICsgNywgLy8gbWFnaWMgbnVtYmVyICEhXG4gICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgIGhlaWdodDogNTAsXG4gICAgICAgIGZvbnRGYW1pbHk6IFwiQXJpYWxcIixcbiAgICAgICAgZm9udFNpemU6IDMyLFxuICAgICAgICBmaWxsOiBcImJsYWNrXCIsXG4gICAgICAgIGFsaWduOiBcImNlbnRlclwiXG4gICAgfSk7XG5cbiAgICB2YXIgdmlld1NjYWxlQnV0dG9uID0gbmV3IEtpbmV0aWMuUmVjdCh7XG4gICAgICAgIHg6IHN0YWdlLndpZHRoKCkgLyAzICsgMTUwLFxuICAgICAgICB5OiAxNTUgLyAyLFxuICAgICAgICB3aWR0aDogMjUwLFxuICAgICAgICBoZWlnaHQ6IDUwLFxuICAgICAgICBmaWxsOiBcImxpZ2h0Z3JleVwiLFxuICAgICAgICBzdHJva2U6IFwiYmxhY2tcIixcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDQsXG4gICAgICAgIGNvcm5lclJhZGl1czogNSxcbiAgICB9KTtcbiAgICB2YXIgdmlld1NjYWxlQnV0dG9uVGV4dCA9IG5ldyBLaW5ldGljLlRleHQoe1xuICAgICAgICB0ZXh0OiBcIlZpZXcgU2NhbGVcIixcbiAgICAgICAgeDogc3RhZ2Uud2lkdGgoKSAvIDMgKyAxNzUsXG4gICAgICAgIHk6IDE1NSAvIDIgKyA3LCAvLyBtYWdpYyBudW1iZXIgISFcbiAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgaGVpZ2h0OiA1MCxcbiAgICAgICAgZm9udEZhbWlseTogXCJBcmlhbFwiLFxuICAgICAgICBmb250U2l6ZTogMzIsXG4gICAgICAgIGZpbGw6IFwiYmxhY2tcIixcbiAgICAgICAgYWxpZ246IFwiY2VudGVyXCJcbiAgICB9KTtcblxuICAgIGJ1dHRvbkxheWVyLmFkZChzdGFydEJ1dHRvbik7XG4gICAgYnV0dG9uTGF5ZXIuYWRkKHN0YXJ0QnV0dG9uVGV4dCk7XG4gICAgYnV0dG9uTGF5ZXIuYWRkKHZpZXdTY2FsZUJ1dHRvbik7XG4gICAgYnV0dG9uTGF5ZXIuYWRkKHZpZXdTY2FsZUJ1dHRvblRleHQpO1xuICAgIHN0YWdlLmFkZChidXR0b25MYXllcik7XG5cbiAgICBzdGFydEJ1dHRvbi5vbihcIm1vdXNlZG93biB0b3VjaHN0YXJ0XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzdGFydCgpO1xuICAgIH0pO1xuXG4gICAgc3RhcnRCdXR0b25UZXh0Lm9uKFwibW91c2Vkb3duIHRvdWNoc3RhcnRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0YXJ0KCk7XG4gICAgfSk7XG5cbiAgICB2aWV3U2NhbGVCdXR0b24ub24oXCJtb3VzZWRvd24gdG91Y2hzdGFydFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmlld1NjYWxlKCk7XG4gICAgfSk7XG5cbiAgICB2aWV3U2NhbGVCdXR0b25UZXh0Lm9uKFwibW91c2Vkb3duIHRvdWNoc3RhcnRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZpZXdTY2FsZSgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFN0YXJ0cyB0aGUgZXhlcmNpc2UgLSBoaWRlcyBidXR0b25zLCBzdGFydHMgdGltZXIgYW5kIGRyYXdzIGNpcmNsZSBidXR0b25zXG4gKi9cbmZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgIGJ1dHRvbkxheWVyLmRlc3Ryb3koKTtcbiAgICBleGVyY2lzZUlzUnVubmluZyA9IHRydWU7XG4gICAgc2hhcmVkLnRpbWVyUiA9IHNldEludGVydmFsKHVwZGF0ZVRpbWVyLCBzaGFyZWQuVElNRVJfVElDS19NUyk7IC8vIGluIG1zIC0gMTAwMCBtc2VjID0gMSBzZWNcbiAgICBkcmF3Q2lyY2xlcygpO1xuICAgIGdhbWVTdGF0ZSgpO1xuICAgIHVwZGF0ZVRpbWVyKCk7XG59XG5cbnZhciBjaXJjbGVMYXllciA9IG5ldyBLaW5ldGljLkxheWVyKCk7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmlldyB0aGUgc2VsZWN0ZWQgc2NhbGVcbiAqL1xuZnVuY3Rpb24gdmlld1NjYWxlKCkge1xuICAgIGJ1dHRvbkxheWVyLmRlc3Ryb3koKTtcbiAgICBkcmF3QmFja0J1dHRvbigpO1xuICAgIHNldEluc3RydWN0aW9uVGV4dChjb25zdHMuU0NBTEVfTkFNRSk7XG5cbiAgICBmb3IgKHZhciBzdHJpbmcgPSAwOyBzdHJpbmcgPCA0OyBzdHJpbmcrKykge1xuICAgICAgICBmb3IgKHZhciBmcmV0ID0gMDsgZnJldCA8IHNoYXJlZC5NQVhfRlJFVFM7IGZyZXQrKyApIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2NhbGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoc2NhbGVbMF1bMF0gPT0gc3RyaW5nICYmIHNjYWxlWzBdWzFdID09IGZyZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hhcmVkLmRyYXdDaXJjbGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAoNTAgKyAoKHN0cmluZ0xlbmd0aCAvIHNoYXJlZC5NQVhfRlJFVFMpIC8gMikpICsgKCgoc3RyaW5nTGVuZ3RoIC0gNTApIC8gc2hhcmVkLk1BWF9GUkVUUykgICogZnJldCksXG4gICAgICAgICAgICAgICAgICAgICAgICA1MCArIChzdHJpbmcgKiBzaGFyZWQuU1RSSU5HX1NQQUNJTkcpLCAxNSwgXCJcIiwgXCIjRTUxNDAwXCIsIGNpcmNsZUxheWVyLCAxLCBidXR0b25DbGlja2VkXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2hhcmVkLmRyYXdUZXh0KFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0Tm90ZU5hbWUoc2NhbGVbMF1bMF0sIHNjYWxlWzBdWzFdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICg1MCArICgoc3RyaW5nTGVuZ3RoIC8gc2hhcmVkLk1BWF9GUkVUUykgLyAyKSkgKyAoKChzdHJpbmdMZW5ndGggLSA1MCkgLyBzaGFyZWQuTUFYX0ZSRVRTKSAgKiBmcmV0KSAtIDYsXG4gICAgICAgICAgICAgICAgICAgICAgICA1MCArIChzdHJpbmcgKiBzaGFyZWQuU1RSSU5HX1NQQUNJTkcpIC0gNywgY2lyY2xlTGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjYWxlW2ldWzBdID09IHN0cmluZyAmJiBzY2FsZVtpXVsxXSA9PSBmcmV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHNoYXJlZC5kcmF3Q2lyY2xlKCg1MCArICgoc3RyaW5nTGVuZ3RoIC8gc2hhcmVkLk1BWF9GUkVUUykgLyAyKSkgKyAoKChzdHJpbmdMZW5ndGggLSA1MCkgLyBzaGFyZWQuTUFYX0ZSRVRTKSAgKiBmcmV0KSwgNTAgKyAoc3RyaW5nICogc2hhcmVkLlNUUklOR19TUEFDSU5HKSwgMTUsIFwiXCIsIFwiYmxhY2tcIiwgY2lyY2xlTGF5ZXIsIDEsIGJ1dHRvbkNsaWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICBzaGFyZWQuZHJhd1RleHQoZ2V0Tm90ZU5hbWUoc2NhbGVbaV1bMF0sIHNjYWxlW2ldWzFdKSwgKDUwICsgKChzdHJpbmdMZW5ndGggLyBzaGFyZWQuTUFYX0ZSRVRTKSAvIDIpKSArICgoKHN0cmluZ0xlbmd0aCAtIDUwKSAvIHNoYXJlZC5NQVhfRlJFVFMpICAqIGZyZXQpIC0gNiwgNTAgKyAoc3RyaW5nICogc2hhcmVkLlNUUklOR19TUEFDSU5HKSAtIDcsIGNpcmNsZUxheWVyLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBcIndoaXRlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YWdlLmFkZChjaXJjbGVMYXllcik7XG59XG5cbi8qKlxuICogUmVzZXRzIHRoZSBleGVyY2lzZSB0byBpbml0aWFsIHN0YXRlXG4gKi9cbmZ1bmN0aW9uIHJlc2V0RXhlcmNpc2UoKSB7XG4gICAgYmFja0J1dHRvbkxheWVyLmRlc3Ryb3koKTtcbiAgICBkcmF3QnV0dG9ucygpO1xuICAgIGNpcmNsZUxheWVyLmRlc3Ryb3koKTtcbiAgICBzZXRJbnN0cnVjdGlvblRleHQoXCJcIik7XG59XG5cbnZhciBiYWNrQnV0dG9uTGF5ZXIgPSBuZXcgS2luZXRpYy5MYXllcigpO1xuXG4vKipcbiAqIERyYXdzIHRoZSBiYWNrIGJ1dHRvbiB3aGVuIHZpZXdpbmcgYW4gZXhlcmNpc2VcbiAqL1xuZnVuY3Rpb24gZHJhd0JhY2tCdXR0b24oKSB7XG4gICAgdmFyIGJhY2tCdXR0b24gPSBuZXcgS2luZXRpYy5SZWN0KHtcbiAgICAgICAgeDogc3RhZ2Uud2lkdGgoKSAvIDIgLSAxMjUsXG4gICAgICAgIHk6IDE1NSAvIDIgKyAxNTAsXG4gICAgICAgIHdpZHRoOiAyNTAsXG4gICAgICAgIGhlaWdodDogNTAsXG4gICAgICAgIGZpbGw6IFwibGlnaHRncmV5XCIsXG4gICAgICAgIHN0cm9rZTogXCJibGFja1wiLFxuICAgICAgICBzdHJva2VXaWR0aDogNCxcbiAgICAgICAgY29ybmVyUmFkaXVzOiA1LFxuICAgIH0pO1xuICAgIHZhciBiYWNrQnV0dG9uVGV4dCA9IG5ldyBLaW5ldGljLlRleHQoe1xuICAgICAgICB0ZXh0OiBcIkJhY2tcIixcbiAgICAgICAgeDogc3RhZ2Uud2lkdGgoKSAvIDIgLSAxMDAsXG4gICAgICAgIHk6IDE1NSAvIDIgKyAxNTcsIC8vIDcgPSBtYWdpYyBudW1iZXIgISFcbiAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgaGVpZ2h0OiA1MCxcbiAgICAgICAgZm9udEZhbWlseTogXCJBcmlhbFwiLFxuICAgICAgICBmb250U2l6ZTogMzIsXG4gICAgICAgIGZpbGw6IFwiYmxhY2tcIixcbiAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgfSk7XG5cbiAgICBiYWNrQnV0dG9uTGF5ZXIuYWRkKGJhY2tCdXR0b24pO1xuICAgIGJhY2tCdXR0b25MYXllci5hZGQoYmFja0J1dHRvblRleHQpO1xuICAgIHN0YWdlLmFkZChiYWNrQnV0dG9uTGF5ZXIpO1xuXG4gICAgYmFja0J1dHRvbkxheWVyLmRyYXcoKTtcblxuICAgIGJhY2tCdXR0b24ub24oXCJtb3VzZWRvd24gdG91Y2hzdGFydFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzZXRFeGVyY2lzZSgpO1xuICAgIH0pO1xuXG4gICAgYmFja0J1dHRvblRleHQub24oXCJtb3VzZWRvd24gdG91Y2hzdGFydFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzZXRFeGVyY2lzZSgpO1xuICAgIH0pO1xufVxuXG5kcmF3QnV0dG9ucygpO1xuIl19
