import { applyDynamicStyles, selectImage } from "./functions.js";

// document.body.addEventListener("click", async (event) => {
//     setTimeout(async () => {
//         let dropdown = document.querySelector(".dropdown");
//         if (!dropdown) {
//             console.warn("⚠️ `.dropdown` a disparu après un clic sur :", event.target);
//             console.trace();
//             debugger;

//             // 🔄 Vérifier si `index.js` est déjà en cours de rechargement
//             if (document.querySelector("script[data-reloading='true']")) {
//                 console.log("⚠️ `index.js` est déjà en cours de rechargement...");
//                 return;
//             }

//             // 🔄 Recharger `index.js` dynamiquement
//             let existingScript = document.querySelector("script[src='src/js/index.js']");
//             if (existingScript) {
//                 console.log("🔄 Suppression de l'ancien script `index.js`...");
//                 existingScript.remove();
//             }

//             let newScript = document.createElement("script");
//             newScript.src = "src/js/index.js";
//             newScript.setAttribute("data-reloading", "true");

//             newScript.onload = () => {
//                 console.log("✅ `index.js` rechargé avec succès !");
//                 newScript.removeAttribute("data-reloading"); // Supprimer l'attribut après chargement
//             };

//             newScript.onerror = () => console.error("❌ Échec du rechargement de `index.js`.");

//             document.body.appendChild(newScript);
//         }
//     }, 50);
// });

// document.body.addEventListener("click", (event) => {
//     setTimeout(() => {
//         let dropdown = document.querySelector(".dropdown");
//         if (!dropdown) {
//             console.warn("⚠️ `.dropdown` a disparu après un clic sur :", event.target);
//             console.trace(); // 🔍 Voir l'origine exacte de la suppression
//             // debugger; // 🛑 Pause pour analyse dans DevTools
//         }
//     }, 50);
// });

// const trackDropdownChanges = new MutationObserver(mutations => {
//     mutations.forEach(mutation => {
//         mutation.removedNodes.forEach(node => {
//             if (node.matches && node.matches(".dropdown")) {
//                 console.error("⚠️ `.dropdown` a été supprimé avant `loadPage()` !");
//                 console.trace();  // 🔍 Affiche la pile d'exécution pour trouver le script responsable
//                 debugger; // 🛑 Pause pour inspection dans DevTools
//             }
//         });
//     });
// });

// trackDropdownChanges.observe(document.body, { childList: true, subtree: true });
// console.log("🔍 Surveillance activée pour détecter si `.dropdown` est supprimé avant `loadPage()`.");

// const observer = new MutationObserver(mutations => {
//     mutations.forEach(mutation => {
//         mutation.removedNodes.forEach(node => {
//             if (node.nodeType === 1 && node.matches(".dropdown")) {
//                 console.error("⚠️ `.dropdown` a été supprimé du DOM !");
//                 console.trace(); // 🔍 Voir quel script est responsable
//             }
//         });
//     });
// });

// observer.observe(document.body, { childList: true, subtree: true });
// console.log("🔍 Surveillance activée pour détecter si `.dropdown` est supprimé avant la transition.");

// const detectDropdown = new MutationObserver(() => {
//     let dropdown = document.querySelector(".dropdown");
//     if (dropdown) {
//         observer.observe(dropdown, { attributes: true, attributeFilter: ["style"] });
//         console.log("🔍 Surveillance activée pour détecter les changements de style sur `dropdown`.");
//         detectDropdown.disconnect(); // On arrête l'observation une fois qu'on a trouvé `.dropdown`
//     }
// });
// detectDropdown.observe(document.body, { childList: true, subtree: true });
 

// let dropdown = document.querySelector(".dropdown");

// const debugObserver = new MutationObserver(mutations => {
//     mutations.forEach(mutation => {
//         if (mutation.attributeName === "style") {
//             let dropdown = document.querySelector(".dropdown");
//             if (dropdown) {
//                 let computedStyle = window.getComputedStyle(dropdown);
//                 console.log("🕵️ `dropdown` a été modifié !");
//                 console.log(`   Nouvelle transformation : ${computedStyle.transform}`);
//                 console.log("   Modification détectée par :", mutation);
//                 console.trace();  // 🔍 Affiche la pile d'exécution pour identifier le script responsable
//             }
//         }
//     });
// });

// // ✅ Active la surveillance des modifications de `dropdown`
// if (dropdown) {
//     debugObserver.observe(dropdown, { attributes: true, attributeFilter: ["style"] });
//     console.log("🔍 Surveillance activée pour détecter les modifications de transformation sur `dropdown`.");
// }

// const transformObserver = new MutationObserver(mutations => {
//     mutations.forEach(mutation => {
//         if (mutation.attributeName === "style") {
//             let dropdown = document.querySelector(".dropdown");
//             if (dropdown) {
//                 let computedStyle = window.getComputedStyle(dropdown);
//                 console.log("🕵️ `dropdown` transform modifié !");
//                 console.log(`   Nouvelle transformation : ${computedStyle.transform}`);
//                 console.log("   Modification détectée par :", mutation);
//             }
//         }
//     });
// });

// if (dropdown) {
//     transformObserver.observe(dropdown, { attributes: true, attributeFilter: ["style"] });
//     console.log("🔍 Surveillance activée pour détecter les modifications de transformation sur `dropdown`.");
// }

