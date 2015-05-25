var $ = require('jquery');

// initialise timelimit at 5 minutes
localStorage.setItem('timeLimit', 5);

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
function saveSettings() {
    localStorage.removeItem('timeLimit');

    var timeLimit = $('#timeSlider').val();
    localStorage.setItem('timeLimit', timeLimit);
}

/**
 * Saves extra settings in the scale exercise and calls above saveSettings()
 */
function saveScalesSettings() {
    localStorage.removeItem('selectedKey');

    var selectedKey = $('#keyList').val();
    localStorage.setItem('selectedKey', selectedKey);

    localStorage.removeItem('selectedScale');

    var selectedScale = $('#scaleList').val();
    localStorage.setItem('selectedScale', selectedScale);

    saveSettings();
}

// update label values for first load
timeOutputUpdate($('#timeSlider').val());
saveScalesSettings();

$('.scaleSettings').change(saveScalesSettings);
$('#timeSlider').change(function () {
    saveScalesSettings();
    timeOutputUpdate($(this).val());
});
