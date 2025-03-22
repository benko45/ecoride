import { positionDropdownMenu, updateBouncingArrows } from "./index.js";
import { selectImage } from "./functions.js";

document.addEventListener("DOMContentLoaded", function () {

    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("a");
        if (target) {
            event.preventDefault();
            const urlPathname = new URL(target.href).pathname.split("/").pop();
            loadPage(urlPathname);
        }
    });
    
    document.body.addEventListener("click", function (event) {
        let el = event.target;
        let shouldNavigate = true;
        
        while (el && el !== document.body) {
            if (el.id === "bouncing-arrows") {
                // updateBouncingArrows();
                shouldNavigate = false; // ne pas naviguer
                break;
            }
            if (el.hasAttribute("data-navigate")) {
                break; // on a trouvé un élément navigable
            }
            el = el.parentElement;
        }
        
        if (shouldNavigate && el && el.hasAttribute("data-navigate")) {
            event.preventDefault();
            loadPage(el.getAttribute("data-navigate"));
        }
        
    });

    // Gestion des retours arrière
    window.addEventListener("popstate", function () {
        console.log("↩️ Retour en arrière détecté !");
        loadPage(location.href, true);
    });
});

async function loadPage(url, fromBackButton = false) {

    console.log(`🚀 loadPage() appelé pour : ${url}`);
    const addressPage = url.includes("choosing-address")
            ? "choosing-address"
            : "choosing-arrival-address";

    if (!url) {
        console.warn("⚠️ Aucune URL de retour trouvée, retour à la page d'accueil.");
        url = "/";
    }
    const pageContent = document.getElementById("page-content");
    try {
        let { snapshot, scripts, styles } = await generatePageSnapshot(url);

        if(url.includes(addressPage)) importScript("choosing-address", "initChoosingAddress", addressPage);
        let tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.top = "0";
        tempContainer.style.left = "100%";
        tempContainer.style.width = "100%";
        tempContainer.style.height = "100%";
        tempContainer.style.zIndex = "100";
        tempContainer.style.backgroundColor = "var(--custom-light)";
        tempContainer.innerHTML = snapshot;
        document.body.appendChild(tempContainer);
        await loadCSSForPage(styles);
        if(url.includes("index.html")) {
            selectImage();
            positionDropdownMenu();
            updateBouncingArrows();
        }
        gsap.to(tempContainer, {
            left: "0%",
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: async () => {
                pageContent.innerHTML = tempContainer.innerHTML;
                tempContainer.remove();
                if (!fromBackButton) {
                    window.history.pushState({}, "", url);
                }
                console.log(`✅ Transition terminée vers ${url}`);
                // await loadCSSForPage(styles);
                if(url.includes("index")) {
                    cleanCSS(url);
                    requestAnimationFrame(() => {
                        positionDropdownMenu();
                    });
                    updateBouncingArrows();
                }
                if(url.includes(addressPage)) importScript("choosing-address", "initChoosingAddress", addressPage);
            }
        });

    } catch (error) {
        console.error("❌ Erreur lors du chargement de la page :", error);
    }
}

