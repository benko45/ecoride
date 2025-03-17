import { applyTheme } from './apply-theme.js';
import { createShortddress, createAddressSuggestion, removeChildrenExceptFirst, applyDynamicStyles, useCurrentLocationOptionText  } from './functions.js';

export function attachClickEventToLocationButton() {
    console.log("🔄 Réattachement de l'événement 'click' sur 'Utiliser votre position'...");

    const inputField = document.getElementById('address');

    if (!inputField) {
        console.warn("Champ d'adresse introuvable !");
    }
    
    const userAgent = 'benoit.vicente@hotmail.fr';
    
    // console.log("Ajout de l'événement `input` au champ d'adresse...");
    inputField.addEventListener('input', function () {
        // console.log("L'utilisateur a tapé :", this.value); // Vérifier si l'événement fonctionne
        const query = this.value;
        if (query.length >= 10) {
            console.log("📡 Envoi de la requête API avec :", query);
            // 🛑 Indiquer qu'une requête est encours pour bloquer une suppression immédiate
            window.isFetchingSuggestions = true;
            removeChildrenExceptFirst(suggestionsDiv);  
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`, {
                method: 'GET',
                headers: { 'User-Agent': userAgent }
            })
            .then(response => response.json())
            .then(data => {
                // console.log("Réponse API reçue :", data); // Vérifier si la requête est bien envoyée
                
                data.forEach((suggestion) => {
                    const addressParts = suggestion.display_name.split(',');
                    const country = addressParts[addressParts.length - 1]?.trim();
                    if (country === "France") {
                        const shortAddress = createShortddress(addressParts);
                        const suggestedAddress = createAddressSuggestion(shortAddress, suggestionsDiv);
                        console.log("🟢 Élément ajouté au DOM :", suggestedAddress);
                        suggestionsDiv.appendChild(suggestedAddress);
                        // console.log("📌 Contenu actuel de #suggestions :", document.getElementById("suggestions").innerHTML);
                    }
                });
                window.isFetchingSuggestions = false;
            })
            .catch(error => {
                console.error('Erreur API:', error)
                window.isFetchingSuggestions = false;
            });
        }
    });

    console.log("✅ Événement 'click' ajouté à 'Utiliser votre position' !");
}

/**
 * Modifie dynamiquement le placeholder d'un champ input.
 * @param {string} inputSelector - Sélecteur CSS de l'input
 * @param {string} newPlaceholder - Nouveau texte du placeholder
 */
function updatePlaceholder(inputSelector, newPlaceholder) {
    const inputElement = document.querySelector(inputSelector);
    
    if (!inputElement) {
        console.warn(`⚠️ Input introuvable pour le sélecteur : ${inputSelector}`);
        return;
    }

    console.log(`🔄 Changement du placeholder de '${inputSelector}' en : "${newPlaceholder}"`);
    inputElement.placeholder = newPlaceholder;
}

if(!localStorage.getItem('choosing-address-occurence')) {
    localStorage.setItem('choosing-address-occurence', 1);
} else {
    localStorage.setItem('choosing-address-occurence', parseInt(localStorage.getItem('choosing-address-occurence')) + 1);
}

window.addEventListener("storage", (event) => {
    if (event.key === 'testingChoosingAddress') {
        console.log("🔄 Événement 'storage' détecté :", event.newValue);
    }
});
/******************************************************/
/******************************************************/
applyTheme();
/******************************************************/
/******************************************************/

updatePlaceholder('#address', localStorage.getItem('selectedDepartureAddress') || 'Utiliser votre position');


console.log("choosing-address.js est exécuté... sur : ", localStorage.getItem('choosing-address-occurence'), "occurence(s)");
console.log("📌 choosing-address.js exécuté sur :", window.location.pathname);


// // console.log("✅ Élément `.suggestions` ajouté :", document.querySelector('#suggestions'));
const suggestionsDiv = document.getElementById('suggestions');
// if (suggestionsDiv) {
//     const observer = new MutationObserver((mutations) => {
//         mutations.forEach(mutation => {
//             if (mutation.type === 'childList') {
//                 console.log("🔍 Changement détecté dans #suggestions :", mutation);
//                 console.log("📌 Nombre d'éléments .suggestion :", document.getElementsByClassName("suggestion").length);
                
//                 if (mutation.addedNodes.length > 0) {
//                     console.log("🟢 Élément(s) ajouté(s) :", mutation.addedNodes);
//                 }

//                 if (mutation.removedNodes.length > 0) {
//                     console.log("❌ Élément(s) supprimé(s) :", mutation.removedNodes);
//                 }
//             }
//         });
//     });

//     // Observer les changements dans les enfants de #suggestions
//     observer.observe(suggestionsDiv, { childList: true });

//     console.log("👀 MutationObserver activé sur #suggestions !");
// } else {
//     console.error("❌ ERREUR : #suggestions introuvable dans le DOM !");
// }
suggestionsDiv.classList.add('suggestions'); // Classe pour styliser les éléments
if(document.getElementsByClassName('suggestion').length === 0) {
    const useCurrentLocationOption = createAddressSuggestion(useCurrentLocationOptionText);
    suggestionsDiv.appendChild(useCurrentLocationOption);
}
//écoute la saisie sur la zone recherche-départ pour faire des propositions d'adresses
attachClickEventToLocationButton();

const selectedAddress = localStorage.getItem('selectedDepartureAddress');
if (selectedAddress) {
    document.getElementById('address').value = selectedAddress;
}

