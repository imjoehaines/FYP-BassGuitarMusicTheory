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
