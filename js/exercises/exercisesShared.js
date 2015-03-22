var TIMER_DISPLAY = document.getElementById("timer");
var SCORE_DISPLAY = document.getElementById("score");
var CORRECT_DISPLAY = document.getElementById("correct");
var TOTAL_DISPLAY = document.getElementById("total");

var TIMER_TICK_MS = 1000; // Amount of time in ms between timer ticks | default should be 1000 (1 sec)
var STRING_SPACING = 35;  // vertical spacing between strings
var MAX_STRINGS = 4;      // number of strings to draw
var MAX_FRETS = 12;       // number of frets to draw - intervals overrides this

var timerSeconds = 1;     // start at 1 second so first update shows correct total time
var timerMinutes = localStorage.getItem("timeLimit");
var exerciseIsRunning = false;
var score = 0;
var totalQuestions = 0;
var currentNote = 0;
var timerR;

/**
 * Intervals and Scales only 
 */

function drawStrings() {
    var backgroundLayer = new Kinetic.Layer();
    var i;

    stringLength = stage.getWidth() - 50;
    
    // Draw STRINGS
    for (i = 0; i < MAX_STRINGS; i++) {
        drawLine(50, 50 + (STRING_SPACING * i), stringLength, 50 + (STRING_SPACING * i), 9, "#444", "round", backgroundLayer);
    }

    // Draw STRING LABELS
    drawText("G", 20, 42, backgroundLayer);
    drawText("D", 20, 42 + STRING_SPACING, backgroundLayer);
    drawText("A", 20, 42 + (STRING_SPACING * 2), backgroundLayer);
    drawText("E", 20, 42 + (STRING_SPACING * 3), backgroundLayer);

    // draw FRETS
    for (i = 0; i < MAX_FRETS; i++) {
        // offset by 50 from start of the string
        fretLineX = (50 + ((stringLength / MAX_FRETS) / 2)) + (((stringLength - 50) / MAX_FRETS)  * i);
        drawLine(fretLineX, 35, fretLineX, 50 + (STRING_SPACING * 3) + 15, 5, "#aaa", "round", backgroundLayer);

        drawText(i + 1, fretLineX - 4, 10, backgroundLayer, "center");
    }

    stage.add(backgroundLayer);
}

function drawLine(startX, startY, endX, endY, width, colour, cap, layer) {
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

function drawText(text, x, y, layer, align, font, size, colour) {
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

function drawCircle(centerX, centerY, radius, id, fillColour, layer, opacity) {
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
    circle.on("mousedown touchstart", makeFunction(id));
}
