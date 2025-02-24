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

const suggestionsDiv = document.getElementById('suggestions');
const useCurrentLocationOptionText = 'Utiliser votre position'
const useCurrentLocationOption = createAddressSuggestion(useCurrentLocationOptionText);
useCurrentLocationOption.id = 'use-location';
suggestionsDiv.appendChild(useCurrentLocationOption); // Ajoute l'option "utiliser votre position"
// const adressList = {
//     "1": "1 rue de la paix, 75002 Paris, France",
//     "2": "2 rue de la paix, 75002 Paris, France",
//     "3": "3 rue de la paix, 75002 Paris, France",
//     "4": "4 rue de la paix, 75002 Paris, France",
// }
// for (const key in adressList) {
//     const address = adressList[key];
//     const suggestion = createAddressSuggestion(address);
//     suggestionsDiv.appendChild(suggestion);
// }

let userAgent = '';

document.getElementById('address').addEventListener('input', function () {
    const query = this.value;
    // userAgent = generateRandomString()
    userAgent = 'benoit.vicente@hotmail.fr'
    if (query.length > 10) {
        // Appel à l'API Nominatim pour récupérer les suggestions

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`, {
            method: 'GET',
            headers: {
                'User-Agent': userAgent // Remplacez avec votre propre identification
            }
        })
            .then(response => response.json())
            .then(data => {
                const suggestions = data;
                removeChildrenExceptFirst(suggestionsDiv)
                suggestions.forEach((suggestion) => {
                    // Décomposer l'adresse `display_name` en fonction des virgules
                    const addressParts = suggestion.display_name.split(',');
                    console.log(addressParts);
                    // Le dernier élément est le pays
                    const country = addressParts[addressParts.length - 1]?.trim();
                    // Si le pays est la France, construire l'adresse courte
                    if (country === "France") {
                        // Construire l'adresse courte : numéro, voie, quartier, code postal, pays
                        const shortAddress = createShortddress(addressParts);
                        // Créer un div pour la suggestion
                        const suggestedAddress = createAddressSuggestion(shortAddress);
                        // Ajoute le div à la liste des suggestions
                        suggestionsDiv.appendChild(suggestedAddress);
                    }
                });
            })
            .catch(error => console.error('Erreur API:', error));
    }
});

function generateRandomString() {
    // Définir l'ensemble des caractères possibles (lettres et chiffres)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Générer une longueur aléatoire entre 10 et 15
    const length = Math.floor(Math.random() * 6) + 10;

    // Créer une chaîne de caractères aléatoire
    let randomString = '';
    for (let i = 0; i < length; i++) {
        // Sélectionner un caractère aléatoire
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
    }

    randomString += '@gmail.com'; // Ajouter une mention pour OpenStreetMap

    return randomString;
}
function createShortddress(addressParts) {
    const number = addressParts[0]?.trim() || ''; // Numéro
    const street = addressParts[1]?.trim() || ''; // Voie
    const city = addressParts[addressParts.length - 6]?.trim() || ''; // Ville
    const postalCode = addressParts[addressParts.length - 2]?.trim() || ''; // Code postal
    const country = addressParts[addressParts.length - 1]?.trim() || ''; // Pays (France)

    // Construire l'adresse courte : numéro, voie, quartier, code postal, pays
    return `${number} ${street}, ${postalCode}, ${city}, ${country}`;
}

//Fonction pour créer les suggestions d'adresse
function createAddressSuggestion(address) {
    // Crée un div pour chaque suggestion
    const suggestion = document.createElement('div');
    suggestion.classList.add('suggestion', 'background-secondary-3'); // Classe pour styliser les éléments
    // suggestion.style.width = '80%';

    // Crée un conteneur pour le texte de la suggestion
    const textContainer = document.createElement('div');
    textContainer.classList.add('text-container'); // Classe pour styliser le texte
    textContainer.style.flex = '1';  // Utilise toute la largeur restante
    textContainer.textContent = address; // Texte de la suggestion (adresse courte)
    if(address === useCurrentLocationOptionText) {
        suggestion.style.marginTop = '10px';
    }

    // Ajoute un événement de clic pour sélectionner la suggestion
    suggestion.addEventListener('click', () => {
        if(address !== useCurrentLocationOptionText) {
            document.getElementById('address').value = address; // Remplir le champ avec l'adresse courte
        }
        removeChildrenExceptFirst(suggestionsDiv)

        if(address !== useCurrentLocationOptionText) {
            localStorage.setItem('selectedArrivalAddress', address);
        } else {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
                    method: 'GET',
                    headers: {
                        'User-Agent': userAgent // Remplacez avec votre propre identification
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        const shortAddress = createShortddress(data.display_name.split(',')); // Construire l'adresse courte
                        localStorage.setItem('selectedArrivalAddress', shortAddress);
                        document.getElementById('address').value = shortAddress;
                    })
                    .catch(error => console.error('Erreur API:', error));
            });
        }
        // alert('Adresse enregistrée dans localStorage : ' + localStorage.getItem('selectedArrivalAddress'));
    });

    // Ajoute les éléments dans le div principal
    suggestion.appendChild(textContainer); // Ajoute le texte
    // Ajouter le SVG de chevron après la suggestion
    suggestion.appendChild(createChevronSVG()); // Ajoute le SVG de chevron à la fin des suggestions

    return suggestion;
}

// Fonction pour créer le nouveau SVG (chevron)
function createChevronSVG() {
    const svg = document.createElement('i');
    svg.classList.add('fa-solid', 'fa-chevron-right', 'custom-primary');
    return svg;
}

/**
 * Supprime tous les enfants d'un élément, sauf le premier
 * @param {HTMLElement} parentElement - L'élément parent
 */
function removeChildrenExceptFirst(parentElement) {
    // Vérifie si l'élément parent existe et a plus d'un enfant
    if (parentElement && parentElement.children.length > 1) {
        // Boucle à l'envers sur tous les enfants, en commençant par le dernier
        for (let i = parentElement.children.length - 1; i > 0; i--) {
            parentElement.removeChild(parentElement.children[i]);
        }
    }
}

const selectedAddress = localStorage.getItem('selectedArrivalAddress');

document.getElementById('address').value = selectedAddress







