"use strict";

import { applyTheme } from './apply-theme.js';
import { createShortddress, createAddressSuggestion, removeChildrenExceptFirst, applyDynamicStyles, useCurrentLocationOptionText  } from './functions.js';
/******************************************************/
/******************************************************/
applyTheme();
/******************************************************/
/******************************************************/

//écoute la saisie sur la zone recherche-départ pour faire des propositions d'adresses

// console.log("choosing-address.js est exécuté...");
const inputField = document.getElementById('address');

if (!inputField) {
    console.warn("Champ d'adresse introuvable !");
}

// // console.log("✅ Élément `.suggestions` ajouté :", document.querySelector('#suggestions'));
const suggestionsDiv = document.getElementById('suggestions');
suggestionsDiv.classList.add('suggestions'); // Classe pour styliser les éléments
applyDynamicStyles(suggestionsDiv);

const useCurrentLocationOption = createAddressSuggestion(useCurrentLocationOptionText);
suggestionsDiv.appendChild(useCurrentLocationOption);

const userAgent = 'benoit.vicente@hotmail.fr';

// console.log("Ajout de l'événement `input` au champ d'adresse...");
inputField.addEventListener('input', function () {
    // console.log("L'utilisateur a tapé :", this.value); // Vérifier si l'événement fonctionne

    const query = this.value;
    

    if (query.length > 10) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`, {
            method: 'GET',
            headers: { 'User-Agent': userAgent }
        })
        .then(response => response.json())
        .then(data => {
            // console.log("Réponse API reçue :", data); // Vérifier si la requête est bien envoyée
            removeChildrenExceptFirst(suggestionsDiv);
            data.forEach((suggestion) => {
                const addressParts = suggestion.display_name.split(',');
                const country = addressParts[addressParts.length - 1]?.trim();
                if (country === "France") {
                    const shortAddress = createShortddress(addressParts);
                    const suggestedAddress = createAddressSuggestion(shortAddress, suggestionsDiv);
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



