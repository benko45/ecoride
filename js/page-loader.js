import { positionDropdownMenu } from "./index.js";
import { selectImage } from "./functions.js";


if(!localStorage.getItem('page-loader-occurence')) {
    localStorage.setItem('page-loader-occurence', 1);
} else {
    localStorage.setItem('page-loader-occurence', parseInt(localStorage.getItem('page-loader-occurence')) + 1);
}

console.log("page-loader.js est exécuté... sur : ", localStorage.getItem('page-loader-occurence'), "occurence(s)");

document.addEventListener("click", (event) => {
    console.log("🟢 Clic détecté ! Élément :", event.target);
});

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("a");
        if (target) {
            event.preventDefault();
            const url = new URL(target.href);
            console.log("🔄 Clic sur un lien <a> détecté :", url);
            console.log("🔄 Clic sur un lien <a> détecté : HREF.PATHNAME = ", url.pathname);
            const urlPathname = url.pathname.split("/").pop();
            console.log("🔄 Clic sur un lien <a> détecté : HREF.PATHNAME.SPLIT.POP = ", urlPathname);
            loadPage(urlPathname);
        }
    });
    
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("[data-navigate]");
        if (target) {
            event.preventDefault();
            console.log("🔄 Clic sur un élément avec data-navigate détecté :", target.getAttribute("data-navigate"));
            console.log("🔄 Clic sur un élément avec data-navigate détecté : HREF = ", target.getAttribute("data-navigate"));
            loadPage(target.getAttribute("data-navigate"));
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

    if (!url) {
        console.warn("⚠️ Aucune URL de retour trouvée, retour à la page d'accueil.");
        url = "/";
    }
    cleanOldScripts();
    const pageContent = document.getElementById("page-content");
    try {
        let { snapshot, scripts, styles } = await generatePageSnapshot(url);
        console.log("executeScripts : 1");
        executeScripts(scripts);
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
        if(url.includes("index.html")) {
            selectImage();
            positionDropdownMenu();
        }
        // ✅ Charger immédiatement les styles CSS pour la transition
        await loadCSSForPage(styles);

        gsap.to(tempContainer, {
            left: "0%",
            duration: 2,
            ease: "power2.inOut",
            onComplete: async () => {
                pageContent.innerHTML = tempContainer.innerHTML;
                tempContainer.remove();
                if (!fromBackButton) {
                    window.history.pushState({}, "", url);
                }
                console.log(`✅ Transition terminée vers ${url}`);
                attachClickEventToLocationButton(url);
                setTimeout(() => {
                    console.log("Scripts après transition :");
                    Array.from(document.scripts).forEach(script => console.log(script.src));
                    console.log("executeScripts : 2");
                    executeScripts(scripts);
                }, 0);
                requestAnimationFrame(() => {
                    positionDropdownMenu();
                });
            }
        });

    } catch (error) {
        console.error("❌ Erreur lors du chargement de la page :", error);
    }
}

async function attachClickEventToLocationButton(url) {
    if (url.includes("choosing-address.html")) {
        console.log("🔄 Chargement dynamique de choosing-address.js...");
        const { attachClickEventToLocationButton } = await import("./choosing-address.js");
        attachClickEventToLocationButton();
    }
    if (url.includes("choosing-arrival-address.html")) {
        console.log("🔄 Chargement dynamique de choosing-address.js...");
        const { attachClickEventToLocationButton } = await import("./choosing-arrival-address.js");
        attachClickEventToLocationButton();
    }
}

