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
    const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";

    const imageSources = [
        {
            class: "img-mobile",
            src: "/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_768.jpg",
            srcset: `
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_320.jpg 320w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_375.jpg 375w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_425.jpg 425w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_768.jpg 768w`,
            sizes: "(max-width: 767px) 100vw",
            alt: "Image mobile",
            minWidth: 0,
            maxWidth: 767
        },
        {
            class: "img-tablet",
            src: "/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md.jpg",
            srcset: `
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md_1024.jpg 1024w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md_1600.jpg 1600w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md.jpg 2280w`,
            sizes: "(min-width: 768px) and (max-width: 1599px) 50vw",
            alt: "Image tablette",
            minWidth: 768,
            maxWidth: 1599
        },
        {
            class: "img-desktop",
            src: "/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes.jpg",
            srcset: `
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_1024.jpg 1024w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_1440.jpg 1440w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes.jpg 5472w`,
            sizes: "(min-width: 1600px) 33vw",
            alt: "Image grand écran",
            minWidth: 1600,
            maxWidth: Infinity
        }
    ];

    // Sélection du conteneur d'images
    const imageContainer = document.querySelector(".image-container");

    if (!imageContainer) {
        console.warn("⚠️ Aucun conteneur d'images trouvé !");
        return;
    }

    // Nettoyer le conteneur avant d'insérer de nouvelles images
    imageContainer.innerHTML = "";

    // Déterminer la largeur actuelle de l'écran
    const screenWidth = window.innerWidth;

    imageSources.forEach(({ class: imgClass, src, srcset, sizes, alt, minWidth, maxWidth }) => {
        const img = document.createElement("img");
        img.classList.add("responsive-img", imgClass);
        console.log("🖼️ Image insérée :",  `${prefix}${src}`);
        img.src = `${prefix}${src}`;
        img.srcset = srcset.split("\n").map(s => `${prefix}${s.trim()}`).join("\n");
        img.sizes = sizes;
        img.alt = alt;

        // Masquer les images qui ne correspondent pas à la taille d'écran
        if (screenWidth >= minWidth && screenWidth <= maxWidth) {
            img.classList.remove("hidden");
            img.classList.add("visible");
        } else {
            img.classList.remove("visible");
            img.classList.add("hidden");
        }

        imageContainer.appendChild(img);
    });

    console.log("✅ Images insérées dynamiquement avec les bons chemins.");
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