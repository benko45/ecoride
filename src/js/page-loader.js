import { applyDynamicStyles, selectImage } from "./functions.js";

// document.documentElement.style.overflow = "hidden";
// document.body.style.overflow = "hidden";


document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("a");
        if (target) {
            event.preventDefault();
            loadPage(target.href);
        }
    });
    
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("[data-navigate]");
        if (target) {
            event.preventDefault();
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

    const pageContent = document.getElementById("page-content");
    try {
        console.log("Scripts 0 : ");
        Array.from(document.scripts).forEach(script => console.log(script.src));
        let { snapshot, scripts } = await generatePageSnapshot(url);

        let tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.top = "0";
        tempContainer.style.left = "100%";
        tempContainer.style.width = "100%";
        tempContainer.style.height = "100%";
        tempContainer.style.zIndex = "100";
        tempContainer.style.backgroundColor = "var(--custom-light)";

        document.body.appendChild(tempContainer);
        tempContainer.innerHTML = snapshot; 
        console.log("Scripts 1 : ");
        Array.from(document.scripts).forEach(script => console.log(script.src));
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

                setTimeout(() => {
                    executeScripts(scripts);
                }, 50);
            }
        });
        setTimeout(() => {
            console.log("Scripts 2 : ");
            Array.from(document.scripts).forEach(script => console.log(script.src));
        }, 50);

    } catch (error) {
        console.error("❌ Erreur lors du chargement de la page :", error);
    }
}


async function generatePageSnapshot(url) {
    console.log(`📸 Génération et stabilisation de la page en arrière-plan : ${url}`);

    try {
        let response = await fetch(`${url}?_=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        let htmlText = await response.text();
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlText;

        let pageContentElement = tempDiv.querySelector("#page-content");
        if (!pageContentElement) throw new Error("❌ `#page-content` introuvable dans la page chargée !");

        let snapshot = pageContentElement.cloneNode(true);
        let scripts = Array.from(tempDiv.querySelectorAll("script"));

        return { snapshot: snapshot.outerHTML, scripts };
    } catch (error) {
        console.error("❌ Erreur lors de la capture de la page :", error);
        return { snapshot: "", scripts: [] };
    }
}



async function executeScriptInIframe(scriptElement, iframeWindow) {
    return new Promise((resolve, reject) => {
        let doc = iframeWindow.document;
        let newScript = doc.createElement("script");

        if (scriptElement.src) {
            newScript.src = scriptElement.src;
            newScript.async = false;

            if (scriptElement.type === "module") {
                newScript.type = "module";
            }

            newScript.onload = () => {
                // console.log(`✅ Script exécuté : ${scriptElement.src}`);
                resolve();
            };

            newScript.onerror = () => {
                console.error(`❌ Erreur de chargement du script ${scriptElement.src}`);
                reject();
            };

            doc.body.appendChild(newScript);
        } else {
            try {
                newScript.textContent = scriptElement.textContent;
                newScript.type = scriptElement.type || "text/javascript";
                doc.body.appendChild(newScript);
                // console.log(`✅ Script inline exécuté.`);
                resolve();
            } catch (error) {
                console.error(`❌ Erreur d'exécution du script inline`, error);
                reject(error);
            }
        }
    });
}

async function loadCSSForPage(doc, url) {
    return new Promise((resolve) => {
        let existingStyles = Array.from(document.querySelectorAll("link[rel='stylesheet']")).map(link => link.href);
        let newStyles = [];

        if (!url.startsWith("http")) {
            url = new URL(url, window.location.origin).href;
        }

        // console.log(`🌍 URL de base utilisée : ${url}`);

        let stylesheets = doc.querySelectorAll("link[rel='stylesheet']");

        stylesheets.forEach((link) => {
            if (!link.href) {
                console.warn("⚠️ Un fichier CSS sans `href` a été ignoré.");
                return;
            }

            let absoluteHref = link.href;
            if (link.href.includes("/public/css/")) {
                try {
                    absoluteHref = link.href.startsWith("http") ? link.href : new URL(link.href, url).href;
                    // console.log(`🔗 Reconstruction de l'URL pour : ${link.href} → ${absoluteHref}`);
                } catch (error) {
                    console.error(`❌ Erreur lors de la construction de l'URL pour : ${link.href}`, error);
                    return;
                }
            }
            // } else {
            //     console.log(`🔗 Fichier CSS externe détecté : ${link.href} (pas modifié)`);
            // }

            // console.log(`📋 Vérification avant ajout : ${absoluteHref}`);
            // console.log(`   Est déjà dans existingStyles ? ${existingStyles.includes(absoluteHref)}`);
            
            if (!existingStyles.includes(absoluteHref)) {
                newStyles.push(absoluteHref);
            }
        });

        // console.log(`📜 ${newStyles.length} nouveaux fichiers CSS détectés pour cette page :`, newStyles);

        if (newStyles.length === 0) {
            resolve(); // Rien à charger
            return;
        }

        let loadedCount = 0;
        newStyles.forEach((href) => {
            let newLink = document.createElement("link");
            newLink.rel = "stylesheet";
            newLink.href = href;
            newLink.onload = () => {
                loadedCount++;
                if (loadedCount === newStyles.length) {
                    // console.log("✅ Tous les fichiers CSS nécessaires ont été chargés !");
                    setTimeout(resolve, 200); // ⏳ Attendre 200ms avant de continuer
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

function applySnapshot(tempContainer) {
    console.log("🔄 Application instantanée du snapshot...");

    const savedSnapshot = localStorage.getItem("pageSnapshot");

    if (!savedSnapshot) {
        console.warn("⚠️ Aucun snapshot enregistré.");
        return;
    }

    // ✅ Injection immédiate du snapshot sans aucune vérification inutile
    tempContainer.innerHTML = savedSnapshot;

    console.log("✅ Snapshot appliqué immédiatement.");
    
    // ✅ Suppression de toute tentative de rechargement des images
    // On laisse le navigateur gérer leur affichage naturellement

    // ✅ Réappliquer les styles dynamiques APRÈS la transition
    requestAnimationFrame(() => {
        console.log("🎨 Réapplication des styles dynamiques après la transition...");
        document.querySelectorAll("*").forEach(el => {
            applyDynamicStyles(el);
        });
        console.log("✅ Styles dynamiques réappliqués.");
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
    console.log("🔄 Exécution des scripts après transition...");

    cleanOldScripts();

    scripts.forEach(oldScript => {
        let newScript = document.createElement("script");
        newScript.setAttribute("data-dynamic", "true");

        if (oldScript.src) {
            newScript.src = oldScript.src + "?_=" + Date.now();
            newScript.async = false;
            if (oldScript.type === "module") newScript.type = "module";

            newScript.onload = () => console.log("✅ Script chargé :", newScript.src);
            newScript.onerror = () => console.error("❌ Erreur de chargement du script :", newScript.src);

            document.body.appendChild(newScript);
        } else {
            newScript.textContent = oldScript.textContent;
            if (oldScript.type === "module") newScript.type = "module";
            document.body.appendChild(newScript);
            console.log("✅ Script inline exécuté.");
        }
    });
    console.log("✅ Tous les scripts ont été exécutés.");
}

