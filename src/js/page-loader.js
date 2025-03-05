import { applyStoredStyles, restoreDepartureAddress, restoreArrivalAddress } from "./functions.js";
import { applyTheme } from "./apply-theme.js";
import { ensureCorrectStylesheet } from "./choosing-passengers.js";

document.addEventListener("DOMContentLoaded", function () {
    // console.log("✅ Page-loader.js chargé !");
    
    //Détection des clics sur les liens de navigation
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("a");
        if (target) {
            event.preventDefault();
            const url = target.href;
            // console.log("✅ Navigation détectée vers :", url);
            loadPage(url);
        }
    });
    // Détection des clics sur les boutons de navigation dynamique
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("[data-navigate]");
        if (target) {
            event.preventDefault();
            const url = target.getAttribute("data-navigate");
            // console.log("✅ Navigation détectée vers :", url);
            loadPage(url);
        }
    });
});

// Fonction pour charger une page avec AJAX + animation GSAP
function loadPage(url) {
    const pageContent = document.getElementById("page-content");

    let exitDirection = "-100%";  
    let enterDirection = "100%";  

    if (url.includes("index.html")) {
        exitDirection = "100%";
        enterDirection = "-100%";
    }

    // ✅ Animation de sortie
    gsap.to(pageContent, {
        opacity: 0,
        x: exitDirection,
        duration: 0.5,
        onComplete: () => {
            // console.log("✅ Animation de sortie terminée, chargement de la nouvelle page :", url);

            fetch(url)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");
                    const newContent = doc.getElementById("page-content").innerHTML;
                    pageContent.innerHTML = newContent;               
                    // 🔄 Recharger les styles css de choosing-passengers.css
                    ensureCorrectStylesheet("choosing-passengers"); 
                    // et supprimer ceux de mains.css

                    // ✅ Animation d'entrée
                    gsap.fromTo(pageContent, {
                        opacity: 0,
                        x: enterDirection,
                    }, {
                        opacity: 1,
                        x: "0%",
                        duration: 0.5
                    });
                    // ✅ Mettre à jour l'URL dans l'historique
                    history.pushState(null, null, url)
                    // console.log("✅ Nouvelle page chargée avec transition !");

                    // 🔄 Appliquer les styles
                    applyStoredStyles();
                    // 🔄 Recharger les scripts
                    reloadScripts(url);                    
                })
                .catch(error => console.error("❌ Erreur lors du chargement de la page :", error));
        }
    });
}

function reloadScripts(url) {
    /* chargement des js */
    loadingJavaScripts(url);
    /* chargement des bootstrap-icons */
    loadingBootstrapIcons();
    // 🔄 Gestion des styles css pour la transition choosing-passengers.html->index.html
    loadingIndexStyles(url);
}

/**
 * 🔄 Supprime un script existant et le recharge avec un délai pour éviter les conflits
 */
function removeAndReloadScript(scriptSrc, scriptName) {
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (existingScript) {
        // console.warn(`⚠️ Suppression du script existant : ${scriptSrc}`);
        existingScript.remove();

        setTimeout(() => {
            const checkScript = document.querySelector(`script[src="${scriptSrc}"]`);
            if (checkScript) {
                // console.error(`❌ Échec de la suppression du script : ${scriptSrc}`);
            } else {
                // console.log(`✅ Script supprimé avec succès : ${scriptSrc}`);
                addNewScript(scriptSrc, scriptName);
            }
        }, 200); // Augmentation du délai pour éviter toute collision
    } else {
        // console.log(`✅ Aucun script trouvé, chargement direct : ${scriptSrc}`);
        addNewScript(scriptSrc, scriptName);
    }
}

/**
 * 🔄 Ajoute un script et force son exécution
 */
