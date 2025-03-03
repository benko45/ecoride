"use strict";

import { applyTheme } from './apply-theme.js';
/******************************************************/
/******************************************************/
applyTheme();

/******************************************************/
/*            Initialisation des plus-minus           */
/******************************************************/
// Récupération des éléments
const plus = document.querySelector('.bi-plus-circle');
const minus = document.querySelector('.bi-dash-circle');
const passengers_nb = document.getElementById("passengers-nb");
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
/******************************************************/
/*            Animation des plus-minus                */
/******************************************************/
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

  