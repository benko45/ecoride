import { storeStyles, applyStoredStyles, restoreDepartureAddress } from "./functions.js";
import { applyTheme } from "./apply-theme.js";

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

    if (url.includes("choosing-address.html")) {
        exitDirection = "-100%"; 
        enterDirection = "100%"; 
    } else if (url.includes("index.html")) {
        exitDirection = "100%"; 
        enterDirection = "-100%"; 
    }

    // 🔹 Sauvegarde les styles avant de quitter la page actuelle
    // storeStyles();

    // ✅ Animation de sortie
    gsap.to(pageContent, {
        opacity: 0,
        x: exitDirection,
        duration: 0.5,
        onComplete: () => {
            console.log("✅ Animation de sortie terminée, chargement de la nouvelle page :", url);

            fetch(url)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");
                    const newContent = doc.getElementById("page-content").innerHTML;
                    pageContent.innerHTML = newContent
                    setTimeout(() => {
                        console.log("🔄 Vérification du DOM après transition...");
                        
                        if (window.location.pathname.includes("choosing-address.html")) {
                            const addressInput = document.querySelector("#address");
                            console.log(addressInput ? "✅ #address trouvé ! La page est bien chargée." : "❌ #address introuvable !");
                        } else if (window.location.pathname.includes("index.html")) {
                            const menuToggle = document.querySelector("#menu-toggle");
                            console.log(menuToggle ? "✅ #menu-toggle trouvé ! La page est bien chargée." : "❌ #menu-toggle introuvable !");
                        }
                    }, 500);

                    console.log("✅ Nouveau contenu inséré, animation d'entrée...");

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
                    console.log("✅ Nouvelle page chargée avec transition !");

                    // 🔄 Appliquer les styles et recharger les scripts après la transition
                    applyStoredStyles();
                    reloadScripts(url);                    
                })
                .catch(error => console.error("❌ Erreur lors du chargement de la page :", error));
        }
    });
}

function reloadScripts(url) {
    let pageName = url.split("/").pop().replace(".html", "");

    // 📌 Scripts spécifiques à chaque page
    const scriptsToReload = {
        "index": ["index.js", "apply-theme.js"], // 📌 On recharge `applyTheme.js`
        "choosing-address": ["choosing-address.js"]
    };
    
    console.log(`🔄 Vérification : rechargement des scripts pour ${pageName}`);
    if (url.includes("index.html")) {
        console.log("📌 Exécution forcée de restoreDepartureAddress() après transition...");
        // setTimeout(() => {
            restoreDepartureAddress();
        // }, 200);
    }
    
    if (scriptsToReload[pageName]) {
        scriptsToReload[pageName].forEach(script => {
            const scriptPath = window.location.hostname === "benko45.github.io"
                ? `/ecoride/src/js/${script}`
                : `/src/js/${script}`;

            console.log(`🔄 Tentative de rechargement : ${scriptPath}`);

            removeAndReloadScript(scriptPath, script);
        });
    }
    console.log(`🔄 Vérification : rechargement de ${url}`);

    setTimeout(() => {
        const scriptTest = document.querySelector(`script[src*="index.js"]`);
        if (scriptTest) {
            console.log("✅ `NOUVEAU TEST index.js` bien rechargé :", scriptTest.src);
        } else {
            console.error("❌ `NOUVEAU TEST index.js` ne s'est pas rechargé !");
        }
    }, 500);

}

/**
 * 🔄 Supprime un script existant et le recharge avec un délai pour éviter les conflits
 */
function removeAndReloadScript(scriptSrc, scriptName) {
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (existingScript) {
        console.warn(`⚠️ Suppression du script existant : ${scriptSrc}`);
        existingScript.remove();

        setTimeout(() => {
            const checkScript = document.querySelector(`script[src="${scriptSrc}"]`);
            if (checkScript) {
                console.error(`❌ Échec de la suppression du script : ${scriptSrc}`);
            } else {
                console.log(`✅ Script supprimé avec succès : ${scriptSrc}`);
                addNewScript(scriptSrc, scriptName);
            }
        }, 200); // Augmentation du délai pour éviter toute collision
    } else {
        console.log(`✅ Aucun script trouvé, chargement direct : ${scriptSrc}`);
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
        console.log(`✅ Script rechargé et exécuté : ${scriptSrc}`);
        
        if (scriptName === "choosing-address.js") {
            console.log("📌 Ré-exécution manuelle de `choosing-address.js` après rechargement...");
            import(scriptSrc)
                .then(module => {
                    if (module.initChoosingAddress) {
                        module.initChoosingAddress();
                        console.log("✅ `initChoosingAddress()` exécuté après rechargement !");
                    } else {
                        console.warn("⚠️ `initChoosingAddress()` introuvable après rechargement !");
                    }
                })
                .catch(err => console.error(`❌ Erreur lors de l'import de ${scriptSrc}`, err));
        }

        if (scriptName === "apply-theme.js") {
            console.log("🎨 Ré-exécution de `applyTheme()`...");
            if (typeof applyTheme === "function") {
                applyTheme();
                console.log("✅ `applyTheme()` exécuté !");
            } else {
                console.warn("⚠️ `applyTheme()` introuvable après rechargement !");
            }
        }

        if(scriptName === "index.js") {
            console.log("📌 Ré-exécution manuelle de `index.js` après rechargement...");
            import(scriptSrc)
                .then(module => {
                    if (module.initIndex) {
                        module.initIndex();
                        console.log("✅ `initIndex()` exécuté après rechargement !");
                    } else {
                        console.warn("⚠️ `initIndex()` introuvable après rechargement !");
                    }
                })
            }
    };

    document.body.appendChild(newScript);
}





// Gère la navigation avec le bouton "Retour" du navigateur
window.addEventListener("popstate", function () {
    console.log("🔙 Bouton retour du navigateur détecté !");
    
    // Charger la page en fonction de l'URL actuelle (sans recharger toute la page)
    loadPage(window.location.pathname);
});


