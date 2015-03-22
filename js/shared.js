/**
 * Adds the activeLink class to a link - this displays the flash of red when
 * a link is clicked
 * @param  {object} link The link that was clicked
 */
function activeLink(link) {
    setTimeout(function() {
        link.classList.remove("activeLink");
    }, 100);

    link.classList.add("activeLink");
}
