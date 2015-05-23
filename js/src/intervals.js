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
