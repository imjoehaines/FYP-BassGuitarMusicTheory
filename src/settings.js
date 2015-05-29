/*global require, localStorage */
'use strict'; // jshint ignore:line

var $ = require('jquery');

/**
 * Updates the display of the timelimit
 * @param  {string} time The updated time limit
 */
function timeOutputUpdate(time) {
    $('#timeSliderOutput').text(time);
}

/**
 * Saves timelimit settings in local storage
 */
function saveTimeSettings() {
    var timeLimit = $('#timeSlider').val();

    if (timeLimit) {
        localStorage.removeItem('timeLimit');

        localStorage.setItem('timeLimit', timeLimit);
    }
}

/**
 * Saves extra settings in the scale exercise and calls above saveTimeSettings()
 */
function saveScalesSettings() {
    var selectedKey = $('#keyList').val();
    var selectedScale = $('#scaleList').val();

    if (selectedKey && selectedScale) {
        localStorage.removeItem('selectedKey');
        localStorage.removeItem('selectedScale');

        localStorage.setItem('selectedKey', selectedKey);
        localStorage.setItem('selectedScale', selectedScale);
    }

    saveTimeSettings();
}

$('.scaleSettings').change(saveScalesSettings);
$('#timeSlider').change(function () {
    saveScalesSettings();
    timeOutputUpdate($(this).val());
});

// update label values for first load
timeOutputUpdate($('#timeSlider').val());
saveScalesSettings();
