var previousRecordScales = localStorage.getItem("previousRecordScales");

var scale = [
    ROOT_NOTE
];

// Get Note Positions
//      Creates the scale table with positions of each note in the selected scale
for (var i = 0; i < INTERVAL_DIFFERENCE_KEYS.length; i++) {
    for (var j = 0; j < SELECTED_SCALE_LIST.length; j++) {
        if(SELECTED_SCALE_LIST[j] == INTERVAL_DIFFERENCE_KEYS[i]) {
            scale.push([ROOT_NOTE[0] + INTERVAL_DIFFERENCE[INTERVAL_DIFFERENCE_KEYS[i]][0],ROOT_NOTE[1] + INTERVAL_DIFFERENCE[INTERVAL_DIFFERENCE_KEYS[i]][1]]);
        }
    }
}

function getIntervalName(currentNote) {
    for (var i = 0; i < scale.length; i++) {
        if (currentNote.toString() == scale[i].toString()) {
            return(SELECTED_SCALE_LIST[i - 1]); // -1 because no root note in selectedScale table
        }
    }
}

function getNoteName(string, fret) {
    return NOTES[string][fret];
}

var stage = new Kinetic.Stage({
    container: 'container',
    width: window.innerWidth,
    height: 400
});

function drawCircles() {
    var circleLayer = new Kinetic.Layer();
    var rootFret = scale[0][1];
    var rootString = scale[0][0];

    for (var string = 0; string < 4; string++) {
        for (var fret = 0; fret < MAX_FRETS; fret++ ) {
            if (fret == rootFret && string == rootString) {
                drawCircle((50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * rootFret), 50 + (rootString * STRING_SPACING), 15, [string,fret], "#E51400", circleLayer);
            }
            else {
                drawCircle((50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * fret), 50 + (string * STRING_SPACING), 15, [string,fret],  "black", circleLayer, 0.75);
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

drawStrings();

function buttonClicked(note) {
    note = note.join(separator = "");
    if(exerciseIsRunning) {
        if(note == currentNote.join(separator="")) {
            setFeedbackText("Correct!", "green");
            score += 1;
        }
        else {
            setFeedbackText("Incorrect!", "red");
        }

        totalQuestions += 1;
        TOTAL_DISPLAY.innerHTML = totalQuestions;
        SCORE_DISPLAY.innerHTML = Math.round((score / totalQuestions) * 100);
        CORRECT_DISPLAY.innerHTML = score;

        gameState();
    }
}

function gameState() {
    do {
        currentNote = scale[Math.floor(Math.random() * scale.length)];
    } while (currentNote == scale[0]);
    setInstructionText(getIntervalName(currentNote) + " (" + getNoteName(currentNote[0], currentNote[1]) + ")");
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
    }
    else {
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

    if (!previousRecordScales) {
        document.getElementById("noRecord").style.display = "block";
        document.getElementById("noPreviousRecordValue").innerHTML = score;
        localStorage.setItem("previousRecordScales", score);
    }
    else if (previousRecordScales < score) {
        document.getElementById("beatRecord").style.display = "block";
        document.getElementById("beatPreviousRecordValue").innerHTML = previousRecordScales;
        localStorage.setItem("previousRecordScales", score);
    }
    else {
        document.getElementById("lostRecord").style.display = "block";
        document.getElementById("lostPreviousRecordValue").innerHTML = previousRecordScales;
    }

}

var buttonLayer = new Kinetic.Layer();
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

function start() {
    buttonLayer.destroy();
    exerciseIsRunning = true;
    timerR = setInterval(updateTimer, TIMER_TICK_MS); // in ms - 1000 msec = 1 sec
    drawCircles();
    gameState();
    updateTimer();
}

var circleLayer = new Kinetic.Layer();
function viewScale() {
    buttonLayer.destroy();
    drawBackButton();
    setInstructionText(SCALE_NAME);

    for (var string = 0; string < 4; string++) {
        for (var fret = 0; fret < MAX_FRETS; fret++ ) {
            for (var i = 0; i < scale.length; i++) {
                if (scale[0][0] == string && scale[0][1] == fret) {
                    drawCircle((50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * fret), 50 + (string * STRING_SPACING), 15, "", "#E51400", circleLayer);
                    drawText(getNoteName(scale[0][0], scale[0][1]), (50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * fret) - 6, 50 + (string * STRING_SPACING) - 7, circleLayer);
                } else if (scale[i][0] == string && scale[i][1] == fret) {
                    drawCircle((50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * fret), 50 + (string * STRING_SPACING), 15, "", "black", circleLayer);
                    drawText(getNoteName(scale[i][0], scale[i][1]), (50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * fret) - 6, 50 + (string * STRING_SPACING) - 7, circleLayer, false, false, false, "white");
                }
            }
        }
    }

    stage.add(circleLayer);
}

function resetEx() {
    backButtonLayer.destroy();
    drawButtons();
    circleLayer.destroy();
    setInstructionText("");
}

var backButtonLayer = new Kinetic.Layer();

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
        resetEx();
    });

    backButtonText.on("mousedown touchstart", function() {
        resetEx();
    });
}

drawButtons();
