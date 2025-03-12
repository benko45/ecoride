import { applyDynamicStyles, selectImage } from "./functions.js";

document.addEventListener("click", (event) => {
    console.log("🟢 Clic détecté ! Élément :", event.target);
});

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
    cleanOldScripts();
    const pageContent = document.getElementById("page-content");
    try {
        let { snapshot, scripts, styles } = await generatePageSnapshot(url);
        executeScripts(scripts);
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
                importJS(url);
                setTimeout(() => {
                    console.log("Scripts après transition :");
                    Array.from(document.scripts).forEach(script => console.log(script.src));
                    executeScripts(scripts);
                }, 0);
            }
        });

    } catch (error) {
        console.error("❌ Erreur lors du chargement de la page :", error);
    }
}
async function importJS(url) {
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
        let response = await fetch(`${url}?_=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        let htmlText = await response.text();
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlText;

        let pageContentElement = tempDiv.querySelector("#page-content");
        if (!pageContentElement) throw new Error("❌ `#page-content` introuvable dans la page chargée !");

        let snapshot = pageContentElement.cloneNode(true);
        let scripts = Array.from(tempDiv.querySelectorAll("script"));
        // ✅ Filtrer les scripts à ne pas recharger
        scripts = scripts.filter(script => 
            script.src && 
            !script.src.includes("fiveserver.js") && 
            script.src.includes("src/js")
        );
        let styles = Array.from(tempDiv.querySelectorAll("link[rel='stylesheet']"));

        scripts.forEach(script => console.log("Script trouvé :", script.src || "[inline script]"));
        styles.forEach(style => console.log("Style trouvé :", style.href));
        return { snapshot: snapshot.outerHTML, scripts, styles };
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

