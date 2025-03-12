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

    document.querySelectorAll('.responsive-img').forEach(img => {
        img.classList.add('hidden');
        img.classList.remove('visible');
    });

    // document.querySelector('.img-mobile').setAttribute("src", `${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_768.jpg`);
    // document.querySelector('.img-mobile').setAttribute("srcset",
    //                            `${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_320.jpg 320w,
    //                             ${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_375.jpg 375w,
    //                             ${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_425.jpg 425w,
    //                             ${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_768.jpg 768w`
    //                         );
    // document.querySelector('.img-tablet').setAttribute("src", `${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md.jpg`);
    // document.querySelector('.img-tablet').setAttribute("srcset", 
    //                             `${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md_1024.jpg 1024w,
    //                             ${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md_1600.jpg 1600w,
    //                             ${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md.jpg 2280w`
    //                         );
    // document.querySelector('.img-tablet').setAttribute("src", `${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes.jpg`);
    // document.querySelector('.img-tablet').setAttribute("srcset", 
    //                             `${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_1024.jpg 1024w,
    //                             ${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_1440.jpg 1440w,
    //                             ${prefix}/public/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes.jpg 5472w`
    //                         );
                                                                                      
    let selectedImage = null;
    for (let rule of rules) {
        if (rule.condition()) {
            selectedImage = document.querySelector(`.${rule.className}`);
            break;
        }
    }

    if (selectedImage) {
        selectedImage.classList.add('visible');
        selectedImage.classList.remove('hidden');
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

export async function generatePageSnapshot(url, scriptToExecute) {
    console.log(`📸 Génération et stabilisation de la page en arrière-plan : ${url}`);

    // ✅ Créer un `iframe` invisible pour charger la page
    let iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.visibility = "hidden";
    iframe.style.width = "0";
    iframe.style.height = "0";
    document.body.appendChild(iframe);

    return new Promise((resolve, reject) => {
        iframe.onload = async () => {
            try {
                let doc = iframe.contentDocument || iframe.contentWindow.document;

                // ✅ Attendre que tous les styles soient chargés
                let stylesheetsLoaded = new Promise((res) => {
                    let interval = setInterval(() => {
                        let stylesLoaded = Array.from(doc.styleSheets).every(sheet => sheet.href);
                        if (stylesLoaded) {
                            clearInterval(interval);
                            res();
                        }
                    }, 50);
                });

                await stylesheetsLoaded;
                console.log("🎨 Tous les CSS sont chargés pour la nouvelle page.");

                // ✅ Exécuter le script AVANT la capture du contenu
                if (scriptToExecute) {
                    console.log(`🚀 Exécution du script : ${scriptToExecute}`);
                    await importDynamicScript(scriptToExecute);
                }

                // ✅ Capturer le contenu de la nouvelle page après exécution du JS
                let pageSnapshot = doc.getElementById("page-content").cloneNode(true);

                // 🔹 Appliquer les styles calculés en dur
                pageSnapshot.querySelectorAll("*").forEach(el => {
                    const computedStyles = window.getComputedStyle(el);
                    el.setAttribute("style", computedStyles.cssText);
                });

                // ✅ Stocker la page figée
                localStorage.setItem("pageSnapshot", pageSnapshot.outerHTML);
                console.log("✅ Page de destination enregistrée avec styles et scripts appliqués !");

                document.body.removeChild(iframe);
                resolve(pageSnapshot.outerHTML);
            } catch (error) {
                console.error("❌ Erreur lors de la capture de la page :", error);
                reject(error);
            }
        };

        // ✅ Charger la page cible avec un chemin absolu
        iframe.src = new URL(url, window.location.origin).href;
    });
}

//v0
export function applyStoredStyles(tempContainer, callback, scriptName = null) { 
    console.log("🔄 Récupération de l'état enregistré de la page...");

    const savedState = localStorage.getItem("savedPageState");

    if (!savedState) {
        console.warn("⚠️ Aucun état enregistré trouvé.");
        if (callback) callback(scriptName);
        return;
    }

    // Injecter le HTML enregistré directement dans tempContainer
    tempContainer.innerHTML = savedState;
    console.log("📌 tempContainer est maintenant rempli avec le contenu enregistré");

    // ✅ Réappliquer les styles dynamiques après le chargement du snapshot
    setTimeout(() => {
        console.log("🎨 Réapplication des styles dynamiques après transition...");
        tempContainer.querySelectorAll("*").forEach(el => {
            applyDynamicStyles(el);
        });
        console.log("✅ Styles dynamiques réappliqués !");
        
        if (callback) callback(scriptName);
    }, 100);
}


// Fonction pour sauvegarder l'état de la page
export function saveCurrentPageState() {
    console.log("📄 Enregistrement de l'état final de la page...");

    // Cloner le contenu de #page-content
    let pageContentClone = document.getElementById("page-content").cloneNode(true);

    // Enregistrer tous les styles inline des éléments
    pageContentClone.querySelectorAll("*").forEach(el => {
        const computedStyles = window.getComputedStyle(el);
        el.setAttribute("style", computedStyles.cssText);
    });

    // Sauvegarder le HTML transformé
    localStorage.setItem("savedPageState", pageContentClone.outerHTML);
    console.log("✅ État de la page enregistré !");
}