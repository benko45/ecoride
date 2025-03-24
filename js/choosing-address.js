import { applyTheme } from './apply-theme.js';


function attachInputEvent(suggestionsDiv, storageKey) {
    console.log("🔄 Réattachement de l'événement 'click' sur 'Utiliser votre position'...");

    const inputField = document.getElementById('address');

    if (!inputField) {
        console.warn("Champ d'adresse introuvable !");
    }
    
    const userAgent = 'benoit.vicente@hotmail.fr';
    
    // console.log("Ajout de l'événement `input` au champ d'adresse...");
    inputField.addEventListener('input', function () {
        console.log("L'utilisateur a tapé :", this.value); // Vérifier si l'événement fonctionne
        const query = this.value;
        if (query.length >= 10) {
            console.log("📡 Envoi de la requête API avec :", query);
            // 🛑 Indiquer qu'une requête est encours pour bloquer une suppression immédiate
            // window.isFetchingSuggestions = true;
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
                        const suggestedAddress = createAddressSuggestion(shortAddress, suggestionsDiv, storageKey);
                        // console.log("🟢 Élément ajouté au DOM :", suggestedAddress);
                        suggestionsDiv.appendChild(suggestedAddress);
                        // console.log("📌 Contenu actuel de #suggestions :", document.getElementById("suggestions").innerHTML);
                    }
                });
                // window.isFetchingSuggestions = false;
            })
            .catch(error => {
                console.error('Erreur API:', error)
                // window.isFetchingSuggestions = false;
            });
        }
    });

    console.log("✅ Événement 'click' ajouté à 'Utiliser votre position' !");
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

