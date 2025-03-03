document.addEventListener("DOMContentLoaded", function () {
    // console.log("✅ Page-loader.js chargé !");
    
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

    if (!pageContent) {
        console.error("❌ ERREUR : `#page-content` introuvable !");
        return;
    }

    // console.log("🔹 Chargement de la page :", url);

    // Animation de sortie
    gsap.to(pageContent, {
        opacity: 0,
        x: "-100%",
        duration: 0.5,
        onComplete: () => {
            fetch(url)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");
                    const newContent = doc.getElementById("page-content").innerHTML;
                    // Remplace le contenu
                    pageContent.innerHTML = newContent;
                    // pageContent.style.display = "block"; // Assurer la visibilité
                    // console.log("✅ Styles CSS rechargés !");
                    gsap.fromTo(pageContent, {
                        opacity: 0,
                        x: "100%",
                    }, {
                        opacity: 1,
                        x: "0%",
                        duration: 0.5
                    });
                    // Met à jour l'URL dans l'historique
                    history.pushState(null, null, url);
                    // Recharge les scripts dynamiques
                    reloadScripts();
                })
                .catch(error => console.error("❌ Erreur lors du chargement de la page :", error));
        }
    });
}

// // Permet de recharger les styles CSS de la page
// function reloadStylesheets() {
//     // console.log("🔄 Rechargement des styles CSS...");

//     document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
//         let cssHref = link.href;

//         // console.log("📜 CSS détecté :", cssHref);

//         // **Correction des chemins**
//         if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
//             // ✅ Supprimer `/public/html/` en trop en local
//             cssHref = cssHref.replace("/public/html/", "/public/");
//         } else if (window.location.hostname === "benko45.github.io") {
//             // ✅ Correction pour GitHub Pages → `/ecoride/public/css/`
//             cssHref = cssHref.replace("/public/html/", "/ecoride/public/");
//         }

//         // ✅ Ajouter un timestamp pour forcer le rechargement
//         const newLink = link.cloneNode();
//         newLink.href = cssHref.split("?")[0] + "?v=" + new Date().getTime();

//         // ✅ Remplacer l'ancien lien CSS
//         link.parentNode.replaceChild(newLink, link);

//         // console.log("✅ CSS rechargé avec le bon chemin :", newLink.href);
//     });
// }

// Permet de recharger les scripts spécifiques à chaque page
function reloadScripts() {
    // console.log("🔹 Début du rechargement des scripts...");
    // console.log("🌎 Hostname :", window.location.hostname);
    // console.log("🌍 Origin :", window.location.origin);

    document.querySelectorAll("script").forEach(oldScript => {
        let scriptSrc = oldScript.src;

        if (!scriptSrc) return; // Ignorer les scripts sans `src`
        
        // console.log("📜 Script trouvé :", scriptSrc);

        // Exclure certains scripts du rechargement
        if (scriptSrc.includes("jquery") || scriptSrc.includes("fiveserver.js")) {
            // console.log("⚠️ Ignoré :", scriptSrc);
            return;
        }

        if (oldScript.getAttribute("type") === "module") {
            // console.log("⚠️ Ignoré : `type=module` doit être rechargé manuellement :", scriptSrc);
            return;
        }

        // 🔹 Vérifier si le script est un fichier local (pas un CDN)
        if (scriptSrc.startsWith(window.location.origin)) {
            let basePath = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
                ? "/public/"
                : "/";
            
            // Récupérer le chemin relatif sans le domaine
            scriptSrc = scriptSrc.replace(window.location.origin, ""); 

            // ✅ Supprimer le mauvais préfixe `public/html/`
            scriptSrc = scriptSrc.replace(/^\/public\/html\//, "/");

            // ✅ Appliquer la correction selon le chemin
            if (scriptSrc.startsWith("/public/js/")) {
                scriptSrc = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
                    ? scriptSrc
                    : scriptSrc.replace("/public/", "/");
            } 
            else if (scriptSrc.startsWith("/src/js/")) {
                scriptSrc = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
                    ? scriptSrc
                    : scriptSrc.replace(/^\/src\//, "src/");
            }

            // ✅ Éviter les doubles `/` dans le chemin
            scriptSrc = scriptSrc.replace(/\/+/g, "/");
        }
        // **⚠️ Correction uniquement pour GitHub Pages**
        if (window.location.hostname === "benko45.github.io") {
            scriptSrc = scriptSrc.replace("/public/html/", "/"); // ✅ Supprime `/public/html/` en prod
        }
        // console.log("✅ Nouveau chemin du script :", scriptSrc);
        // Ajouter un nouveau script cloné pour exécuter le JS
        const newScript = document.createElement("script");
        newScript.src = scriptSrc;
        newScript.defer = true;
        document.body.appendChild(newScript);

        // console.log("✅ Script rechargé :", newScript.src);
    });
    // 🔹 Recharger `choosing-address.js` correctement en tant que module
    const choosingScriptPath = window.location.hostname === "benko45.github.io"
        ? "/ecoride/src/js/choosing-address.js"  // ✅ GitHub Pages : utiliser `/ecoride/`
        : "/src/js/choosing-address.js"  // ✅ Correction : utiliser `src/` en local
    // console.log("🔹 Chargement forcé de `choosing-address.js` :", choosingScriptPath);
    const moduleScript = document.createElement("script");
    moduleScript.src = choosingScriptPath;
    moduleScript.type = "module";
    moduleScript.defer = true;
    document.body.appendChild(moduleScript);
}

    // Gère la navigation avec le bouton "Retour" du navigateur
    window.addEventListener("popstate", () => {
    loadPage(window.location.pathname);
});

