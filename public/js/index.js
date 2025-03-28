"use strict";

import { applyTheme } from './apply-theme.js';
import { initNavigation, listenToNavigation, setupPopstateHandler } from './spa-navigation.js';
import { selectImage } from './functions.js';
import { loadPage } from './page-loader.js';

document.body.style.position = "fixed";
document.body.style.top = `-${window.scrollY}px`;
document.body.style.width = "100%";


/******************************************************/
/*   logique principale                               */
/******************************************************/
export function initIndex(container = document) {
    console.log(container)
    console.log(container.querySelector(".dropdown"))
    console.log("📦 container type:", container.nodeType, "—", container);
    
    if(container === document) {
        localStorage.setItem('selectedDepartureAddress', 'Départ');
        localStorage.setItem('selectedArrivalAddress', 'Arrivée');
        localStorage.setItem('selectedDate', "Aujourd'hui");
        localStorage.setItem('selectedPassengers', 1);
        displayData();
    } else displayData(container);

    setRealVh();
    applyTheme();
    selectImage();
    positionDropdownMenu(container);
    handleMenu();
    updateBouncingArrows();
    /******************************************************/
    /*            Gestion de la Navigation                */
    /******************************************************/
    initNavigation();
    setupPopstateHandler(loadPage);
    listenToNavigation();
   
    window.addEventListener('resize', setRealVh);
    document.addEventListener('DOMContentLoaded', updateBouncingArrows);
    document.addEventListener("DOMContentLoaded", () => positionDropdownMenu(container));
    window.addEventListener("resize", () => positionDropdownMenu(container));
    /******************************************************/
    /*               Validation du formulaire             */
    /******************************************************/
    // document.getElementById("search").addEventListener("click", function() {

    //     if(selectedDepartureAddress === selectedArrivalAddress) {
    //         alert('Veuillez choisir des adresses différentes');
    //     } else {
    //         // Vérifier que les champs sont remplis
    //         if(!localStorage.getItem('selectedDate')) {
    //             localStorage.setItem('selectedDate', todayFormatted);
    //         }
    //         selectedDepartureAddress === 'Départ'
    //             ? window.location.href = "public/html/choosing-address.html"
    //             : selectedArrivalAddress === 'Arrivée'
    //                 ? window.location.href = "public/html/choosing-arrival-address.html"
    //                 : window.location.href = "public/html/search-result.html";
    //     }
    // });
}

/******************************************************/
/*            Gestion de la hauteur de la fenêtre     */
/*            pour tenir compte de la barre de        */
/*            recherche du navigateur                 */   
/******************************************************/
const setRealVh = () => {
    let vh = window.innerHeight * 0.01;
    // définit la variable --vh en fonction de innerHeight
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};

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

    if (dep !== 'Départ' && arr !== 'Arrivée' && dep !== arr) {
        console.log('🔁 Flèches activées');
        arrows.classList.remove('d-none');
        arrows.style.display = 'inline-flex';
        arrows.style.alignItems = 'center';

        // 🧼 Cloner et remplacer pour supprimer les anciens écouteurs
        const clone = arrows.cloneNode(true);
        arrows.replaceWith(clone);

        const svg = clone.querySelector('svg'); // ✅ récupérer le bon SVG

        clone.addEventListener('click', () => {
            console.log('🔁 Clic sur flèches → échange des adresses');

            const temp = localStorage.getItem('selectedDepartureAddress');
            localStorage.setItem('selectedDepartureAddress', localStorage.getItem('selectedArrivalAddress'));
            localStorage.setItem('selectedArrivalAddress', temp);

            document.getElementById('selected-departure-address').textContent = localStorage.getItem('selectedDepartureAddress');
            document.getElementById('selected-arrival-address').textContent = localStorage.getItem('selectedArrivalAddress');

            // 🔄 Relancer animation
            if (svg) {
                svg.classList.remove('arrow-bounce');
                void svg.offsetWidth;
                svg.classList.add('arrow-bounce');
            }
        });
    } else {
        arrows.classList.add('d-none');
    }
}

