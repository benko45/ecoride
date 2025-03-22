"use strict";

import { applyTheme } from './apply-theme.js';

export function initChoosingArrivalAddress() {
    // console.log("✅ `initChoosingArrivalAddress()` exécuté !");
    
    const inputField = document.getElementById('address');

    // if (!inputField) {
    //     console.error("❌ ERREUR : #address introuvable !");
    // } else {
    //     console.log("✅ #address trouvé !");
    // }

        /******************************************************/
    /******************************************************/
    applyTheme();
    /******************************************************/
    /******************************************************/

    //écoute la saisiesur la zone recherche-départ pour faire des propositions d'adresses

    const suggestionsDiv = document.getElementById('suggestions');
    // if (!suggestionsDiv) {
    //     console.error("❌ ERREUR : #suggestions introuvable !");
    // } else {
    //     console.log("✅ #suggestions trouvé !");
    // }
    const useCurrentLocationOptionText = 'Utiliser votre position'
    const useCurrentLocationOption = createAddressSuggestion(useCurrentLocationOptionText);
    useCurrentLocationOption.id = 'use-location';
    suggestionsDiv.appendChild(useCurrentLocationOption); // Ajoute l'option "utiliser votre position"

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
                        // console.log(addressParts);
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

    const selectedAddress = localStorage.getItem('selectedArrivalAddress');

    document.getElementById('address').value = selectedAddress
}