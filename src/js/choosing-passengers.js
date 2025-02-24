"use strict";

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

// **Écoute les changements du mode système en mode auto**
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) {
    if (selectedTheme === "auto") {
        applyTheme("auto");
    }
});

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

  