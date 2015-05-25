var $ = require('jquery');

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
    TIMER_DISPLAY: $('#timer'),
    SCORE_DISPLAY: $('#score'),
    CORRECT_DISPLAY: $('#correct'),
    TOTAL_DISPLAY: $('#total'),

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
