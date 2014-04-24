var timerTickMS = 1000; // Amount of time in ms between timer ticks | default should be 1000 (1 sec)
var stringSpacing = 35; // vertical spacing between strings
var maxStrings = 4;			// number of strings to draw
var maxFrets = 12;			// number of frets to draw - intervals overrides this
var timerSeconds = 1; 	// add 1 second so first update shows correct total time
var timerMinutes = localStorage.getItem("timeLimit");
var timerDisplay = document.getElementById("timer");
var exRunning = false;
var score = 0;
var scoreDisplay = document.getElementById("score");
var correctDisplay = document.getElementById("correct")
var totalQuestions = 0;
var totalDisplay = document.getElementById("total");
var currentNote = 0;
var timerR;

function activeLink(link) {
	setTimeout(function() {
		link.classList.remove("activeLink")
	}, 100)

	link.classList.add("activeLink")
}

// for Intervals and Scales only - KineticJS helpers
function drawLine(startX, startY, endX, endY, width, colour, cap, layer) {
	var width = width || 10;
	var colour = colour || "#000000";
	var cap = cap || "butt";

	var line = new Kinetic.Line({
		points: [startX, startY, endX, endY],
		stroke: colour,
		strokeWidth: width,
		lineCap: cap
	})

	layer.add(line);
}

function drawText(text, x, y, layer, align, font, size, colour) {
	align = align || "left";
	font = font || "Arial";
	size = size || 16;
	colour = colour || "black"

	var label = new Kinetic.Text({
		text: text,
		x: x,
		y: y,
		align: align,
		fontFamily: font,
		fontSize: size,
		fill: colour
	})

	layer.add(label);
}

function drawCircle(centerX, centerY, radius, id, fillColour, layer, opacity) {
	opacity = opacity || 1

	var circle = new Kinetic.Circle({
		x: centerX,
		y: centerY,
		radius: radius,
		fill: fillColour,
		id: id,
		opacity: opacity
	})

	layer.add(circle);
	circle.on("mousedown touchstart", makeFunction(id))

}
