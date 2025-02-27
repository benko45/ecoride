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
/******************************************************/

/******************************************************/
/*                  Menu principal                    */
/******************************************************/

// S'assurer que le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Cibler le toggle et la liste du menu
    var menuToggle = document.getElementById('menu-toggle');
    var menuList = document.getElementById('menu-list');
    var animatedCaret = menuToggle;

    // Ajouter un événement de clic
    menuToggle.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();  // Empêche le clic de se propager au document
        
        // Basculer l'affichage du menu
        menuList.classList.remove('hide');
        menuList.classList.toggle('show');

        // Basculer l'animation du caret (avec l'icône Font Awesome)
        animatedCaret.classList.toggle('show-caret');
    });

    // Cacher le menu si on clique en dehors
    document.addEventListener('click', function(event) {
        // Si le clic est en dehors du menu, on ferme
        if (!menuToggle.contains(event.target) && !menuList.contains(event.target)) {
            menuList.classList.remove('show');
            menuList.classList.toggle('hide');
            animatedCaret.classList.remove('show-caret');
        }
    });
});


/***********************************************************/
/*              En dessous de width 768px                  */
/***********************************************************/

const mediaQuery = window.matchMedia('(max-width: 768px)');
const connexion = document.getElementById('connexion');
const span_connexion = document.getElementById('span-connexion');
// const nav = document.getElementById('nav');

function handleMediaQueryChange(e) {
    if (e.matches) {
        connexion.classList.remove('p-3');
        span_connexion.innerHTML = "Connexion";
    }
    /******************************************************/
    /*   Calcul de la largeur des dropdown-item           */
    /******************************************************/
    const resizeElements = () => {
        const lis = document.querySelectorAll('#nav li');
        const as = document.querySelectorAll('#nav li a');

        let maxWidth = 0;

        // Trouver la largeur maximale
        lis.forEach(element => {
            const width = element.offsetWidth;
            if(width > maxWidth) maxWidth = width;
        });
        console.log('Max Width:', maxWidth);

        // Appliquer la largeur maximale à tous les éléments
        lis.forEach(element => {
            element.style.width = maxWidth + 'px';
        });
        as.forEach(element => {
            element.style.width = maxWidth + 'px';
        });
    };
    // Appeler la fonction au chargement de la page
    resizeElements();

    const liASpan = document.querySelectorAll('li a span');
    liASpan.forEach(element => {
        element.classList.remove('ps-2');
    });
}

// Vérifie la taille de l'écran au chargement
handleMediaQueryChange(mediaQuery);

// Écoute les changements de taille d'écran
mediaQuery.addEventListener('change', handleMediaQueryChange);


/******************************************************/
/*    Choix de l'image de fond selon l'écran          */
/******************************************************/
// Configuration : Règles pour sélectionner l'image
const rules = [
    {
        className: 'img-mobile',
        condition: () => window.innerWidth < 768
    },
    {
        className: 'img-tablet',
        condition: () => window.innerWidth <= 1600 
    },
    {
        className: 'img-desktop',
        condition: () => window.innerWidth > 1600 
    }
];

// Fonction de sélection de l'image optimale
const selectImage = () => {
    // Cacher toutes les images
    document.querySelectorAll('.responsive-img').forEach(img => {
        img.classList.add('hidden');
        img.classList.remove('visible');
    });

    // Parcourir les règles et afficher l'image qui correspond à la condition
    for (let rule of rules) {
        if (rule.condition()) {
            const img = document.querySelector(`.${rule.className}`);
            img.classList.add('visible');
            img.classList.remove('hidden');
            break;
        }
    }
};

window.addEventListener('load', () => {
    selectImage();
    window.addEventListener('resize', selectImage);
});

/*          code de debug               */
// console.log("Début du script");

// document.addEventListener('DOMContentLoaded', () => {
//     console.log("DOMContentLoaded déclenché");
// });

// window.addEventListener('load', () => {
//     console.log("window.onload déclenché");
// });

// console.log("Images détectées :");
// document.querySelectorAll('.responsive-img').forEach(img => {
//     console.log(img);
// });


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
/*               Choix du nombre de passagers         */
/******************************************************/
// Redirection vers la page de sélection du nombre de passagers
document.getElementById("case-passengers").addEventListener("click", function() {
    localStorage.setItem("clickSurItem", "true");
    window.location.href = "public/choosing-passengers.html";
});

// initialisation du nombre de passagers
let selectedPassengers;
localStorage.getItem('selectedPassengers')
    ? selectedPassengers = localStorage.getItem('selectedPassengers')
    : selectedPassengers = 1;

document.getElementById('passengers-nb').innerHTML = selectedPassengers;


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