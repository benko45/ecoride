// document.addEventListener("DOMContentLoaded", function () {
//     const htmlTag = document.documentElement;
//     let currentTheme = htmlTag.getAttribute("theme") || "light";

    // Appliquer le thème initial
    // htmlTag.setAttribute("theme", currentTheme);
    // console.log("Thème appliqué :", currentTheme);

//     // Écouteur d'événements sur les boutons de changement de thème
//     document.querySelectorAll("[data-theme]").forEach(button => {
//         button.addEventListener("click", () => {
//             let newTheme = button.getAttribute("data-theme");
//             htmlTag.setAttribute("theme", newTheme);
//             console.log("Thème changé :", newTheme);
//         });
//     });
// });

"use strict";

// Variable pour stocker la sélection de l'utilisateur
var selectedTheme = "auto";

// Fonction pour appliquer le thème effectif
function applyTheme(theme) {
    // Déterminer le vrai thème utilisé (light ou dark) en cas de "auto"
    var effectiveTheme = (theme === "auto")
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light")
        : theme;

    // **1️⃣ Met à jour Bootstrap (applique la couleur correcte)**
    document.documentElement.setAttribute("theme", effectiveTheme);

    // **2️⃣ Stocke le thème sélectionné pour l'affichage correct de l'icône**
    document.documentElement.setAttribute("selected-theme", theme);
}

// Appliquer le thème immédiatement au chargement
applyTheme(selectedTheme);

// Gestion des clics sur le dropdown
var dropdownItems = document.querySelectorAll('.dropdown-item');
dropdownItems.forEach(function (item) {
    item.addEventListener('click', function () {
        selectedTheme = this.getAttribute('theme');
        applyTheme(selectedTheme);
    });
});

// **Écoute les changements du mode système en mode auto**
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) {
    if (selectedTheme === "auto") {
        applyTheme("auto");
    }
});


//écoute le click sur la zone recherche-départ
document.getElementById("case-depart").addEventListener("click", function(event) {
    // event.preventDefault();
    window.location.href = "choosing-address.html";
});

// éviter que le champ de saisie input ne capte le clic et empêche la navigation
// document.getElementById("form-depart").addEventListener("click", function(event) {
//     event.stopPropagation();
//     this.blur(); // Empêche la mise en focus de l'input
// });

