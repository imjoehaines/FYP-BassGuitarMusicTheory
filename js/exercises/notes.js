var FEEDBACK_DIV = document.getElementById("feedback");
var FEEDBACK_DISPLAY = document.getElementById("feedbackDisplay");

var canvas = document.getElementById("notesCanvas");
var context = canvas.getContext("2d");

var timerMinutes = localStorage.getItem("timeLimit");
var previousRecordNotes = localStorage.getItem("previousRecordNotes");

var stringLength;
var currentNote;
var MAX_FRETS = 12;
var timerSeconds = 1; // add 1 second so first update shows correct total time
var score = 0;
var totalQuestions = 0;
var exerciseIsRunning = true;

function drawLine(startX, startY, endX, endY, width, colour, cap) {
    width = width || 10;
    colour = colour || "#000000";
    cap = cap || "butt";

    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.lineWidth = width;
    context.strokeStyle = colour;
    context.lineCap = cap;
    context.stroke();
}

function drawText(text, x, y, align, font) {
    align = align || "left";
    font = font || "16px Arial";

    context.font = font;
    context.textAlign = align;
    context.fillText(text, x, y);
}

function drawCircle(centerX, centerY, radius, fillColour, strokeColour, strokeWidth) {
    fillColour = fillColour || "#000000";
    strokeColour = strokeColour || -1;
    strokeWidth = strokeWidth || 5;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = fillColour;
    context.lineWidth = strokeWidth;
    context.strokeStyle = strokeColour;
    if (strokeColour != -1) { // if no colour is passed, don't stroke
        context.stroke();
    }
    context.fill();
}

var notes = [
    ["G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G"], // G string
    ["D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D"], // D string
    ["A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A"], // A string
    ["F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"]  // E string
];

canvas.width = 1;
canvas.height = 1;

function redrawCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = 150;
    stringLength = canvas.width - 50;
    // Draw STRINGS
    drawLine(50, 50, stringLength, 50, 9, "#444", "round");     //G
    drawLine(50, 75, stringLength, 75, 9, "#444", "round");     //D
    drawLine(50, 100, stringLength, 100, 9, "#444", "round");   //A
    drawLine(50, 125, stringLength, 125, 9, "#444", "round");   //E
    // Draw STRING LABELS
    drawText("G", 20, 55);
    drawText("D", 20, 80);
    drawText("A", 20, 105);
    drawText("E", 20, 130);

    // draw FRETS
    stringLength = stringLength;
    for (var i = 0; i < MAX_FRETS; i++) {
        // offset by 50 from start of the string
        fretLineX = (50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * i);
        drawLine(fretLineX, 35, fretLineX, 140, 5, "#aaa", "round");

        drawText(i + 1, fretLineX, 25, "center");
    }
}

startExercise();

function startExercise() {
    // Intersections are at x = (50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)
    // y values are 50, 100, 150, 200 for G, D, A, E strings
    redrawCanvas();

    var fret = Math.floor(Math.random() * MAX_FRETS);
    var string = Math.floor(Math.random() * 4);

    drawCircle((50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * fret), 50 + (string * 25), 10, "#E51400");

    currentNote = notes[string][fret];
}

function answerButton(link) {
    if (exerciseIsRunning) {

        var answer = link.innerHTML;

        if (currentNote == answer) {
            score += 1;
            FEEDBACK_DISPLAY.innerHTML = "Correct!";
        } else {
            FEEDBACK_DISPLAY.innerHTML = "Incorrect!";
        }

        displayFeedback();
        totalQuestions += 1;
        TOTAL_DISPLAY.innerHTML = totalQuestions;
        SCORE_DISPLAY.innerHTML = Math.round((score / totalQuestions) * 100);
        CORRECT_DISPLAY.innerHTML = score;

        startExercise();

    }
}

function displayFeedback() {
    var classToAdd;
    var timeout = 1250;

    if (FEEDBACK_DISPLAY.innerHTML == "Correct!") {
        classToAdd = "correctAnswer";
    } else {
        classToAdd = "incorrectAnswer";
    }

    setTimeout(function() {
        FEEDBACK_DIV.classList.remove(classToAdd);
        FEEDBACK_DIV.style.opacity = 0;
    }, timeout);

    FEEDBACK_DIV.style.opacity = 1;
    FEEDBACK_DIV.classList.add(classToAdd);
}

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
        extraZero = "";
    }

    TIMER_DISPLAY.innerHTML = timerMinutes + ":" + extraZero + timerSeconds;

    // check if out of time
    if (timerSeconds === 0 && timerMinutes === 0) {
        endExercise();
    }
}

function endExercise() {
    exerciseIsRunning = false;
    clearInterval(timerR);
    TIMER_DISPLAY.innerHTML = "0:00";

    document.getElementById("ootHeader").innerHTML = "Time's up!";
    document.getElementById("finalCorrect").innerHTML = score;
    document.getElementById("finalTotal").innerHTML = totalQuestions;
    document.getElementById("outOfTime").style.display = "block";

    if (!previousRecordNotes) {
        document.getElementById("noRecord").style.display = "block";
        document.getElementById("noPreviousRecordValue").innerHTML = score;
        localStorage.setItem("previousRecordNotes", score);
    } else if (previousRecordNotes < score) {
        document.getElementById("beatRecord").style.display = "block";
        document.getElementById("beatPreviousRecordValue").innerHTML = previousRecordNotes;
        localStorage.setItem("previousRecordNotes", score);
    } else {
        document.getElementById("lostRecord").style.display = "block";
        document.getElementById("lostPreviousRecordValue").innerHTML = previousRecordNotes;
    }
}

updateTimer();

// create a variable to allow clearInterval to work
var timerR = setInterval(updateTimer, TIMER_TICK_MS);