// const trackDOMChanges = new MutationObserver(mutations => {
//     mutations.forEach(mutation => {
//         if (mutation.addedNodes.length || mutation.removedNodes.length) {
//             let dropdown = document.querySelector(".dropdown");
//             if (!dropdown) {
//                 console.warn("⚠️ `.dropdown` a disparu après une mise à jour du DOM !");
//                 console.trace();
//                 debugger;
//             }
//         }
//     });
// });

// trackDOMChanges.observe(document.body, { childList: true, subtree: true });
// console.log("🔍 Surveillance activée pour détecter les mises à jour du DOM qui affectent `.dropdown`.");

// setInterval(() => {
//     let dropdown = document.querySelector(".dropdown");
//     if (dropdown) {
//         let computedStyle = window.getComputedStyle(dropdown);
//         console.log(`🔍 Transformation actuelle de dropdown : ${computedStyle.transform}`);
//     }
// }, 500);

// console.log("🔍 Surveillance active pour détecter les changements de transformation sur `dropdown`.");
 
document.addEventListener("DOMContentLoaded", function () {

    // const deletionObserver = new MutationObserver(mutations => {
    //     mutations.forEach(mutation => {
    //         mutation.removedNodes.forEach(node => {
    //             if (node.matches && node.matches(".dropdown")) {
    //                 console.error("⚠️ `.dropdown` a été supprimé avant la transition !");
    //                 console.trace(); // 🔍 Voir l'origine exacte
    //                 // debugger; // 🛑 Met le script en pause dans DevTools
    //             }
    //         });
    //     });
    // });
    
    // deletionObserver.observe(document.body, { childList: true, subtree: true });
    // console.log("🔍 Surveillance activée pour détecter si `.dropdown` est supprimé avant `loadPage()`.");
    
    // ✅ Détection des clics sur les liens de navigation
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("a");
        if (target) {
            event.preventDefault();
            const url = target.href;

            // ✅ Vérification du dropdown avant l'appel de loadPage()
            let dropdown = document.querySelector(".dropdown");
            if (dropdown) {
                let computedStyle = window.getComputedStyle(dropdown);
                console.log("🕵️ Vérification du `dropdown` AVANT l'appel de `loadPage()` :");
                console.log(`   Transform : ${computedStyle.transform}`);
            } else {
                console.warn("⚠️ `dropdown` introuvable!");
            }

            loadPage(url);
        }
    });

    // ✅ Détection des clics sur les boutons de navigation dynamique
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("[data-navigate]");
        if (target) {
            event.preventDefault();
            const url = target.getAttribute("data-navigate");

            // ✅ Vérification du dropdown avant l'appel de loadPage()
            let dropdown = document.querySelector(".dropdown");
            if (dropdown) {
                let computedStyle = window.getComputedStyle(dropdown);
                console.log("🕵️ Vérification du `dropdown` AVANT l'appel de `loadPage()` :");
                console.log(`   Display : ${computedStyle.display}`);
                console.log(`   Opacity : ${computedStyle.opacity}`);
                console.log(`   Transform : ${computedStyle.transform}`);
            } else {
                console.warn("⚠️ `dropdown` introuvable!");
            }

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
        setTimeout(() => {
            let dropdown = document.querySelector(".dropdown");
            if (dropdown) {
                let computedStyle = window.getComputedStyle(dropdown);
                console.log("🎭 Vérification du `dropdown` après `applySnapshot()` :");
                console.log(`   Display : ${computedStyle.display}`);
                console.log(`   Visibility : ${computedStyle.visibility}`);
                console.log(`   Opacity : ${computedStyle.opacity}`);
                console.log(`   Transform : ${computedStyle.transform}`);
            } else {
                console.warn("⚠️ `dropdown` a été supprimé du DOM !");
            }
        }, 200);
        
        
        // ✅ Animation de transition
        gsap.to(tempContainer, {
            x: "-100%",
            duration: 0.5,
            ease: "power2.inOut",
            onStart: () => {
                let dropdown = document.querySelector(".dropdown");
                if (dropdown) {
                    let computedStyle = window.getComputedStyle(dropdown);
                    console.log("🕵️ Avant l'animation GSAP :");
                    console.log(`   Transform : ${computedStyle.transform}`);
                }
            },
            onComplete: () => {
                let dropdown = document.querySelector(".dropdown");
                if (dropdown) {
                    let computedStyle = window.getComputedStyle(dropdown);
                    console.log("🕵️ Après l'animation GSAP :");
                    console.log(`   Transform : ${computedStyle.transform}`);
                }
                pageContent.innerHTML = tempContainer.innerHTML;
                tempContainer.remove();
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
                let doc = iframe.contentDocument || iframe.contentWindow.document;
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
            } else {
                console.log(`🔗 Fichier CSS externe détecté : ${link.href} (pas modifié)`);
            }

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

export function applySnapshot(tempContainer) {
    console.log("🔄 Application du snapshot de la page...");
    
    const savedSnapshot = localStorage.getItem("pageSnapshot");

    if (!savedSnapshot) {
        console.warn("⚠️ Aucun snapshot enregistré trouvé.");
        return;
    }

    // ✅ Injecter le snapshot dans `tempContainer`
    tempContainer.innerHTML = savedSnapshot;
    // console.log("✅ Snapshot appliqué avec succès !");

    // ✅ Réappliquer les styles dynamiques après l’injection du snapshot
    setTimeout(() => {
        // console.log("🎨 Réapplication des styles dynamiques après transition...");
        document.querySelectorAll("*").forEach(el => {
            applyDynamicStyles(el);
        });
        // console.log("✅ Styles dynamiques réappliqués !");
    }, 100);
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
