/*global require, localStorage */
'use strict'; // jshint ignore:line

var $ = require('jquery');

var lastID = -1;
var lastLink = null;

/**
 * Toggles the description of an exercise
 * @param  {int} idnum    The ID of the given exercise
 * @param  {object} link  The link that was clicked
 */
function toggleDescription (idnum, link) {
    var description = $('#desc' + idnum);

    if (description.css('display') === 'block') {
        description.css('display', 'none');
    } else {
        description.css('display', 'block');
    }

    if (lastID !== -1 && lastID !== idnum) {
        $('#desc' + lastID).css('display', 'none');
    }

    lastID = idnum;

    if (link.text() === '+') {
        link.text('-');
    } else if (link.text() === '-') {
        link.text('+');
    }

    if (lastLink !== null && lastLink.html() === '-' && lastLink.get(0) !== link.get(0)) {
        lastLink.html('+');
    }

    lastLink = link;
}

/**
 * Clears the saved highscores from local storage
 */
function clearData () {
    localStorage.removeItem('timeLimit');
    localStorage.removeItem('selectedKey');
    localStorage.removeItem('selectedScale');
    localStorage.removeItem('previousRecordNotes');
    localStorage.removeItem('previousRecordIntervals');
    localStorage.removeItem('previousRecordScales');
}

$('.clearSavedData').click(function () {
    clearData();
});

$('.expand').click(function () {
    toggleDescription($(this).data('id'), $(this));
});
