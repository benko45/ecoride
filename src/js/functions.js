export function createShortddress(addressParts) {
    const number = addressParts[0]?.trim() || ''; // Numéro
    const street = addressParts[1]?.trim() || ''; // Voie
    const city = addressParts[addressParts.length - 6]?.trim() || ''; // Ville
    const postalCode = addressParts[addressParts.length - 2]?.trim() || ''; // Code postal
    const country = addressParts[addressParts.length - 1]?.trim() || ''; // Pays (France)

    // Construire l'adresse courte : numéro, voie, quartier, code postal, pays
    return `${number} ${street}, ${postalCode}, ${city}, ${country}`;
}

export const useCurrentLocationOptionText = 'Utiliser votre position';
//Fonction pour créer les suggestions d'adresse
export function createAddressSuggestion(address, parentElement) {
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
export function removeChildrenExceptFirst(parentElement) {
    // Vérifie si l'élément parent existe et a plus d'un enfant
    if (parentElement && parentElement.children.length > 1) {
        // Boucle à l'envers sur tous les enfants, en commençant par le dernier
        for (let i = parentElement.children.length - 1; i > 0; i--) {
            parentElement.removeChild(parentElement.children[i]);
        }
    }
}

export function applyDynamicStyles(HTMLElement){
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
        HTMLElement.style.margin = '0 auto'; // Centrer les suggestions dans leur conteneur
        HTMLElement.style.padding = '5px';
        HTMLElement.style.borderRadius = '5px'; // Arrondit les bords
        HTMLElement.style.cursor = 'pointer'; // Change le curseur en main lors du survol
        HTMLElement.style.border = '1px solid black';
        HTMLElement.classList.add('background-secondary-3'); // Classe pour styliser les éléments
    }
    if(HTMLElement.classList.contains('text-container')){
        HTMLElement.style.fontSize = 'medium';
        HTMLElement.style.color = 'var(--custom-primary)';
        HTMLElement.style.width = '80%';
        HTMLElement.style.flex = '1';  // Utilise toute la largeur restante
    }
}