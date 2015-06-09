/*global require, localStorage, window, setInterval, clearInterval, setTimeout */
function runNotes () {
    'use strict';

    var shared = require('./exercisesShared');
    var $ = require('jquery');
    var Konva = require('konva');

    // start at 1 second so first update shows correct total time
    var timerSeconds = 1;
    var timerMinutes = localStorage.getItem('timeLimit');
    var score = 0;
    var totalQuestions = 0;
    var $feedbackDiv = $('#feedback');
    var $feedbackDisplay = $('#feedbackDisplay');
    var previousRecordNotes = localStorage.getItem('previousRecordNotes');
    var exerciseIsRunning = true;
    var currentNote;

    // overwrite string spacing as this canvas is smaller than others
    var stringSpacing = 25;
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
     * Displays feedback (correct/incorrect) after an answer has been submitted
     */
    function displayFeedback() {
        var classToAdd;
        var timeout = 1250;

        if ($feedbackDisplay.text() === 'Correct!') {
            classToAdd = 'correctAnswer';
        } else {
            classToAdd = 'incorrectAnswer';
        }

        setTimeout(function() {
            $feedbackDiv.removeClass(classToAdd);
            $feedbackDiv.css('opacity', 0);
        }, timeout);

        $feedbackDiv.css('opacity', 1);
        $feedbackDiv.addClass(classToAdd);
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
                score += 1;
                $feedbackDisplay.text('Correct!');
            } else {
                $feedbackDisplay.text('Incorrect!');
            }

            displayFeedback();
            totalQuestions += 1;
            shared.TOTAL_DISPLAY.text(totalQuestions);
            shared.SCORE_DISPLAY.text(Math.round((score / totalQuestions) * 100));
            shared.CORRECT_DISPLAY.text(score);

            // remove old drawn notes
            circleLayer.removeChildren();

            drawRandomNote();
        }
    }

    /**
     * Ends the exercise, showing total score and record
     */
    function endExercise() {
        exerciseIsRunning = false;
        clearInterval(timer);
        shared.TIMER_DISPLAY.text('0:00');

        $('#ootHeader').text('Time\'s up!');
        $('#finalCorrect').text(score);
        $('#finalTotal').text(totalQuestions);
        $('#outOfTime').css('display', 'block');

        if (!previousRecordNotes) {
            $('#noRecord').css('display', 'block');
            $('#noPreviousRecordValue').text(score);
            localStorage.setItem('previousRecordNotes', score);
        } else if (previousRecordNotes < score) {
            $('#beatRecord').css('display', 'block');
            $('#beatPreviousRecordValue').text(previousRecordNotes);
            localStorage.setItem('previousRecordNotes', score);
        } else {
            $('#lostRecord').css('display', 'block');
            $('#lostPreviousRecordValue').text(previousRecordNotes);
        }
    }

    /**
     * Called every second to update the timer
     */
    function updateTimer() {
        var extraZero = 0;

        timerSeconds -= 1;

        if (timerSeconds < 0) {
            timerMinutes -= 1;
            timerSeconds = 59;
        }

        if (timerSeconds < 10) {
            extraZero = 0;
        } else {
            extraZero = '';
        }

        shared.TIMER_DISPLAY.text(timerMinutes + ':' + extraZero + timerSeconds);

        // check if out of time
        if (timerSeconds === 0 && timerMinutes === 0) {
            endExercise();
        }
    }

    // update the timer before interval starts so it displays correctly on page load
    updateTimer();

    // create a variable to allow clearInterval to work
    var timer = setInterval(updateTimer, shared.TIMER_TICK_MS);

    shared.drawStrings(stage, stringSpacing, shared.MAX_FRETS);

    drawRandomNote();

    $('.notesAnswerButton').click(function () {
        answerButton($(this));
    });
}

if (/notesexercise/.test(window.location.href)) {
    runNotes();
}
