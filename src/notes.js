/*global require, module, localStorage, window, setInterval, clearInterval, setTimeout */
'use strict'; // jshint ignore:line

var shared = require('./exercisesShared');
var $ = require('jquery');
var Konva = require('konva');

var FEEDBACK_DIV = $('#feedback');
var FEEDBACK_DISPLAY = $('#feedbackDisplay');

var previousRecordNotes = localStorage.getItem('previousRecordNotes');
var currentNote;
var exerciseIsRunning = true;

var stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: 150
});

var stringLength = stage.getWidth() - 50;

// layer to hold notes
var circleLayer = new Konva.Layer();

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
        var answer = link.text();

        if (currentNote === answer) {
            shared.score += 1;
            FEEDBACK_DISPLAY.text('Correct!');
        } else {
            FEEDBACK_DISPLAY.text('Incorrect!');
        }

        displayFeedback();
        shared.totalQuestions += 1;
        shared.TOTAL_DISPLAY.text(shared.totalQuestions);
        shared.SCORE_DISPLAY.text(Math.round((shared.score / shared.totalQuestions) * 100));
        shared.CORRECT_DISPLAY.text(shared.score);

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

    if (FEEDBACK_DISPLAY.text() === 'Correct!') {
        classToAdd = 'correctAnswer';
    } else {
        classToAdd = 'incorrectAnswer';
    }

    setTimeout(function() {
        FEEDBACK_DIV.removeClass(classToAdd);
        FEEDBACK_DIV.css('opacity', 0);
    }, timeout);

    FEEDBACK_DIV.css('opacity', 1);
    FEEDBACK_DIV.addClass(classToAdd);
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

    shared.TIMER_DISPLAY.text(shared.timerMinutes + ':' + extraZero + shared.timerSeconds);

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
    shared.TIMER_DISPLAY.text('0:00');

    $('#ootHeader').text('Time\'s up!');
    $('#finalCorrect').text(shared.score);
    $('#finalTotal').text(shared.totalQuestions);
    $('#outOfTime').css('display', 'block');

    if (!previousRecordNotes) {
        $('#noRecord').css('display', 'block');
        $('#noPreviousRecordValue').text(shared.score);
        localStorage.setItem('previousRecordNotes', shared.score);
    } else if (previousRecordNotes < shared.score) {
        $('#beatRecord').css('display', 'block');
        $('#beatPreviousRecordValue').text(previousRecordNotes);
        localStorage.setItem('previousRecordNotes', shared.score);
    } else {
        $('#lostRecord').css('display', 'block');
        $('#lostPreviousRecordValue').text(previousRecordNotes);
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

$('.notesAnswerButton').click(function () {
    answerButton($(this));
});
