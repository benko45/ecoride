"use strict";

// Variable pour stocker la sélection de l'utilisateur
var selectedTheme = localStorage.getItem("theme") || "auto";

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

    // Sauvegarder le thème dans le localStorage pour la prochaine fois
    localStorage.setItem("theme", theme);
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


/*                  CASE DEPART                  */
//écoute le click sur la zone recherche-départ
const caseDepart = document.getElementById("case-depart");

caseDepart.addEventListener("click", function(event) {
    // event.preventDefault();
    localStorage.setItem("clickSurItem", "true");
    window.location.href = "public/choosing-address.html";
});

// Récupérer l'adresse stockée dans localStorage
const selectedAddress = localStorage.getItem('selectedDepartureAddress');

if (selectedAddress) {
    // Si une adresse a été enregistrée, l'afficher
    document.getElementById('selected-departure-address').innerHTML = selectedAddress;
} else {
    // Si aucune adresse n'est sélectionnée
    document.getElementById('selected-departure-address').innerHTML = 'Départ';
}


/*                  CASE ARRIVEE                  */
//écoute le click sur la zone recherche-arrivée
const caseArrivee = document.getElementById("case-arrivee");
caseArrivee.addEventListener("click", function(event) {
    // event.preventDefault();
    localStorage.setItem("clickSurItem", "true");
    window.location.href = "public/choosing-arrival-address.html";
});

// Récupérer l'adresse stockée dans localStorage
const selectedArrivalAddress = localStorage.getItem('selectedArrivalAddress');

if (selectedArrivalAddress) {
    // Si une adresse a été enregistrée, l'afficher
    document.getElementById('selected-arrival-address').innerHTML = selectedArrivalAddress;
} else {
    // Si aucune adresse n'est sélectionnée
    document.getElementById('selected-arrival-address').innerHTML = 'Arrivée';
}

window.addEventListener('beforeunload', function (event) {
    const aCliqueSurItem = localStorage.getItem('clickSurItem');
    if (!aCliqueSurItem) {
        localStorage.clear();
    } else {
            localStorage.removeItem('clickSurItem');
    }
});