async function generatePageSnapshot(url) {
    console.log(`📸 Génération et stabilisation de la page en arrière-plan : ${url}`);

    try {
        // let response = await fetch(`${url}?_=${Date.now()}`, { cache: "no-store" });
        const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";

        console.log("🔄 generatePageSnapshot() : url = ", url);
        // let response = await fetch(url, { cache: "no-store" });
        let response = await fetch(`${prefix}/${url}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        let htmlText = await response.text();
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlText;

        let pageContentElement = tempDiv.querySelector("#page-content");
        if (!pageContentElement) throw new Error( `❌ #page-content introuvable dans la page chargée !`);

        // 🔹 Correction : extraire uniquement le contenu interne de `#page-content`
        let snapshot = pageContentElement.cloneNode(true);
        snapshot.removeAttribute("id"); // Enlève l'ID pour éviter un conflit lors de l'insertion

        // console.log("✅ Contenu extrait sans doubler #page-content.");

        // 🔹 Mettre à jour le champ `selected-departure-address` dans le snapshot
        if (window.location.pathname.includes("choosing-address") || window.location.pathname.includes("choosing-arrival-address")) {
            updateSelectedAddressInSnapshot(snapshot);
        } else {
            console.log("🔄 updateSelectedAddressInSnapshot() n'a pas été appliquée");
        }

        let scripts = Array.from(tempDiv.querySelectorAll("script"));
        
        scripts = scripts.filter(script => script.src && !script.src.includes("fiveserver.js"));
        // scripts = scripts.filter(s => s.dataset.dynamic === "true"); 
        // 🔹 Modifier les chemins des scripts en fonction de l'environnement
        // const prefix = window.location.hostname === "benko45.github.io/" ? "/ecoride" : "/";
        
        scripts.forEach(script => {
            if(!script.src) return;
            // else {
            //     if(!script.src.includes("https")) {
                const scriptSrc = new URL(script.src);
                const protocol = scriptSrc.protocol;
                const host = scriptSrc.host;
                const pathName = scriptSrc.pathname;
                script.src = `${protocol}//${host}${pathName}`;
                // }
                // console.log(`chemin trouvé : ${script.src}`);
            // }
        });

        let styles = Array.from(tempDiv.querySelectorAll("link[rel='stylesheet']"));
        // console.log("generatePageSnapshot : ", styles.length, " styles trouvés et ", scripts.length, " scripts trouvés.");
        // scripts.forEach(script => console.log("generatePageSnapshot Script trouvé :", script.src || "[inline script]"));
        // styles.forEach(style => console.log("generatePageSnapshot Style trouvé :", style.href));

        return { snapshot: snapshot.innerHTML, scripts, styles };
    } catch (error) {
        console.error("❌ Erreur lors de la capture de la page :", error);
        return { snapshot: "", scripts: [], styles: [] };
    }
}

async function loadCSSForPage(styles) {
    return new Promise((resolve) => {
        let existingStyles = Array.from(document.querySelectorAll("link[rel='stylesheet']")).map(link => link.href);
        let newStyles = [];

        styles.forEach(link => {
            if (!link.href) {
                console.warn("⚠️ Un fichier CSS sans `href` a été ignoré.");
                return;
            }

            let absoluteHref = link.href.startsWith("http") ? link.href : new URL(link.href, window.location.origin).href;

            if (!existingStyles.includes(absoluteHref)) {
                newStyles.push(absoluteHref);
            }
        });

        if (newStyles.length === 0) {
            resolve();
            return;
        }

        let loadedCount = 0;
        newStyles.forEach(href => {
            let newLink = document.createElement("link");
            newLink.rel = "stylesheet";
            newLink.href = href;
            newLink.setAttribute("data-dynamic-style", "true"); // Marqueur pour nettoyage

            newLink.onload = () => {
                loadedCount++;
                if (loadedCount === newStyles.length) {
                    console.log("✅ Tous les styles CSS nécessaires ont été chargés !");
                    resolve();
                }
            };

            newLink.onerror = () => {
                console.error(`❌ Erreur de chargement du fichier CSS : ${href}`);
                loadedCount++;
                if (loadedCount === newStyles.length) resolve();
            };

            document.head.appendChild(newLink);
        });
    });
}

function cleanCSS(url) { 
    fetch(url)
        .then(res => res.text())
        .then(html => {
            // 1. Nettoyer tous les styles existants
            const existingLinks = document.head.querySelectorAll('link[rel="stylesheet"]');
            // 2. Parser le HTML temporairement
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            // 3. Récupérer et convertir tous les nouveaux liens en tableau
            const newLinks = Array.from(tempDiv.querySelectorAll('link[rel="stylesheet"]'));

            // 4. Supprimer les liens obsolètes (présents dans <head> mais pas dans newLinks)
            existingLinks.forEach(link => {
                const isStillNeeded = newLinks.some(newLink => newLink.href === link.href);
                if (!isStillNeeded) {
                    console.log("🗑️ Suppression du lien obsolète :", link);
                    link.remove();
                }
            });
        });
}


function ensureBootstrapIcons() {
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
        console.log("🔄 Rechargement de Bootstrap Icons...");
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
        document.head.appendChild(link);
    } else {
        console.log("✅ Bootstrap Icons déjà chargé.");
    }
}

function cleanOldScripts() {
    Array.from(document.querySelectorAll("script"))
        .filter(script => !script.src.includes('five') && !script.src.includes('https') && !script.src.includes('page-loader'))
        .forEach(script => {
        console.log("🗑️ Suppression de l'ancien script :", script.src || "[inline script]");
        script.remove();
    });
}

function importScript(scriptName, initFunctionName = null, initParam = null) {
    const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";

    console.log(`📦 Import dynamique de ${scriptName}.js...`);

    // Supprime l'ancien script s'il est déjà chargé
    document.querySelector(`script[src*='${scriptName}']`)?.remove();

    import(`${prefix}/js/${scriptName}.js`)
        .then(module => {
            if (initFunctionName && typeof module[initFunctionName] === "function") {
                module[initFunctionName](initParam);
                console.log(`✅ ${initFunctionName}() appelée depuis ${scriptName}.js`);
            } else if (initFunctionName) {
                console.warn(`⚠️ ${initFunctionName}() non trouvée dans ${scriptName}.js`);
            }
        })
        .catch(error => {
            console.error(`❌ Erreur lors de l'import de ${scriptName}.js :`, error);
        });
}

/**
 * Met à jour la valeur du champ `selected-departure-address` dans le snapshot avant la transition.
 * @param {HTMLElement} tempDiv - Conteneur temporaire où la page est chargée avant le snapshot.
 */
function updateSelectedAddressInSnapshot(tempDiv) {

    const selectedDepartureAddress = localStorage.getItem('selectedDepartureAddress') || "Départ";
    const selectedArrivalAddress = localStorage.getItem('selectedArrivalAddress') || "Arrivée";
    const departureElement = tempDiv.querySelector('#selected-departure-address');
    const arrivalElement = tempDiv.querySelector('#selected-arrival-address');
    
    if (departureElement) {
        departureElement.textContent = selectedDepartureAddress;
        console.log(`✅ selectedDepartureAddress mis à jour dans le snapshot avec : ${selectedDepartureAddress}`);
    } else {
        console.warn(`⚠️ Élément #selected-departure-address introuvable dans le snapshot.`);
    }

    if (arrivalElement) {
        arrivalElement.textContent = selectedArrivalAddress;
        console.log(`✅ selectedArrivalAddress mis à jour dans le snapshot avec : ${selectedArrivalAddress}`);
    } else {
        console.warn(`⚠️ Élément #selected-arrival-address introuvable dans le snapshot.`);
    }
}
