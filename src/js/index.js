"use strict";

/******************************************************/
/*            Gestion des Thèmes                      */
/******************************************************/

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


/******************************************************/
/*            Gestion des choix pour le trajet        */  
/******************************************************/

/******************************************************/
/*                  CASE DEPART                       */
/******************************************************/
//écoute le click sur la zone recherche-départ
const caseDepart = document.getElementById("click-case-depart");

caseDepart.addEventListener("click", function() {
    // event.preventDefault();
    localStorage.setItem("clickSurItem", "true");
    window.location.href = "public/choosing-address.html";
});

// Récupérer l'adresse stockée dans localStorage
let selectedDepartureAddress = localStorage.getItem('selectedDepartureAddress');

if (selectedDepartureAddress) {
    // Si une adresse a été enregistrée, l'afficher
    document.getElementById('selected-departure-address').innerHTML = selectedDepartureAddress;
} else {
    // Si aucune adresse n'est sélectionnée
    selectedDepartureAddress = "Départ";
    document.getElementById('selected-departure-address').innerHTML = 'Départ';
}

/******************************************************/
/*                  CASE ARRIVEE                      */
/******************************************************/
//écoute le click sur la zone recherche-arrivée
const caseArrivee = document.getElementById("case-arrivee");
caseArrivee.addEventListener("click", function() {
    // event.preventDefault();
    localStorage.setItem("clickSurItem", "true");
    window.location.href = "public/choosing-arrival-address.html";
});

// Récupérer l'adresse stockée dans localStorage
let selectedArrivalAddress = localStorage.getItem('selectedArrivalAddress');

if (selectedArrivalAddress) {
    // Si une adresse a été enregistrée, l'afficher
    document.getElementById('selected-arrival-address').innerHTML = selectedArrivalAddress;
} else {
    // Si aucune adresse n'est sélectionnée
    selectedArrivalAddress = "Arrivée";
    document.getElementById('selected-arrival-address').innerHTML = 'Arrivée';
}


/******************************************************/
/*   double-flèche pour échanger arrivée et départ    */
/******************************************************/
if(selectedDepartureAddress !== 'Départ' && selectedArrivalAddress !== 'Arrivée') {
    document.getElementById('bouncing-arrows').classList.remove('d-none');
    document.getElementById('bouncing-arrows').style.display = 'inline-flex';
    document.getElementById('bouncing-arrows').style.alignItems = 'center';
} else  {
    document.getElementById('bouncing-arrows').classList.add('d-none');
}

document.getElementById('bouncing-arrows').addEventListener('click', function() {
    console.log('click');
    let temp = selectedDepartureAddress;
    selectedDepartureAddress = selectedArrivalAddress;
    selectedArrivalAddress = temp;
    document.getElementById('selected-departure-address').innerHTML = selectedDepartureAddress;
    document.getElementById('selected-arrival-address').innerHTML = selectedArrivalAddress;
});

/********************************************************/
/* vidange du localstorage si l'utilisateur quitte l'application */
/********************************************************/

window.addEventListener('beforeunload', function (event) {
    const aCliqueSurItem = localStorage.getItem('clickSurItem');
    if (!aCliqueSurItem) {
        localStorage.clear();
    } else {
            localStorage.removeItem('clickSurItem');
    }
});



/******************************************************/
/*               Choix de la date                     */
/******************************************************/
// Redirection vers la page de sélection de date
document.getElementById("case-date").addEventListener("click", function() {
    localStorage.setItem("clickSurItem", "true");
    window.location.href = "public/choosing-date.html";
});

// Récupérer la date enregistrée dans le localStorage
const savedDate = localStorage.getItem('selectedDate');
// Obtenir le jour, la date et le mois actuels
const today = new Date();
const options = { weekday: 'short', day: '2-digit', month: 'short' };
const todayFormatted = today.toLocaleDateString('fr-FR', options).replace('.', '');
// Afficher la date dans la div si elle existe
if (savedDate) {
    if (savedDate === todayFormatted) {
        $('#date-picker').text("Aujourd'hui");
    } else {
    $('#date-picker').text(savedDate);
    }
} else {
    $('#date-picker').text('Aujourd\'hui');
}


/******************************************************/
/*               Chois du nombre de passagers         */
/******************************************************/
// Redirection vers la page de sélection du nombre de passagers
document.getElementById("case-passengers").addEventListener("click", function() {
    localStorage.setItem("clickSurItem", "true");
    window.location.href = "public/choosing-passengers.html";
});

/******************************************************/
/*               Validation du formulaire             */
/******************************************************/
document.getElementById("search").addEventListener("click", function() {

    if(selectedDepartureAddress === selectedArrivalAddress) {
        alert('Veuillez choisir des adresses différentes');
    } else {
        localStorage.setItem("clickSurItem", "true");
        // Vérifier que les champs sont remplis
        if(!localStorage.getItem('selectedDate')) {
            localStorage.setItem('selectedDate', todayFormatted);
        }
        selectedDepartureAddress === 'Départ'
            ? window.location.href = "public/choosing-address.html"
            : selectedArrivalAddress === 'Arrivée'
                ? window.location.href = "public/choosing-arrival-address.html"
                : window.location.href = "public/choosing-traject.html";
    }
});