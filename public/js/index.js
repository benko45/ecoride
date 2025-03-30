"use strict";

import { applyTheme } from './apply-theme.js';
import { initNavigation, listenToNavigation, setupPopstateHandler } from './spa-navigation.js';
import { selectImage } from './functions.js';
import { loadPage } from './page-loader.js';
import { applyDynamicStyles } from './choosing-address.js';


const nonce = document.body.getAttribute("nonce") || document.querySelector("meta[name='csp-nonce']")?.getAttribute("content");

const dynamicStyle = document.createElement('style');
if (nonce) dynamicStyle.setAttribute('nonce', nonce);

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
    selectImage(container);
    requestAnimationFrame(() => positionDropdownMenu(container));
    handleMenu(container);
    updateBouncingArrows(container);

    initNavigation();
    setupPopstateHandler(loadPage);
    listenToNavigation();

    container.querySelectorAll('.form-container, .suggestions, .suggestion, .datepicker, .text-container').forEach(el => {
        if (el) applyDynamicStyles(el);
    });

    window.addEventListener('resize', setRealVh);
    window.addEventListener("resize", () => positionDropdownMenu(container));
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
export function updateBouncingArrows(container = document) {
    const arrows = container.querySelector('#bouncing-arrows');
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

        const clone = arrows.cloneNode(true);
        arrows.replaceWith(clone);

        const svg = clone.querySelector('svg');

        clone.addEventListener('click', () => {
            console.log('🔁 Clic sur flèches → échange des adresses');

            const temp = localStorage.getItem('selectedDepartureAddress');
            localStorage.setItem('selectedDepartureAddress', localStorage.getItem('selectedArrivalAddress'));
            localStorage.setItem('selectedArrivalAddress', temp);

            container.querySelector('#selected-departure-address').textContent = localStorage.getItem('selectedDepartureAddress');
            container.querySelector('#selected-arrival-address').textContent = localStorage.getItem('selectedArrivalAddress');

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
    // console.log('📅 displayDate : Date sélectionnée:', savedDate);
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
    }
    
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
function setMobileMenu(container = document, e) {
    const connexion = container.querySelector('#connexion');
    const span_connexion = container.querySelector('#span-connexion');
  
    if (!connexion || !span_connexion) {
      console.warn("⚠️ #connexion ou #span-connexion introuvable dans container :", container);
      return;
    }
  
    if (e && e.matches) {
      connexion.classList.remove('p-3');
      span_connexion.innerText = "Connexion";
    }
  
    resizeElements(container);
    const liASpan = container.querySelectorAll('li a span');
    liASpan.forEach(element => {
      element.classList.remove('ps-2');
    });
  }
  
/******************************************************/
/*   Gestion générale du menu principal               */
/******************************************************/
function handleMenu(container = document) {
    const menuToggle = container.querySelector('#menu-toggle');
    const menuList = container.querySelector('#menu-list');
    const animatedCaret = menuToggle;

    if (!menuToggle || !menuList) {
        console.warn("⚠️ menuToggle ou menuList introuvable dans", container);
        return;
    }

    menuToggle.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        menuList.classList.remove('hide');
        menuList.classList.toggle('show');
        animatedCaret.classList.toggle('show-caret');
    });

    container.addEventListener('click', function(event) {
        if (!menuToggle.contains(event.target) && !menuList.contains(event.target)) {
            menuList.classList.remove('show');
            menuList.classList.add('hide');
            animatedCaret.classList.remove('show-caret');
        }
    });

    // Mobile
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setMobileMenu(container, mediaQuery);
    mediaQuery.addEventListener('change', (e) => setMobileMenu(container, e));
}

// Si on est dans le contexte initial (pas SPA), appeler initIndex(document)
if (!window.__spaNavigated) {
    initIndex(document);
  }