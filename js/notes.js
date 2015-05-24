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
    colour = colour || '#000000';
    cap = cap || 'butt';

    var line = new Kinetic.Line({
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
    align = align || 'left';
    font = font || 'Arial';
    size = size || 16;
    colour = colour || 'black';

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
    TIMER_DISPLAY: document.getElementById('timer'),
    SCORE_DISPLAY: document.getElementById('score'),
    CORRECT_DISPLAY: document.getElementById('correct'),
    TOTAL_DISPLAY: document.getElementById('total'),

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
    timerMinutes: localStorage.getItem('timeLimit'),
    exerciseIsRunning: false,
    score: 0,
    totalQuestions: 0,
    currentNote: 0,
    timerR: null,

    makeFunction: makeFunction,

    // array to hold the names of notes
    NOTES: [
        ['G♯', 'A', 'A♯', 'B', 'C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G'], // G string
        ['D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B', 'C', 'C♯', 'D'], // D string
        ['A♯', 'B', 'C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A'], // A string
        ['F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B', 'C', 'C♯', 'D', 'D♯', 'E']  // E string
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
        circle.on('mousedown touchstart', makeFunction(id, callback));
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
            drawLine(50, 50 + (STRING_SPACING * i), stringLength, 50 + (STRING_SPACING * i), 9, '#444', 'round', backgroundLayer);
        }

        // draw string labels
        drawText('G', 20, 42, backgroundLayer);
        drawText('D', 20, 42 + STRING_SPACING, backgroundLayer);
        drawText('A', 20, 42 + (STRING_SPACING * 2), backgroundLayer);
        drawText('E', 20, 42 + (STRING_SPACING * 3), backgroundLayer);

        // draw frets
        for (i = 0; i < MAX_FRETS; i++) {
            // offset by 50 from start of the string
            var fretLineX = (50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * i);
            drawLine(fretLineX, 35, fretLineX, 50 + (STRING_SPACING * 3) + 15, 5, '#aaa', 'round', backgroundLayer);

            drawText(i + 1, fretLineX - 4, 10, backgroundLayer, 'center');
        }

        stage.add(backgroundLayer);
    },

    drawLine: drawLine,

    drawText: drawText,
};

module.exports = shared;

},{}],2:[function(require,module,exports){
var shared = require('./exercisesShared');

var FEEDBACK_DIV = document.getElementById('feedback');
var FEEDBACK_DISPLAY = document.getElementById('feedbackDisplay');

var previousRecordNotes = localStorage.getItem('previousRecordNotes');
var currentNote;
var exerciseIsRunning = true;

var stage = new Kinetic.Stage({
    container: 'container',
    width: window.innerWidth,
    height: 150
});

var stringLength = stage.getWidth() - 50;

// layer to hold notes
var circleLayer = new Kinetic.Layer();

// empty function as button clicks wont do anything in this exercise
// TODO: fix this
function buttonClicked() {}

/**
 * Draws a circle at a random position on the fretboard. Updates currentNote
 * variable with the new note.
 */
function drawRandomNote() {
    // Intersections are at x = (50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)
    // y values are 50, 100, 150, 200 for G, D, A, E strings
    var fret = Math.floor(Math.random() * shared.MAX_FRETS);
    var string = Math.floor(Math.random() * 4);

    // centerX, centerY, radius, id, fillColour, layer, opacity
    shared.drawCircle(
        (50 + ((stringLength / shared.MAX_FRETS) / 2)) + (((stringLength - 50) / shared.MAX_FRETS)  * fret),
        50 + (string * 25),
        15,
        string.toString() + fret.toString(),
        '#E51400',
        circleLayer,
        1,
        buttonClicked
    );

    currentNote = shared.NOTES[string][fret];

    stage.add(circleLayer);
}

/**
 * Function called when a button is clicked on the notes page. Handles answers,
 * updates score and draws a new random note.
 * @param  {object} link The link that was clicked
 */
function answerButton(link) {
    if (exerciseIsRunning) {
        var answer = link.innerHTML;

        if (currentNote == answer) {
            shared.score += 1;
            FEEDBACK_DISPLAY.innerHTML = 'Correct!';
        } else {
            FEEDBACK_DISPLAY.innerHTML = 'Incorrect!';
        }

        displayFeedback();
        shared.totalQuestions += 1;
        shared.TOTAL_DISPLAY.innerHTML = shared.totalQuestions;
        shared.SCORE_DISPLAY.innerHTML = Math.round((shared.score / shared.totalQuestions) * 100);
        shared.CORRECT_DISPLAY.innerHTML = shared.score;

        // remove old drawn notes
        circleLayer.removeChildren();

        drawRandomNote();
    }
}

/**
 * Displays feedback (correct/incorrect) after an answer has been submitted
 */
function displayFeedback() {
    var classToAdd;
    var timeout = 1250;

    if (FEEDBACK_DISPLAY.innerHTML == 'Correct!') {
        classToAdd = 'correctAnswer';
    } else {
        classToAdd = 'incorrectAnswer';
    }

    setTimeout(function() {
        FEEDBACK_DIV.classList.remove(classToAdd);
        FEEDBACK_DIV.style.opacity = 0;
    }, timeout);

    FEEDBACK_DIV.style.opacity = 1;
    FEEDBACK_DIV.classList.add(classToAdd);
}

/**
 * Called every second to update the timer
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
    } else {
        extraZero = '';
    }

    shared.TIMER_DISPLAY.innerHTML = shared.timerMinutes + ':' + extraZero + shared.timerSeconds;

    // check if out of time
    if (shared.timerSeconds === 0 && shared.timerMinutes === 0) {
        endExercise();
    }
}

/**
 * Ends the exercise, showing total score and record
 */
function endExercise() {
    exerciseIsRunning = false;
    clearInterval(shared.timerR);
    shared.TIMER_DISPLAY.innerHTML = '0:00';

    document.getElementById('ootHeader').innerHTML = 'Time\'s up!';
    document.getElementById('finalCorrect').innerHTML = shared.score;
    document.getElementById('finalTotal').innerHTML = shared.totalQuestions;
    document.getElementById('outOfTime').style.display = 'block';

    if (!previousRecordNotes) {
        document.getElementById('noRecord').style.display = 'block';
        document.getElementById('noPreviousRecordValue').innerHTML = shared.score;
        localStorage.setItem('previousRecordNotes', shared.score);
    } else if (previousRecordNotes < shared.score) {
        document.getElementById('beatRecord').style.display = 'block';
        document.getElementById('beatPreviousRecordValue').innerHTML = previousRecordNotes;
        localStorage.setItem('previousRecordNotes', shared.score);
    } else {
        document.getElementById('lostRecord').style.display = 'block';
        document.getElementById('lostPreviousRecordValue').innerHTML = previousRecordNotes;
    }
}

// update the timer before interval starts so it displays correctly on page load
updateTimer();

// create a variable to allow clearInterval to work
shared.timerR = setInterval(updateTimer, shared.TIMER_TICK_MS);

// overwrite string spacing as this canvas is smaller than others
var stringSpacing = 25;
shared.drawStrings(stage, stringSpacing);

drawRandomNote();

var notesAnswerButtons = document.getElementsByClassName('notesAnswerButton');
for (var i = notesAnswerButtons.length - 1; i >= 0; i--) {
    notesAnswerButtons[i].onclick = function () {
        answerButton(this);
    };
}

},{"./exercisesShared":1}]},{},[2]);
