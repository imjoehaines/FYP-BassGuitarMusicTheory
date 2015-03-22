localStorage.setItem("timeLimit", 5);

function timeOutputUpdate(time) {
    document.getElementById("timeSliderOutput").innerHTML = time;
}

function saveSettings(scalesPage) {
    localStorage.removeItem("timeLimit");
    var timeLimit = document.getElementById("timeSlider").value;
    localStorage.setItem("timeLimit", timeLimit);

    if (scalesPage === true) {
        localStorage.removeItem("selectedKey");
        var selectedKey = document.getElementById("keyList").value;
        localStorage.setItem("selectedKey", selectedKey);

        localStorage.removeItem("selectedScale");
        var selectedScale = document.getElementById("scaleList").value;
        localStorage.setItem("selectedScale", selectedScale);
    }
}

// update label values for first load
timeOutputUpdate(document.getElementById("timeSlider").value);