export function positionDropdownMenu(container = document) {
    if (!(container instanceof Element || container instanceof Document)) {
        console.error("❌ container n'est pas un élément DOM valide :", container);
        return;
    }

    const menuDropdown = container.querySelector(".dropdown");
    const title = container.querySelector("#title");
    const trajectSearch = container.querySelector("#traject-search");
    
    if (!menuDropdown || !title || !trajectSearch) {
        console.warn("⚠️ Impossible de positionner le menu thème (élément manquant)");
        return;
    }
    
    if (window.innerWidth <= 768) {
        const titleRectBottom = title.getBoundingClientRect().bottom;
        const trajectTop = trajectSearch.getBoundingClientRect().top;
        const menuTop = (titleRectBottom + trajectTop) / 2 - 15;
        
        menuDropdown.style.top = `${menuTop}px`;
        menuDropdown.style.left = "50%";
        menuDropdown.style.transform = "translate(-50%, -50%)";
        menuDropdown.style.zIndex = "1000";
    }
}


function displayDepartureAddress(container=document) {
    container.querySelector('#selected-departure-address').innerText = localStorage.getItem('selectedDepartureAddress');
}

function displayArrivalAddress(container=document) {
    container.querySelector('#selected-arrival-address').innerText = localStorage.getItem('selectedArrivalAddress');
}

function displayDate(container=document) {
    const savedDate = localStorage.getItem('selectedDate');
    console.log('📅 displayDate : Date sélectionnée:', savedDate);
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    
    const today = new Date();
    const todayFormatted = today.toLocaleDateString('fr-FR', options).replace('.', '').toLowerCase();

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowFormatted = tomorrow.toLocaleDateString('fr-FR', options).replace('.', '').toLowerCase();

    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(today.getDate() + 2);
    const afterTomorrowFormatted = afterTomorrow.toLocaleDateString('fr-FR', options).replace('.', '').toLowerCase();
    
    const datepicker = $(container).find('#date-picker');
    if (!datepicker) {
        console.warn("⚠️ #date-picker introuvable dans container:", container);
        return;
    } else console.log('📅 displayDate : datepicker trouvé :', datepicker);
    
    if (savedDate) {
        if (savedDate === todayFormatted) {
            datepicker.text("Aujourd'hui");
        } else if (savedDate === tomorrowFormatted) {
            datepicker.text("Demain");
        } else if (savedDate === afterTomorrowFormatted) {
            datepicker.text("Après-demain");
        } else {
            datepicker.text(savedDate);
        }
    } else {
        datepicker.text("Aujourd'hui");
    }
}

function displayPassengersNb(container=document) {
    const passengersNb = localStorage.getItem('selectedPassengers');
    container.querySelector('#passengers-nb').innerText = passengersNb;
    // console.log('👥 displayPassengersNb : Nombre de passagers:', passengersNb);
}

function displayData(container=document) {
    displayDepartureAddress(container);
    displayArrivalAddress(container);
    displayDate(container);
    displayPassengersNb(container);
}

/******************************************************/
/*   Calcul de la largeur des dropdown-item           */
/*   du menu principal                                */
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
/******************************************************/
/*   Gestion du menu principal en mode tablette       */
/******************************************************/
function setMobileMenu(e) {
    const connexion = document.getElementById('connexion');
    const span_connexion = document.getElementById('span-connexion');  
    if (e.matches) {
        connexion.classList.remove('p-3');
        span_connexion.innerText = "Connexion";
    }
    resizeElements();
    const liASpan = document.querySelectorAll('li a span');
    liASpan.forEach(element => {
        element.classList.remove('ps-2');
    });
}
/******************************************************/
/*   Gestion générale du menu principal               */
/******************************************************/
function handleMenu() {
    /*  Mode desktop                                      */
    /**************************************************** */
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
    /*******************************************************/
    /*  En dessous de width 768px (mode mobile)            */
    /*******************************************************/
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    // Vérifie la taille de l'écran au chargement
    setMobileMenu(mediaQuery);
    // Écoute les changements de taille d'écran
    mediaQuery.addEventListener('change', setMobileMenu);
}


initIndex();