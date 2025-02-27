"use strict";

// Variable pour stocker la sélection de l'utilisateur
var selectedTheme = localStorage.getItem("theme") || "auto";
// console.log(localStorage.getItem("theme"));

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
// console.log(selectedTheme);
applyTheme(selectedTheme);

// **Écoute les changements du mode système en mode auto**
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) {
    if (selectedTheme === "auto") {
        applyTheme("auto");
    }
});

// Initialisation du Datepicker
$(document).ready(function() {
    // Récupérer la date stockée dans le localStorage
    let savedDate = localStorage.getItem('selectedDate');

    // Configuration du Datepicker
    $('#date-depart').datepicker({
        format: 'D dd M',   // Format de la date
        startDate: '0d',    // Date minimale (aujourd'hui)
        todayHighlight: true,   // Surligne la date d'aujourd'hui
        language: 'fr',     // Langue en français
        container: '#date-depart'
    }).on('changeDate', function(e) {
        let selectedDate = e.format();
        selectedDate = selectedDate.replace('.', '');  // Supprime le point après le jour
        localStorage.setItem('selectedDate', selectedDate);
    });

    // Si une date est enregistrée, on la sélectionne et on la surligne
    if (savedDate) {
        $('#date-depart').datepicker('setDate', savedDate);
    } else {
        // Si aucune date n'est enregistrée, on surligne la date du jour
        $('#date-depart').datepicker('setDate', new Date());
    }
});


