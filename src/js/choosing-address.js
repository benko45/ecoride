"use strict";
// choosing-address.js
console.log("choosing-address.js est bien appliqué !");

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



//écoute la saisiesur la zone recherche-départ pour faire des propositions d'adresses
document.getElementById('address').addEventListener('input', function () {
    const query = this.value;
    if (query.length > 2) {
        // Appel à l'API Nominatim pour récupérer les suggestions
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
            .then(response => response.json())
            .then(data => {
                const suggestions = data;
                const suggestionsDiv = document.getElementById('suggestions');
                suggestionsDiv.innerHTML = ''; // Vide les anciennes suggestions

                suggestions.forEach((suggestion, index) => {
                    // Crée un div pour chaque suggestion
                    const div = document.createElement('div');
                    div.classList.add('suggestion-item'); // Classe pour styliser les éléments

                    // Crée un conteneur pour l'icône au début du div (ici un SVG de cible)
                    const iconStartContainer = document.createElement('div');
                    iconStartContainer.style.display = 'flex';
                    iconStartContainer.style.alignItems = 'center';
                    iconStartContainer.style.justifyContent = 'center';
                    iconStartContainer.style.width = '24px'; // Largeur contrôlée pour l'icône
                    iconStartContainer.style.height = '24px'; // Hauteur contrôlée pour l'icône

                    // Crée le SVG de la cible pour l'icône de début dynamiquement
                    const iconStart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    iconStart.setAttribute('viewBox', '0 0 24 24');
                    iconStart.setAttribute('width', '16');
                    iconStart.setAttribute('height', '16');

                    // Création de l'élément <circle> dans le SVG
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', '12');
                    circle.setAttribute('cy', '12');
                    circle.setAttribute('r', '9');
                    circle.setAttribute('fill', 'none');
                    circle.setAttribute('stroke', '#000');
                    circle.setAttribute('stroke-linecap', 'round');
                    circle.setAttribute('stroke-linejoin', 'round');
                    circle.setAttribute('stroke-width', '2');

                    // Création des lignes dans le SVG
                    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line1.setAttribute('x1', '12');
                    line1.setAttribute('y1', '1');
                    line1.setAttribute('x2', '12');
                    line1.setAttribute('y2', '7');
                    line1.setAttribute('stroke', '#000');
                    line1.setAttribute('stroke-width', '2');

                    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line2.setAttribute('x1', '12');
                    line2.setAttribute('y1', '17');
                    line2.setAttribute('x2', '12');
                    line2.setAttribute('y2', '23');
                    line2.setAttribute('stroke', '#000');
                    line2.setAttribute('stroke-width', '2');

                    const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line3.setAttribute('x1', '1');
                    line3.setAttribute('y1', '12');
                    line3.setAttribute('x2', '7');
                    line3.setAttribute('y2', '12');
                    line3.setAttribute('stroke', '#000');
                    line3.setAttribute('stroke-width', '2');

                    const line4 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line4.setAttribute('x1', '17');
                    line4.setAttribute('y1', '12');
                    line4.setAttribute('x2', '23');
                    line4.setAttribute('y2', '12');
                    line4.setAttribute('stroke', '#000');
                    line4.setAttribute('stroke-width', '2');

                    const line5 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line5.setAttribute('x1', '12');
                    line5.setAttribute('y1', '12');
                    line5.setAttribute('x2', '12');
                    line5.setAttribute('y2', '12');
                    line5.setAttribute('stroke', '#000');
                    line5.setAttribute('stroke-width', '2');

                    // Ajouter tous les éléments SVG dans le conteneur SVG
                    iconStart.appendChild(circle);
                    iconStart.appendChild(line1);
                    iconStart.appendChild(line2);
                    iconStart.appendChild(line3);
                    iconStart.appendChild(line4);
                    iconStart.appendChild(line5);

                    // Ajoute le SVG dans le conteneur
                    iconStartContainer.appendChild(iconStart);

                    // Crée un conteneur pour le texte de la suggestion
                    const textContainer = document.createElement('div');
                    textContainer.style.flex = '1';  // Utilise toute la largeur restante
                    textContainer.textContent = suggestion.display_name; // Texte de la suggestion

                    // Crée un conteneur pour l'icône à la fin du div (ici un SVG simple)
                    const iconEndContainer = document.createElement('div');
                    iconEndContainer.style.display = 'flex';
                    iconEndContainer.style.alignItems = 'center';
                    iconEndContainer.style.justifyContent = 'center';
                    iconEndContainer.style.width = '24px'; // Largeur contrôlée pour l'icône
                    iconEndContainer.style.height = '24px'; // Hauteur contrôlée pour l'icône

                    // Crée l'icône pour l'icône de fin (SVG rouge)
                    const iconEnd = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    iconEnd.setAttribute('width', '16');
                    iconEnd.setAttribute('height', '16');
                    iconEnd.setAttribute('viewBox', '0 0 16 16');
                    const circleEnd = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circleEnd.setAttribute('cx', '8');
                    circleEnd.setAttribute('cy', '8');
                    circleEnd.setAttribute('r', '6');
                    circleEnd.setAttribute('fill', 'red');
                    iconEnd.appendChild(circleEnd);

                    iconEndContainer.appendChild(iconEnd); // Ajoute le SVG dans le conteneur

                    // Ajoute les trois conteneurs (icône de début, texte, icône de fin) dans le div principal
                    div.appendChild(iconStartContainer); // Ajoute l'icône de début
                    div.appendChild(textContainer); // Ajoute le texte
                    div.appendChild(iconEndContainer); // Ajoute l'icône de fin

                    // Ajoute un événement de clic pour sélectionner la suggestion
                    div.addEventListener('click', () => {
                        document.getElementById('address').value = suggestion.display_name;
                        suggestionsDiv.innerHTML = ''; // Vide les suggestions après la sélection
                    });

                    // Ajoute le div à la liste des suggestions
                    suggestionsDiv.appendChild(div);
                });
            })
            .catch(error => console.error('Erreur API:', error));
    }
});












