"use strict";

import { applyTheme } from './apply-theme.js';
/******************************************************/
/******************************************************/
export function initChoosingPassengers(mode = "final") {
    applyTheme();

    // Récupération des éléments à CHAQUE appel (car le DOM change)
    const plus = document.querySelector('.bi-plus-circle');
    const minus = document.querySelector('.bi-dash-circle');
    const passengers_nb = document.getElementById("passengers-nb");

    if (!plus || !minus || !passengers_nb) {
        console.warn("⛔ Composants du compteur de passagers non trouvés !");
        return;
    }

    // Initialisation
    initPlusMinusComponent(plus, minus, passengers_nb);

    if (mode === "final") {
        // Ne pas attacher les événements en mode "transition"
        plusAnimation(plus, minus, passengers_nb);
        minusAnimation(plus, minus, passengers_nb);
    }

    console.log(`✅ initChoosingPassengers() exécuté en mode : ${mode}`);
}


function initPlusMinusComponent(plus, minus, passengers_nb) {
    passengers_nb.innerHTML = localStorage.getItem("selectedPassengers") || 1;
    console.log("initPlusMinusComponent", passengers_nb.innerHTML);
    if(passengers_nb.innerHTML == 1)
    {
        plus.style.color = "var(--custom-primary)";
        minus.style.color = "var(--custom-primary-2)";
    } else if (passengers_nb.innerHTML == 10)
    {
        plus.style.color = "var(--custom-primary-2)";
        minus.style.color = "var(--custom-primary)";
        
    } else {
        minus.style.color = "var(--custom-primary)";
        plus.style.color = "var(--custom-primary)";
    }
}

function plusAnimation(plus, minus, passengers_nb) {
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
}

function minusAnimation(plus, minus, passengers_nb) {
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