function addNewScript(scriptSrc, scriptName) {
    const newScript = document.createElement("script");
    newScript.src = scriptSrc;
    newScript.type = "module";
    newScript.defer = true;

    newScript.onload = () => {
        // console.log(`✅ Script rechargé et exécuté : ${scriptSrc}`);
        
        if (scriptName === "index.js") {
            // console.log("📌 Ré-exécution de `index.js` après rechargement...");
            import(scriptSrc)
                .then(module => {
                    if (module.initIndex) {
                        module.initIndex();
                        console.log("✅ `initIndex()` exécuté !");
                    } else {
                        console.warn("⚠️ `initIndex()` introuvable !");
                    }
                })
                .catch(err => console.error(`❌ Erreur lors de l'import de ${scriptSrc}`, err));
        }

        if (scriptName === "apply-theme.js") {
            // console.log("🎨 Ré-exécution de `applyTheme()`...");
            if (typeof applyTheme === "function") {
                applyTheme();
                // console.log("✅ `applyTheme()` exécuté !");
            } else {
                // console.warn("⚠️ `applyTheme()` introuvable après rechargement !");
            }
        }

        if (scriptName === "choosing-address.js") {
            // console.log("📌 Ré-exécution manuelle de `choosing-address.js` après rechargement...");
            import(scriptSrc)
                .then(module => {
                    if (module.initChoosingAddress) {
                        module.initChoosingAddress();
                        // console.log("✅ `initChoosingAddress()` exécuté après rechargement !");
                    } else {
                        // console.warn("⚠️ `initChoosingAddress()` introuvable après rechargement !");
                    }
                })
                .catch(err => console.error(`❌ Erreur lors de l'import de ${scriptSrc}`, err));
        }

        if (scriptName === "choosing-arrival-address.js") {
            // console.log("📌 Ré-exécution manuelle de `choosing-arrival-address.js` après rechargement...");
            import(scriptSrc)
                .then(module => {
                    if (module.initChoosingArrivalAddress) {
                        module.initChoosingArrivalAddress();
                        // console.log("✅ `initChoosingArrivalAddress()` exécuté après rechargement !");
                    } else {
                        // console.warn("⚠️ `initChoosingArrivalAddress()` introuvable après rechargement !");
                    }
                })
                .catch(err => console.error(`❌ Erreur lors de l'import de ${scriptSrc}`, err));
        }
        if (scriptName === "choosing-date.js") {
            // console.log("📌 Ré-exécution manuelle de `choosing-arrival-address.js` après rechargement...");
            import(scriptSrc)
                .then(module => {
                    if (module.initChoosingDate) {
                        module.initChoosingDate();
                        console.log("✅ `initChoosingDate()` exécuté après rechargement !");
                    } else {
                        console.warn("⚠️ `initChoosingDate()` introuvable après rechargement !");
                    }
                })
                .catch(err => console.error(`❌ Erreur lors de l'import de ${scriptSrc}`, err));
        }
        if (scriptName === "choosing-passengers.js") {
            console.log("📌 Ré-exécution manuelle de `choosing-arrival-address.js` après rechargement...");
            import(scriptSrc)
                .then(module => {
                    if (module.initChoosingPassengers) {
                        module.initChoosingPassengers();
                        console.log("✅ `initChoosingPassengerss()` exécuté après rechargement !");
                    } else {
                        console.warn("⚠️ `initChoosingPassengers()` introuvable après rechargement !");
                    }
                })
                .catch(err => console.error(`❌ Erreur lors de l'import de ${scriptSrc}`, err));
        }
        
    };

    document.body.appendChild(newScript);
}


// Gère la navigation avec le bouton "Retour" du navigateur
window.addEventListener("popstate", function () {
    // console.log("🔙 Bouton retour du navigateur détecté !");
    
    // Charger la page en fonction de l'URL actuelle (sans recharger toute la page)
    loadPage(window.location.pathname);
});

function loadingJavaScripts(url) {
    const scriptTest = document.querySelector(`script[src*="index.js"]`);
    if (scriptTest) {
        console.log("✅ index.js a bien été ajouté au DOM :", scriptTest.src);
    } else {
        console.error("❌ index.js ne s'est pas rechargé !");
    }
    let pageName = url.split("/").pop().replace(".html", "");
    const scriptsToReload = {
        "index": ["index.js", "apply-theme.js"], // 📌 On recharge `applyTheme.js`
        "choosing-address": ["choosing-address.js"],
        "choosing-arrival-address": ["choosing-arrival-address.js"],
        "choosing-date": ["choosing-date.js"],
        "choosing-passengers": ["choosing-passengers.js"]
    };
        if (scriptsToReload[pageName]) {
        scriptsToReload[pageName].forEach(script => {
            const scriptPath = window.location.hostname === "benko45.github.io"
                ? `/ecoride/src/js/${script}`
                : `/src/js/${script}`;

            console.log(`🔄 Tentative de rechargement : ${scriptPath}`);

            removeAndReloadScript(scriptPath, script);
        });
    }
}

function loadingBootstrapIcons() {
    const biLink = document.querySelector("link[href*='bootstrap-icons']");
    if (!biLink) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"; // 📌 Vérifie l'URL exacte
        document.head.appendChild(link);
        console.log("✅ Bootstrap Icons rechargé !");
    }
}

function loadingIndexStyles(url) {
    if (url.includes("index.html")) {
        console.log("🔄 Suppression des styles obsolètes et rechargement des styles de index.html");
    
        // Supprimer les anciennes feuilles de style
        document.querySelectorAll("link[rel='stylesheet']").forEach(link => {
            if (link.href.includes("choosing-passengers.css")) {
                console.log("❌ Suppression du CSS de choosing-passengers :", link.href);
                link.remove();
            }
        });
        const scriptPath = window.location.hostname === "benko45.github.io"
        ? "/ecoride"
        : "";
        // Recharger les styles d'index.html
        const stylesToLoad = [
            `${scriptPath}/public/css/main.css`, 
            `${scriptPath}/public/css/custom-themes.css`,
            `${scriptPath}/public/css/bootstrap.css` // ⚠️ Ajouté pour éviter des erreurs
        ];
        // Suppression des anciens styles non nécessaires (exemple : ceux de choosing-passengers)
        document.querySelectorAll("link[rel='stylesheet']").forEach(link => {
            if (link.href.includes("choosing-passengers.css") || link.href.includes("choosing-arrival-address.css")) {
                console.log("❌ Suppression des styles obsolètes :", link.href);
                link.remove();
            }
        });
        // Ajout des styles nécessaires
        stylesToLoad.forEach(stylePath => {
            if (!document.querySelector(`link[href="${stylePath}"]`)) {
                const newLink = document.createElement("link");
                newLink.rel = "stylesheet";
                newLink.href = stylePath;
                document.head.appendChild(newLink);
                console.log("✅ Feuille de style ajoutée :", stylePath);
            }
        });
        restoreDepartureAddress();
        restoreArrivalAddress();
    }
}