const useCurrentLocationOptionText = 'Utiliser votre position';
//Fonction pour créer les suggestions d'adresse
function createAddressSuggestion(address, parentElement, storageKey) {
    // Crée un div pour chaque suggestion
    const suggestion = document.createElement('div');
    suggestion.classList.add('suggestion');
    applyDynamicStyles(suggestion);
    // Crée un conteneur pour le texte de la suggestion
    const textContainer = document.createElement('div');
    textContainer.classList.add('text-container'); // Classe pour styliser le texte 
    applyDynamicStyles(textContainer);
    textContainer.textContent = address; // Texte de la suggestion (adresse courte)
    if(address === useCurrentLocationOptionText) {
        suggestion.style.marginTop = '10px';
    }

    // Ajoute un événement de clic pour sélectionner la suggestion
    suggestion.addEventListener('click', () => {
        if(address !== useCurrentLocationOptionText) {
            document.getElementById('address').value = address; // Remplir le champ avec l'adresse courte
        }
        removeChildrenExceptFirst(parentElement)
        const userAgent = 'benoit.vicente@hotmail.fr';

        if(address !== useCurrentLocationOptionText) {
            localStorage.setItem(storageKey, address);
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
                        localStorage.setItem(storageKey, shortAddress);
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

function initSuggestions(storageKey) {
    const useCurrentLocationOptionText = 'Utiliser votre position'
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.classList.add('suggestions');
    if(window.location.pathname.includes('index') && document.getElementsByClassName('suggestion').length === 0) {
        const useCurrentLocationOption = createAddressSuggestion(useCurrentLocationOptionText, null, storageKey);
        suggestionsDiv.appendChild(useCurrentLocationOption);
    }
    if(window.location.pathname.includes('choosing-address') || window.location.pathname.includes('choosing-arrival-address')) {
        const suggestions = document.getElementsByClassName('suggestion')
        if(suggestions.length !== 0) {
            for (let suggestion of suggestions) {
                suggestion.remove();
            }
        }
        const useCurrentLocationOption = createAddressSuggestion(useCurrentLocationOptionText, null, storageKey);
        suggestionsDiv.appendChild(useCurrentLocationOption);
    }

    return suggestionsDiv;
}

/**
 * Supprime tous les enfants d'un élément, sauf le premier
 * @param {HTMLElement} parentElement - L'élément parent
 */
function removeChildrenExceptFirst(parentElement) {
    // console.log("🛑 Suppression déclenchée dans :", parentElement);
    
    if (!parentElement) return;
    const suggestions = parentElement.querySelectorAll(".suggestion");
    // console.log("📌 État actuel des suggestions avant suppression :", suggestions.length, suggestions);

    if (suggestions.length > 1) {
        console.log("🚨 Suppression des suggestions obsolètes...");
        while (parentElement.children.length > 1) {
            // console.log("❌ Suppression de :", parentElement.children[1]);
            parentElement.removeChild(parentElement.children[1]);
        }
    }

    console.log("✅ Nombre d'enfants après suppression :", parentElement.children.length);
}

export function applyDynamicStyles(HTMLElement){
    // console.log(`🎨 Application des styles dynamiques sur : ${HTMLElement.className}`);
    if(HTMLElement.classList.contains('form-container')){
        HTMLElement.style.width = '80%';
    }
    if(HTMLElement.classList.contains('suggestions')){
        HTMLElement.style.display = 'flex';
        HTMLElement.style.flexDirection = 'column';
        HTMLElement.style.justifyContent = 'center';
        HTMLElement.style.alignItems = 'center';
        HTMLElement.style.gap = '10px';
    }
    if(HTMLElement.classList.contains('suggestion')){
        HTMLElement.style.display = 'flex';
        HTMLElement.style.flexDirection = 'row';
        HTMLElement.style.alignItems = 'center';
        HTMLElement.style.width = '80%';
        HTMLElement.style.margin = '20px auto'; // Centrer les suggestions dans leur conteneur
        HTMLElement.style.padding = '5px';
        HTMLElement.style.borderRadius = '5px'; // Arrondit les bords
        HTMLElement.style.cursor = 'pointer'; // Change le curseur en main lors du survol
        HTMLElement.classList.add('background-secondary-3'); // Classe pour styliser les éléments
    }
    if(HTMLElement.classList.contains('text-container')){
        HTMLElement.style.fontSize = 'medium';
        HTMLElement.style.color = 'var(--custom-primary)';
        HTMLElement.style.width = '80%';
        HTMLElement.style.flex = '1';  // Utilise toute la largeur restante
    }
    if(HTMLElement.classList.contains('datepicker')){
        HTMLElement.style.padding = '15px 0 0 30px';
    }
}

/**
 * Modifie dynamiquement le placeholder d'un champ input.
 * @param {string} inputSelector - Sélecteur CSS de l'input
 * @param {string} newPlaceholder - Nouveau texte du placeholder
 */
function updatePlaceholder(storageKey) {
    const inputElement = document.querySelector('#address');
    
    if (!inputElement) {
        console.warn(`⚠️ Input introuvable pour le sélecteur : ${inputSelector}`);
        return;
    }
    const selectedAddress =
        localStorage.getItem(storageKey) === "Arrivée" || localStorage.getItem(storageKey) === "Départ" 
            ? "Rue blanche ou Café de la gare" : localStorage.getItem(storageKey);
    inputElement.placeholder = selectedAddress;
}

export function initChoosingAddress(page) {
    // console.log("📌 ", page, ".js exécuté sur :", window.location.pathname);
    console.log("📌 initChoosingAddress — reçu page:", page);

    /* adaptation du chemin pour les pages GitHub */
    const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";
    /* spécification selon la page /choosing-address.html ou /choosing-arrival-address.html */ 
    const location = page.includes("choosing-address")
        ? "/choosing-address.html"
        : "/choosing-arrival-address.html";
    const storageKey = page.includes("choosing-address") 
        ? "selectedDepartureAddress" 
        : "selectedArrivalAddress";
    console.log("🔑 Clé de stockage :", storageKey);

    applyTheme();
    updatePlaceholder(storageKey);
    
    attachInputEvent(initSuggestions(storageKey), storageKey); 
    // document.querySelectorAll('.back-link')?.forEach(link => {
    //     link.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         history.pushState({}, "", `${prefix}${location}`);
    //     });
    // });
    document.addEventListener("click", (event) => {
        console.log("🟢 ", page, ".js Clic détecté ! Élément :", event.target);
    });
}    
