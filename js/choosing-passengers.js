"use strict";

import { applyTheme } from './apply-theme.js';
/******************************************************/
/******************************************************/
export function initChoosingPassengers() {
    applyTheme();
    /******************************************************/
    /*            Initialisation des plus-minus           */
    /******************************************************/
    // Récupération des éléments
    const plus = document.querySelector('.bi-plus-circle');
    const minus = document.querySelector('.bi-dash-circle');
    const passengers_nb = document.getElementById("passengers-nb");

    /******************************************************/
    /*            Animation des plus-minus                */
    /******************************************************/
    // Style
    window.onload = function() {
        if(localStorage.getItem("selectedPassengers"))
        {
            passengers_nb.innerHTML = localStorage.getItem("selectedPassengers");
        }
        else
        {
            passengers_nb.innerHTML = 1;
        }
        if(passengers_nb.innerHTML == 1)
        {
            minus.style.color = "var(--custom-primary-2)";
        } else if (passengers_nb.innerHTML == 10)
        {
            plus.style.color = "var(--custom-primary-2)";
            
        } else {
            minus.style.color = "var(--custom-primary)";
            plus.style.color = "var(--custom-primary)";
        }
    }
    // Animation
    document.getElementById("plus").addEventListener("click", function() {
        if(passengers_nb.innerHTML < 10)
        {
            minus.style.color = "var(--custom-primary)";
            if(passengers_nb.innerHTML == 9)
            {
                plus.style.color = "var(--custom-primary-2)";
            }
            passengers_nb.innerHTML++;
            localStorage.setItem("selectedPassengers", passengers_nb.innerHTML);
        }
    });
    document.getElementById("minus").addEventListener("click", function() {
        if(passengers_nb.innerHTML > 1)
        {
            if(passengers_nb.innerHTML == 2)
            {
                minus.style.color = "var(--custom-primary-2)";
            }
            plus.style.color = "var(--custom-primary)";
            passengers_nb.innerHTML--;
            localStorage.setItem("selectedPassengers", passengers_nb.innerHTML);
        } 
    });
}

export function ensureCorrectStylesheet() {
    const existingStyles = document.querySelectorAll("link[rel='stylesheet']");
    let cssPath = "";

    cssPath = window.location.hostname === "benko45.github.io"
        ? "/ecoride/public/css/choosing-passengers.css"
        : "/public/css/choosing-passengers.css";

    if (cssPath) {
        let isAlreadyLoaded = Array.from(existingStyles).some(link => link.href.includes(cssPath));

        if (!isAlreadyLoaded) {
            //console.log(`🔄 Chargement dynamique de la feuille de style : ${cssPath}`);
            const newLink = document.createElement("link");
            newLink.rel = "stylesheet";
            newLink.href = cssPath;
            document.head.appendChild(newLink);
        } else {
            //console.log(`✅ La feuille de style ${cssPath} est déjà chargée.`);
        }
    }
    //console.log(`🔍 Vérification du CSS dans le DOM :`, document.querySelectorAll("link[rel='stylesheet']"));

    document.querySelectorAll("link[rel='stylesheet']").forEach(link => {
        if (link.href.includes("main.css")) {
            //console.log(`🚨 Suppression de la feuille de style obsolète : ${link.href}`);
            link.remove();
        }
    });
}