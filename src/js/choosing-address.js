import { applyTheme } from './apply-theme.js';
import { createShortddress, createAddressSuggestion, removeChildrenExceptFirst, applyDynamicStyles, useCurrentLocationOptionText  } from './functions.js';

export function attachClickEventToLocationButton() {
    console.log("🔄 Réattachement de l'événement 'click' sur 'Utiliser votre position'...");

    const useCurrentLocationElement = document.querySelector(".suggestion");
    if (!useCurrentLocationElement) {
        console.warn("⚠️ Impossible de réattacher l'événement, élément introuvable !");
        return;
    }

    useCurrentLocationElement.addEventListener("click", () => {
        console.log("🟢 Clic détecté sur 'Utiliser votre position' !");
        
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            console.log(`📍 Position détectée : ${latitude}, ${longitude}`);

            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
                method: 'GET',
                headers: { 'User-Agent': 'benoit.vicente@hotmail.fr' }
            })
            .then(response => response.json())
            .then(data => {
                const shortAddress = createShortddress(data.display_name.split(','));
                console.log(`📍 Adresse trouvée : ${shortAddress}`);
                localStorage.setItem("selectedDepartureAddress", shortAddress);
                document.getElementById('address').value = shortAddress;
            })
            .catch(error => console.error('❌ Erreur API:', error));
        }, (error) => {
            console.error("❌ Erreur de géolocalisation :", error);
        });
    });

    console.log("✅ Événement 'click' ajouté à 'Utiliser votre position' !");
}

/******************************************************/
/******************************************************/
applyTheme();
/******************************************************/
/******************************************************/

//écoute la saisie sur la zone recherche-départ pour faire des propositions d'adresses

console.log("choosing-address.js est exécuté...");
console.log("📌 choosing-address.js exécuté sur :", window.location.pathname, "Chargé par :", new Error().stack);


const inputField = document.getElementById('address');

if (!inputField) {
    console.warn("Champ d'adresse introuvable !");
}

// // console.log("✅ Élément `.suggestions` ajouté :", document.querySelector('#suggestions'));
const suggestionsDiv = document.getElementById('suggestions');
suggestionsDiv.classList.add('suggestions'); // Classe pour styliser les éléments

if(document.getElementsByClassName('suggestion').length === 0) {
    const useCurrentLocationOption = createAddressSuggestion(useCurrentLocationOptionText);
    suggestionsDiv.appendChild(useCurrentLocationOption);
}


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

