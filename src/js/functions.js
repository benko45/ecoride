// Configuration : Règles pour sélectionner l'image
const rules = [
    {
        className: 'img-mobile',
        condition: () => window.innerWidth < 768
    },
    {
        className: 'img-tablet',
        condition: () => window.innerWidth <= 1600 
    },
    {
        className: 'img-desktop',
        condition: () => window.innerWidth > 1600 
    }
];

export const selectImage = () => {
    console.log("🖼️ selectImage() appelée !");
    
    // Définition du préfixe en fonction de l'environnement (GitHub Pages ou local)
    const prefix = window.location.hostname === "benko45.github.io" ? "/ecoride" : "";

    // Cacher toutes les images et supprimer `src` et `srcset`
    document.querySelectorAll('.responsive-img').forEach(img => {
        img.classList.add('hidden');
        img.classList.remove('visible');
        img.removeAttribute("src");
        img.removeAttribute("srcset");
    });

    let selectedImage = null;
    for (let rule of rules) {
        if (rule.condition()) {
            selectedImage = document.querySelector(`.${rule.className}`);
            break;
        }
    }

    if (selectedImage) {
        // ✅ Marquer l’image comme visible sans la charger immédiatement
        selectedImage.classList.add('visible');
        selectedImage.classList.remove('hidden');

        setTimeout(() => {
            // ✅ Récupérer les chemins d’image depuis `data-src` et `data-srcset`
            let newSrc = prefix +selectedImage.getAttribute("data-src");
            let newSrcset = prefix + selectedImage.getAttribute("data-srcset");

            console.log(`🎨 Image sélectionnée AVANT correction : ${prefix}${newSrc}`);

            // ✅ Application du préfixe dynamique
            if (newSrc) {
                newSrc = prefix + newSrc;
            }
            if (newSrcset ) {
                newSrcset = prefix + newSrcset;
            }

            // ✅ Vérifier si l'image est déjà bien appliquée avant modification
            if (selectedImage.getAttribute("src") !== newSrc) {
                selectedImage.onload = () => {
                    console.log(`✅ Image chargée avec succès : ${selectedImage.getAttribute("src")}`);
                };
                selectedImage.setAttribute("src", newSrc);
            }

            if (selectedImage.getAttribute("srcset") !== newSrcset) {
                selectedImage.setAttribute("srcset", newSrcset);
            }

            console.log(`✅ Image appliquée : ${selectedImage.getAttribute("src")}`);
        }, 50); // Légère attente pour garantir que le DOM est bien mis à jour
    } else {
        console.log("❌ Aucune image sélectionnée !");
    }
};



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
        // 🔹 Détermine quel champ enregistrer en fonction de la page actuelle
        // console.log("🔄 window.location.pathname :", window.location.pathname);
        let storageKey = window.location.pathname.includes("choosing-address.html") 
        ? "selectedDepartureAddress" 
        : "selectedArrivalAddress";
        // console.log("🔄 storageKey :", storageKey);
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

/**********************************************************/
/*  Stockage des styles CSS de choosing-address.scss      */
/*                     et choosing-arrival-address.scss   */
/**********************************************************/
export function storeStyles() {
    const stylesToStore = {};

    document.querySelectorAll("[data-dynamic-style]").forEach(el => {
        const computedStyles = window.getComputedStyle(el);
        const elementStyles = {};

        // 🔹 Sauvegarde des styles nécessaires
        ["top", "left", "right", "bottom", "width", "height", "display", "position", "opacity", "z-index"].forEach(property => {
            elementStyles[property] = computedStyles.getPropertyValue(property);
        });

        // 🔹 Sauvegarde les classes associées à l'élément
        elementStyles["classList"] = Array.from(el.classList);

        // 🔹 Associe les styles au sélecteur de l'élément
        stylesToStore[el.dataset.dynamicStyle] = elementStyles;
    });

    // 📦 Stocke l'objet complet dans localStorage
    localStorage.setItem("styles", JSON.stringify(stylesToStore));
    // console.log("✅ Styles sauvegardés :", stylesToStore);
}

export function applyStoredStyles() { 
    const storedStyles = localStorage.getItem("styles");

    // if (!storedStyles) {
    //     console.warn("⚠️ Aucun style enregistré dans localStorage.");
    //     return;
    // }

    const stylesObject = JSON.parse(storedStyles);
    // console.log("🔄 Application des styles enregistrés...");

    document.querySelectorAll("[data-dynamic-style]").forEach(el => {
        
        const savedStyles = stylesObject[el.dataset.dynamicStyle];

        if (savedStyles) {
            // 🔹 Applique les styles enregistrés
            Object.entries(savedStyles).forEach(([property, value]) => {
                if (property !== "classList") {
                    el.style.setProperty(property, value);
                }
            });

            // 🔹 Réapplique les classes CSS enregistrées
            el.className = savedStyles["classList"].join(" ");

            // console.log(`✅ Styles appliqués à ${el.dataset.dynamicStyle}`);
        }
    });
    // ✅ Forçage du recalcul des images et exécution de `selectImage()`
    // console.log("🔄 Forçage de l'affichage de l'image correcte...");

    // 🔹 Vérifier si on est sur index.html avant d'exécuter selectImage()
    if (window.location.pathname.includes("index.html")) {
        if (typeof selectImage === "function") {
            selectImage();
            // console.log("✅ `selectImage()` exécuté !");
        } else {
            // console.warn("⚠️ `selectImage()` n'est pas défini après la transition !");
        }
    } else {
        // console.log("⏭️ `selectImage()` ignoré car nous ne sommes pas sur index.html.");
}

    
    // 🔄 Forcer un reflow pour éviter les problèmes d'affichage
    // document.body.offsetHeight;
}
export function restoreDepartureAddress() {
    const savedAddress = localStorage.getItem("selectedDepartureAddress");

    if (savedAddress) {
        // console.log("🔄 Récupération de l'adresse enregistrée :", savedAddress);
        
        const departureField = document.getElementById("selected-departure-address");
        if (departureField) {
            departureField.textContent = savedAddress;
            // console.log("✅ Adresse affichée dans index.html :", savedAddress);
        } else {
            // console.warn("⚠️ Élément `#selected-departure-address` introuvable !");
        }
    } else {
        // console.warn("⚠️ Aucune adresse enregistrée dans localStorage !");
    }
}
export function restoreArrivalAddress() {
    const savedAddress = localStorage.getItem("selectedArrivalAddress");

    if (savedAddress) {
        // console.log("🔄 Récupération de l'adresse enregistrée :", savedAddress);
        
        const departureField = document.getElementById("selected-arrival-address");
        if (departureField) {
            departureField.textContent = savedAddress;
            // console.log("✅ Adresse affichée dans index.html :", savedAddress);
        } else {
            // console.warn("⚠️ Élément `#selected-departure-address` introuvable !");
        }
    } else {
        // console.warn("⚠️ Aucune adresse enregistrée dans localStorage !");
    }
}