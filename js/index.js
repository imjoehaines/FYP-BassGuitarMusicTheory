var lastID = -1;
var lastLink = -1;

function toggleDescription(idnum, link) {
    var allDivs = document.getElementById("desc" + idnum);

    if (allDivs.style.display == "block") {
            allDivs.style.display = "none";
        }
    else {
            allDivs.style.display = "block";
        }

    if (lastID != -1 && lastID != idnum) {
        document.getElementById("desc" + lastID).style.display = "none";
    }

    lastID = idnum;

    if (link.innerHTML == "+") {
        link.innerHTML = "-";
    }
    else if (link.innerHTML == "-") {
        link.innerHTML = "+";
    }

    if (lastLink.innerHTML == "-" && lastLink != link) {
        lastLink.innerHTML = "+";
    }

    lastLink = link;
}


function clearData() {
    localStorage.removeItem("timeLimit");
    localStorage.removeItem("selectedKey");
    localStorage.removeItem("selectedScale");
    localStorage.removeItem("previousRecordNotes");
    localStorage.removeItem("previousRecordIntervals");
    localStorage.removeItem("previousRecordScales");
}
