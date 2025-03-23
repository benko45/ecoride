"use strict";

import { initApplyTheme } from './apply-theme.js';
import{ selectImage } from './functions.js';


document.body.style.position = "fixed";
document.body.style.top = `-${window.scrollY}px`;
document.body.style.width = "100%";

/******************************************************/
/*   double-flèche pour échanger arrivée et départ    */
/******************************************************/
export function updateBouncingArrows() {
    const arrows = document.getElementById('bouncing-arrows');
    if (!arrows) {
        console.error("❌ ERREUR : #bouncing-arrows introuvable !");
        return;
    }

    const dep = localStorage.getItem('selectedDepartureAddress');
    const arr = localStorage.getItem('selectedArrivalAddress');

    if (dep !== arr && dep && arr) {
        arrows.classList.remove('d-none');
        arrows.style.display = 'inline-flex';
        arrows.style.alignItems = 'center';

        const svg = arrows.querySelector('svg');
        if (!svg.classList.contains('arrow-bounce')) {
            svg.classList.add('arrow-bounce');
        }

        // Supprime les anciens écouteurs (si déjà en place)
        const clone = arrows.cloneNode(true);
        arrows.replaceWith(clone);

        clone.addEventListener('click', () => {
            console.log('🔁 Clic sur flèches → échange des adresses');

            const temp = localStorage.getItem('selectedDepartureAddress');
            localStorage.setItem('selectedDepartureAddress', localStorage.getItem('selectedArrivalAddress'));
            localStorage.setItem('selectedArrivalAddress', temp);

            document.getElementById('selected-departure-address').textContent = localStorage.getItem('selectedDepartureAddress');
            document.getElementById('selected-arrival-address').textContent = localStorage.getItem('selectedArrivalAddress');

            // Optionnel : redéclencher animation si on veut un effet actif
            svg.classList.remove('arrow-bounce');
            void svg.offsetWidth; // forcer reflow
            svg.classList.add('arrow-bounce');
        });
    } else {
        arrows.classList.add('d-none');
    }
}

export function positionDropdownMenu() {
    const menuDropdown = document.querySelector(".dropdown"); // Menu dropdown
    const title = document.getElementById("title"); // Élément du titre
    const trajectSearch = document.getElementById("traject-search"); // Élément traject-search

    if (!menuDropdown) {
        console.warn("⚠️ .dropdown est introuvable !");
        return;
    }
    if (!title) {
        console.warn("⚠️ #title est introuvable !");
        return;
    }
    if (!trajectSearch) {
        console.warn("⚠️ #traject-search est introuvable !");
        return;
    }

    // Vérifier si on est en mode mobile
    if (window.innerWidth <= 768) {
        // Récupérer la position Y du bas de `#title`
        const titleRectBottom = title.getBoundingClientRect().bottom;

        // Récupérer la position Y du haut de `#traject-search`
        const trajectTop = trajectSearch.getBoundingClientRect().top;

        // 🟢 Calculer la position idéale du menu dropdown
        const menuTop = (titleRectBottom + trajectTop) / 2 - 15;

        // Appliquer la nouvelle position avec translate(-50%, -50%)
        // menuDropdown.style.position = "absolute";
        menuDropdown.style.top = `${menuTop}px`;
        menuDropdown.style.left = "50%";
        menuDropdown.style.transform = "translate(-50%, -50%)"; // 🔥 On garde le bon centrage
        menuDropdown.style.zIndex = "1000"; // S'assurer qu'il est au-dessus des autres éléments

        // console.log(`✅ Menu dropdown positionné à ${menuTop}px`);
    }
}

export function displayDate() {
    const savedDate = localStorage.getItem('selectedDate');
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    
    const today = new Date();
    const todayFormatted = today.toLocaleDateString('fr-FR', options).replace('.', '');

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowFormatted = tomorrow.toLocaleDateString('fr-FR', options).replace('.', '');

    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(today.getDate() + 2);
    const afterTomorrowFormatted = afterTomorrow.toLocaleDateString('fr-FR', options).replace('.', '');

    if (savedDate) {
        console.log('savedDate:', savedDate);
        if (savedDate === todayFormatted) {
            $('#date-picker').text("Aujourd'hui");
        } else if (savedDate === tomorrowFormatted) {
            $('#date-picker').text("Demain");
        } else if (savedDate === afterTomorrowFormatted) {
            $('#date-picker').text("Après-demain");
        } else {
            $('#date-picker').text(savedDate);
        }
    } else {
        $('#date-picker').text("Aujourd'hui");
    }
}

export function displayPassengersNb() {
    const passengersNb = localStorage.getItem('selectedPassengers');
    document.getElementById('passengers-nb').innerHTML = passengersNb;
    console.log('👥 displayPassengersNb : Nombre de passagers:', passengersNb);
}

export function initIndex() {
    /******************************************************/
    /*      Gestion de la hauteur de la fenêtre         
    /*      pour tenir compte de la barre de recherche
    /*      du navigateur
    /******************************************************/
    const setRealVh = () => {
        let vh = window.innerHeight * 0.01;
        // définit la variable --vh en fonction de innerHeight
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setRealVh();
    window.addEventListener('resize', setRealVh);

    /******************************************************/
    initApplyTheme();

    /******************************************************/
    /*    Sélection de l'image de fond                    */
    /******************************************************/
    selectImage();

    /******************************************************/
    /*    Mise à jour des flèches de changement de sens   */
    /******************************************************/
    document.addEventListener('DOMContentLoaded', updateBouncingArrows);

    // Appliquer au chargement et au redimensionnement de la fenêtre
    document.addEventListener("DOMContentLoaded", positionDropdownMenu);
    window.addEventListener("resize", positionDropdownMenu);



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
    // const traject_container_container = document.getElementById('traject-container-container');

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
            as.forEach(element => {
                const width = element.offsetWidth;
                if(width > maxWidth) maxWidth = width;
            });
            // console.log('Max Width:', maxWidth);

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
    /*            Gestion des choix pour le trajet        */  
    /******************************************************/

    /******************************************************/
    /*                  CASE DEPART                       */
    /******************************************************/
    // écoute le click sur la zone recherche-départ
    const caseDepart = document.getElementById("click-case-depart");

    caseDepart.addEventListener("click", function() {
        // event.preventDefault();
        localStorage.setItem("clickSurItem", "true");
        // window.location.href = "public/html/choosing-address.html";
    });

    // Récupérer l'adresse stockée dans localStorage
    let selectedDepartureAddress = localStorage.getItem('selectedDepartureAddress');
    // console.log(selectedDepartureAddress);
    if ('selectedDepartureAddress: ', selectedDepartureAddress) {
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
        // window.location.href = "public/html/choosing-arrival-address.html";
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
    });

    displayDate();


    /******************************************************/
    /*               Choix du nombre de passagers         */
    /******************************************************/
    // Redirection vers la page de sélection du nombre de passagers
    document.getElementById("case-passengers").addEventListener("click", function() {
        localStorage.setItem("clickSurItem", "true");
        // window.location.href = "public/html/choosing-passengers.html";
    });

    // initialisation du nombre de passagers
    let selectedPassengers = localStorage.getItem('selectedPassengers');
    if(!selectedPassengers){
            localStorage.setItem('selectedPassengers', 1);
    }

    // Affichage du nombre de passagers
    displayPassengersNb();


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
                ? window.location.href = "public/html/choosing-address.html"
                : selectedArrivalAddress === 'Arrivée'
                    ? window.location.href = "public/html/choosing-arrival-address.html"
                    : window.location.href = "public/html/search-result.html";
        }
    });
}

initIndex();