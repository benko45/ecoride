"use strict";

import { applyTheme } from './apply-theme.js';
/******************************************************/
/******************************************************/
applyTheme();
/******************************************************/
/******************************************************/

//écoute la saisie sur la zone recherche-départ pour faire des propositions d'adresses

console.log("choosing-address.js est exécuté...");
const inputField = document.getElementById('address');

if (!inputField) {
    console.warn("Champ d'adresse introuvable !");
}

// console.log("✅ Élément `.suggestions` ajouté :", document.querySelector('#suggestions'));
const suggestionsDiv = document.getElementById('suggestions');
const useCurrentLocationOptionText = 'Utiliser votre position';
const useCurrentLocationOption = createAddressSuggestion(useCurrentLocationOptionText);
setTimeout(() => {
    const suggestions = Array.from(document.getElementsByClassName("suggestion"));
    if (suggestions.length > 0) {
        console.log("😀 Classe `.suggestion` trouvée !");
        suggestions.forEach(el => {
            el.style.opacity = 0; // Masquer temporairement
            el.style.display = "flex"; // Réappliquer le style
        });
        gsap.fromTo(".suggestion", 
            { opacity: 0, y: 20 }, // Départ invisible avec un léger décalage vers le bas
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.1 } // Apparition douce avec un effet fluide
        );
    } else {
        console.error("❌ Classe `.suggestion` introuvable !");
    }

    const textContainers = Array.from(document.getElementsByClassName("text-container"));
    if (textContainers.length > 0) {
        console.log("😀 Classe `.text-container` trouvée !");
        textContainers.forEach(el => {
            el.style.display = 'none'; // Masquer temporairement
            el.offsetHeight; // Force un reflow
            el.style.display = 'flex';  // Utilise toute la largeur restante
        });
    } else {
        console.error("❌ Classe `.text-container` introuvable !");
    }

    console.log("✅ Styles `.suggestion` et `.text-container` recalculés !");
}, 150);


suggestionsDiv.appendChild(useCurrentLocationOption);


const userAgent = 'benoit.vicente@hotmail.fr';

console.log("Ajout de l'événement `input` au champ d'adresse...");
inputField.addEventListener('input', function () {
    console.log("L'utilisateur a tapé :", this.value); // Vérifier si l'événement fonctionne

    const query = this.value;
    

    if (query.length > 10) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`, {
            method: 'GET',
            headers: { 'User-Agent': userAgent }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Réponse API reçue :", data); // Vérifier si la requête est bien envoyée
            removeChildrenExceptFirst(suggestionsDiv);
            data.forEach((suggestion) => {
                const addressParts = suggestion.display_name.split(',');
                const country = addressParts[addressParts.length - 1]?.trim();
                if (country === "France") {
                    const shortAddress = createShortddress(addressParts);
                    const suggestedAddress = createAddressSuggestion(shortAddress);
                    setTimeout(() => {
                        document.querySelectorAll(".suggestion").forEach(el => {
                            el.style.display = "none"; // Masquer temporairement
                            el.offsetHeight; // Force un reflow
                            el.style.display = "flex"; // Réappliquer le style
                        });
                        console.log("✅ Styles `.suggestion` recalculés !");
                    }, 50);
                    
                    
                    suggestionsDiv.appendChild(suggestedAddress);
                }
            });
        })
        .catch(error => console.error('Erreur API:', error));
    }
});

const selectedAddress = localStorage.getItem('selectedDepartureAddress');
if (selectedAddress) {
    document.getElementById('address').value = selectedAddress;
}


// function generateRandomString() {
//     // Définir l'ensemble des caractères possibles (lettres et chiffres)
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

//     // Générer une longueur aléatoire entre 10 et 15
//     const length = Math.floor(Math.random() * 6) + 10;

//     // Créer une chaîne de caractères aléatoire
//     let randomString = '';
//     for (let i = 0; i < length; i++) {
//         // Sélectionner un caractère aléatoire
//         const randomIndex = Math.floor(Math.random() * characters.length);
//         randomString += characters[randomIndex];
//     }

//     randomString += '@gmail.com'; // Ajouter une mention pour OpenStreetMap

//     return randomString;
// }
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
    // console.log("Classe `.suggestion` ajoutée ?", suggestion.classList);
    // console.log("🔹 Élément `.suggestion` ajouté :", suggestion);

    // Crée un conteneur pour le texte de la suggestion
    const textContainer = document.createElement('div');
    textContainer.classList.add('text-container'); // Classe pour styliser le texte
    // console.log("🔹 Classe `.text-container` ajoutée ?", textContainer.classList);
    // console.log("🔹 Élément `.text-container` ajouté :", textContainer);    

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
            localStorage.setItem('selectedDepartureAddress', address);
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
                        localStorage.setItem('selectedDepartureAddress', shortAddress);
                        document.getElementById('address').value = shortAddress;
                    })
                    .catch(error => console.error('Erreur API:', error));
            });
        }
        // alert('Adresse enregistrée dans localStorage : ' + localStorage.getItem('selectedDepartureAddress'));
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





