function activeLink(link) {
    setTimeout(function() {
        link.classList.remove("activeLink");
    }, 100);

    link.classList.add("activeLink");
}
