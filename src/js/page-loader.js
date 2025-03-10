import { applyDynamicStyles, selectImage } from "./functions.js";

// document.documentElement.style.overflow = "hidden";
// document.body.style.overflow = "hidden";


document.addEventListener("DOMContentLoaded", function () {
    
    // ✅ Détection des clics sur les liens de navigation
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("a");
        if (target) {
            event.preventDefault();
            const url = target.href;
            loadPage(url);
        }
    });

    // ✅ Détection des clics sur les boutons de navigation dynamique
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("[data-navigate]");
        if (target) {
            event.preventDefault();
            const url = target.getAttribute("data-navigate");
            loadPage(url);
        }
    });

});

async function loadPage(url) {
    console.log(`🚀 loadPage() appelé pour : ${url}`);

    const pageContent = document.getElementById("page-content");

    try {
        // ✅ Générer et stabiliser la page cible AVANT la transition
        // console.log(`📸 Préparation de la page cible : ${url}`);
        await generatePageSnapshot(url);

        // ✅ Création et configuration de `tempContainer`
        let tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.top = "0";
        tempContainer.style.left = "100%"; // Départ hors écran
        tempContainer.style.width = "100%";
        tempContainer.style.height = "100%";
        tempContainer.style.zIndex = "100";
        tempContainer.style.backgroundColor = "var(--custom-light)";
        

        document.body.appendChild(tempContainer);

        // ✅ Appliquer le snapshot avant la transition
        applySnapshot(tempContainer, url);      

        // ✅ Animation de transition
        gsap.to(tempContainer, {
            left: "0%",
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                pageContent.innerHTML = tempContainer.innerHTML;
                executeScripts(tempContainer);
                tempContainer.remove();
                window.history.pushState({}, "", url);
                console.log(`✅ Transition terminée vers ${url}`);
            }
        });        
        
    } catch (error) {
        console.error("❌ Erreur lors du chargement de la page :", error);
    }
    window.addEventListener("popstate", function () {
        console.log("↩️ Retour en arrière détecté !");
        loadPage(location.href);
    });    
}

export async function generatePageSnapshot(url) {
    // console.log(`📸 Génération et stabilisation de la page en arrière-plan : ${url}`);

    let iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.visibility = "hidden";
    iframe.style.width = "0";
    iframe.style.height = "0";
    document.body.appendChild(iframe);

    iframe.src = new URL(url, window.location.origin).href;
    // console.log("🔍 Chargement de l'iframe avec URL :", iframe.src);

    return new Promise((resolve, reject) => {
        iframe.onload = async () => {
            try {
                // let doc = iframe.contentDocument || iframe.contentWindow.document;
                let doc = iframe.contentWindow.document;
                let iframeWindow = iframe.contentWindow;

                if (!doc) {
                    throw new Error("❌ ERREUR : DOM de l'iframe inaccessible !");
                }

                // console.log("📜 DOM de l’iframe récupéré avec succès !");

                // ✅ Charger dynamiquement les styles CSS
                await loadCSSForPage(doc, url);

                // ✅ Vérifier quels fichiers CSS sont chargés dans `<head>`
                // console.log("📋 Liste des fichiers CSS actuellement dans `<head>` :");
                // document.querySelectorAll("link[rel='stylesheet']").forEach((link, index) => {
                //     console.log(`  ${index + 1}. ${link.href}`);
                // });
                
                // ✅ Détecter TOUS les scripts (modules et classiques)
                let scripts = [...doc.head.querySelectorAll("script"), ...doc.body.querySelectorAll("script")];
                // console.log(`📜 ${scripts.length} scripts détectés dans head et body :`);

                // scripts.forEach((script, index) => {
                //     console.log(`  ${index + 1}. ${script.src || "[inline script]"} (${script.type || "text/javascript"})`);
                // });

                // ✅ Exécuter chaque script AVANT la capture
                for (let script of scripts) {
                    await executeScriptInIframe(script, iframeWindow);
                }
                // console.log("⏳ Pause de 200ms pour assurer l'application des styles JS...");
                await new Promise(res => setTimeout(res, 200));
                
                let pageContentElement = doc.getElementById("page-content");

                if (!pageContentElement) {
                    throw new Error("❌ Erreur : `#page-content` introuvable dans la page chargée !");
                }

                // console.log("✅ `#page-content` trouvé, capture en cours...");

                let pageSnapshot = pageContentElement.cloneNode(true);
                pageSnapshot.querySelectorAll("*").forEach(el => {
                    const computedStyles = window.getComputedStyle(el);
                    el.setAttribute("style", computedStyles.cssText);
                });

                localStorage.setItem("pageSnapshot", pageSnapshot.outerHTML);
                // console.log("✅ Page figée et stockée avec scripts et styles appliqués !");

                document.body.removeChild(iframe);
                resolve(pageSnapshot.outerHTML);
            } catch (error) {
                console.error("❌ Erreur lors de la capture de la page :", error);
                reject(error);
            }
        };
    });
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

async function executeScripts(container) {
    console.log("🔄 Exécution des scripts de la nouvelle page...");

    let scripts = container.querySelectorAll("script");

    for (let script of scripts) {
        let newScript = document.createElement("script");

        if (script.src) {
            // ✅ Recharger les scripts avec un `src`
            newScript.src = script.src;
            newScript.async = false;
            if (script.type === "module") newScript.type = "module";
            document.body.appendChild(newScript);

            await new Promise((resolve) => {
                newScript.onload = () => {
                    console.log(`✅ Script chargé : ${script.src}`);
                    resolve();
                };
                newScript.onerror = () => {
                    console.error(`❌ Erreur de chargement du script ${script.src}`);
                    resolve();
                };
            });
        } else {
            // ✅ Exécuter les scripts inline
            newScript.textContent = script.textContent;
            if (script.type === "module") newScript.type = "module";
            document.body.appendChild(newScript);
            console.log("✅ Script inline exécuté.");
        }
    }

    console.log("✅ Tous les scripts ont été exécutés.");
}