async function generatePageSnapshot(url) {
    console.log(`📸 Génération et stabilisation de la page en arrière-plan : ${url}`);

    try {
        // let response = await fetch(`${url}?_=${Date.now()}`, { cache: "no-store" });
        let response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        let htmlText = await response.text();
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlText;

        let pageContentElement = tempDiv.querySelector("#page-content");
        if (!pageContentElement) throw new Error( `❌ #page-content introuvable dans la page chargée !`);

        // 🔹 Correction : extraire uniquement le contenu interne de `#page-content`
        let snapshot = pageContentElement.cloneNode(true);
        snapshot.removeAttribute("id"); // Enlève l'ID pour éviter un conflit lors de l'insertion

        console.log("✅ Contenu extrait sans doubler #page-content.");

        // 🔹 Mettre à jour le champ `selected-departure-address` dans le snapshot
        if (window.location.pathname.includes("choosing-address.html") || window.location.pathname.includes("choosing-arrival-address.html")) {
            updateSelectedDepartureInSnapshot(snapshot);
        } else {
            console.log("🔄 updateSelectedDepartureInSnapshot() n'a pas été appliquée");
        }

        let scripts = Array.from(tempDiv.querySelectorAll("script"));
        
        scripts = scripts.filter(script => 
            script.src && 
            !script.src.includes("fiveserver.js") && 
            !script.src.includes("https")
        );

        // 🔹 Modifier les chemins des scripts en fonction de l'environnement
        const prefix = window.location.hostname === "benko45.github.io/" ? "/ecoride" : "/";
        
        scripts.forEach(script => {
            console.log(`chemin trouvé : ${script.src}`);
            const scriptSrc = new URL(script.src);
            const protocol = scriptSrc.protocol;
            const host = scriptSrc.host;
            const pathName = scriptSrc.pathname;
            script.src = `${protocol}//${host}${pathName}`;
        });

        let styles = Array.from(tempDiv.querySelectorAll("link[rel='stylesheet']"));

        scripts.forEach(script => console.log("Script trouvé :", script.src || "[inline script]"));
        styles.forEach(style => console.log("Style trouvé :", style.href));

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
    document.querySelectorAll("script[data-dynamic]").forEach(script => {
        console.log("🗑️ Suppression de l'ancien script :", script.src || "[inline script]");
        script.remove();
    });
}

function executeScripts(scripts) {
    console.log("🔄 début EXECUTESCRIPTS");

    cleanOldScripts();
    
    scripts.forEach(oldScript => {
        
        let newScript = document.createElement("script");
        newScript.setAttribute("data-dynamic", "true");

        if (oldScript.src) {
            // newScript.src = oldScript.src + "?_=" + Date.now();
            console.log("🔄 EXECUTESCRIPTS Script trouvé :", oldScript.src);
            newScript.src = oldScript.src;
            console.log("🔄 EXECUTESCRIPTS Script chargé :", newScript.src);
            newScript.async = false;
            console.log("🔄 EXECUTESCRIPTS Script async :", newScript.async);
            if (oldScript.type === "module") newScript.type = "module";

            newScript.onload = () => console.log("✅ EXECUTESCRIPTS Script chargé :", newScript.src);
            newScript.onerror = () => console.error("❌ EXECUTESCRIPTS Erreur de chargement du script :", newScript.src);

            document.body.appendChild(newScript);
            console.log("✅ EXECUTESCRIPTS Script fin boucle.");
        } else {
            newScript.textContent = oldScript.textContent;
            if (oldScript.type === "module") newScript.type = "module";
            document.body.appendChild(newScript);
            console.log("✅ EXECUTESCRIPTS Script inline exécuté.");
        }
    });
    console.log("🔄 fin EXECUTESCRIPTS");
}

/**
 * Met à jour la valeur du champ `selected-departure-address` dans le snapshot avant la transition.
 * @param {HTMLElement} tempDiv - Conteneur temporaire où la page est chargée avant le snapshot.
 */
function updateSelectedDepartureInSnapshot(tempDiv) {
    const selectedDeparture = localStorage.getItem('selectedDepartureAddress') || "Adresse";
    const displayElement = tempDiv.querySelector('#selected-departure-address');
    
    if (displayElement) {
        displayElement.textContent = selectedDeparture;
        console.log(`✅ "selected-departure-address" mis à jour dans le snapshot avec : ${selectedDeparture}`);
    } else {
        console.warn('⚠️ Élément "selected-departure-address" introuvable dans le snapshot.');
    }
}
