"use strict";

import { applyTheme } from './apply-theme.js';
import { setTempData } from './handleData.js';

export function initChoosingPassengers(container=document) {
    applyTheme();

    // Récupération des éléments à CHAQUE appel (car le DOM change)
    const plus = container.querySelector('.bi-plus-circle');
    const minus = container.querySelector('.bi-dash-circle');
    const passengers_nb = container.querySelector("#passengers-nb");

    if (!plus || !minus || !passengers_nb) {
        console.warn("⛔ Composants du compteur de passagers non trouvés !");
        return;
    }

    // Initialisation
    initPlusMinusComponent(plus, minus, passengers_nb);
    plusAnimation(plus, minus, passengers_nb, container);
    minusAnimation(plus, minus, passengers_nb, container);
}


function initPlusMinusComponent(plus, minus, passengers_nb) {
    const passengersNb = parseInt(localStorage.getItem("selectedPassengers") || 1, 10);
    passengers_nb.innerText = passengersNb;
    console.log("initPlusMinusComponent", passengers_nb.innerHTML);
    if(passengersNb == 1)
    {
        plus.style.color = "var(--custom-primary)";
        minus.style.color = "var(--custom-primary-2)";
    } else if (passengersNb == 10)
    {
        plus.style.color = "var(--custom-primary-2)";
        minus.style.color = "var(--custom-primary)";
        
    } else {
        minus.style.color = "var(--custom-primary)";
        plus.style.color = "var(--custom-primary)";
    }
}

function plusAnimation(plus, minus, passengers_nb, container) {
    container.querySelector("#plus").addEventListener("click", function() {
        let passengersNb = parseInt(passengers_nb.innerHTML, 10);
        if(passengersNb < 10)
        {
            minus.style.color = "var(--custom-primary)";
            if(passengersNb == 9)
            {
                plus.style.color = "var(--custom-primary-2)";
            }
            passengersNb++;
            setTempData("selectedPassengers", passengersNb.toString());
            passengers_nb.innerText = passengersNb;
        }
    });
}

function minusAnimation(plus, minus, passengers_nb, container) {
    container.querySelector("#minus").addEventListener("click", function() {
        let passengersNb = parseInt(passengers_nb.innerHTML, 10);
        if(passengersNb > 1)
        {
            if(passengersNb == 2)
            {
                minus.style.color = "var(--custom-primary-2)";
            }
            plus.style.color = "var(--custom-primary)";
            passengersNb--;
            setTempData("selectedPassengers", passengersNb.toString());
            passengers_nb.innerText = passengersNb;
        } 
    });
}