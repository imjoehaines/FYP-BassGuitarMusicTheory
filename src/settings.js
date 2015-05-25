var $ = require('jquery');

// initialise timelimit at 5 minutes
localStorage.setItem('timeLimit', 5);

/**
 * Updates the display of the timelimit
 * @param  {string} time The updated time limit
 */
function timeOutputUpdate(time) {
    document.getElementById('timeSliderOutput').innerHTML = time;
}

/**
 * Saves timelimit settings in local storage
 */
function saveSettings() {
    localStorage.removeItem('timeLimit');
    var timeLimit = document.getElementById('timeSlider').value;
    localStorage.setItem('timeLimit', timeLimit);
}

/**
 * Saves extra settings in the scale exercise and calls above saveSettings()
 */
function saveScalesSettings() {
    localStorage.removeItem('selectedKey');
    var selectedKey = document.getElementById('keyList').value;
    localStorage.setItem('selectedKey', selectedKey);

    localStorage.removeItem('selectedScale');
    var selectedScale = document.getElementById('scaleList').value;
    localStorage.setItem('selectedScale', selectedScale);

    saveSettings();
}

// update label values for first load
timeOutputUpdate(document.getElementById('timeSlider').value);
