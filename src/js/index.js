document.addEventListener("DOMContentLoaded", function () {
    const htmlTag = document.documentElement;
    let currentTheme = htmlTag.getAttribute("theme") || "light";

    // Appliquer le thème initial
    htmlTag.setAttribute("theme", currentTheme);
    console.log("Thème appliqué :", currentTheme);

    // Écouteur d'événements sur les boutons de changement de thème
    document.querySelectorAll("[data-theme]").forEach(button => {
        button.addEventListener("click", () => {
            let newTheme = button.getAttribute("data-theme");
            htmlTag.setAttribute("theme", newTheme);
            console.log("Thème changé :", newTheme);
        });
    });
});
