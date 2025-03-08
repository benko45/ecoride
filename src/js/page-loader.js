import { saveCurrentPageState, applyStoredStyles, selectImage } from "./functions.js";

document.addEventListener("DOMContentLoaded", function () {
    // console.log("✅ Page-loader.js chargé !");
    
    //Détection des clics sur les liens de navigation
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("a");
        if (target) {
            event.preventDefault();
            const url = target.href;
            // 🔹 Sauvegarde de l’état actuel de la page avant la transition
            saveCurrentPageState();
            loadPage(url);
        }
    });
    // Détection des clics sur les boutons de navigation dynamique
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("[data-navigate]");
        if (target) {
            event.preventDefault();
            const url = target.getAttribute("data-navigate");
            // 🔹 Sauvegarde de l’état actuel de la page avant la transition
            saveCurrentPageState();
            loadPage(url);
        }
    });
});
//v0
// async function loadPage(url) {
//     console.log(`🚀 Chargement de la page : ${url}`);
//     const pageContent = document.getElementById("page-content");
    
//     // Créer un conteneur temporaire pour la nouvelle page
//     let tempContainer = document.createElement("div");
//     tempContainer.style.position = "absolute";
//     tempContainer.style.top = "0";
//     tempContainer.style.left = "100%"; // Départ hors écran (droite)
//     tempContainer.style.width = "100%";
//     tempContainer.style.height = "100%";
//     tempContainer.style.zIndex = "100";
//     tempContainer.style.backgroundColor = "var(--custom-light)"; // Fixer le background
//     document.body.appendChild(tempContainer);

//     try {
//         const response = await fetch(url);
//         if (!response.ok) throw new Error(`❌ Erreur HTTP ${response.status}`);

//         const html = await response.text();
//         const parser = new DOMParser();
//         const doc = parser.parseFromString(html, "text/html");
//         tempContainer.innerHTML = doc.getElementById("page-content").innerHTML;

//         removeOldCSS();
//         await loadCSS(url);

//         let scriptToExecute = null;
//         if (url.includes("index.html") || url === "/" || url === "/ecoride/") {
//             scriptToExecute = "index.js";
//         } else if (url.includes("choosing-address.html")) {
//             scriptToExecute = "choosing-address.js";
//         } else if (url.includes("choosing-arrival-address.html")) {
//             scriptToExecute = "choosing-arrival-address.js";
//         } else if (url.includes("choosing-date.html")) {
//             scriptToExecute = "choosing-date.js";
//         } else if (url.includes("choosing-passengers.html")) {
//             scriptToExecute = "choosing-passengers.js";
//         }

//         // Charger dynamiquement le script AVANT la transition
//         if (scriptToExecute) {
//             console.log(`✅ Chargement du script : ${scriptToExecute}`);
//             await importDynamicScript(url);
//         }
        
//         // Animation GSAP - La nouvelle page entre en recouvrant l'ancienne
//         let tl = gsap.timeline();
//         tl.to(tempContainer, { x: "-100%", duration: 3, ease: "power2.inOut" })
//           .add(() => {
//               pageContent.innerHTML = tempContainer.innerHTML;
//               pageContent.style.backgroundColor = tempContainer.style.backgroundColor; // Assurer la bonne couleur
//               tempContainer.remove();
//               history.pushState(null, null, url);
//               console.log(`✅ URL mise à jour : ${url}`);
              
//               // Vérification avant d'exécuter selectImage() et ensureBootstrapIcons
//               setTimeout(() => {
//                   if (document.querySelector(".responsive-img")) {
//                       console.log("🔄 Recalibrage de l'image après stabilisation du layout...");
//                       document.body.offsetHeight;
//                       selectImage();
//                       ensureBootstrapIcons();
//                   } else {
//                       console.warn("⚠️ Aucune image responsive trouvée, selectImage() annulé.");
//                   }
//               }, 100);
//           });
//     } catch (error) {
//         console.error("❌ Erreur lors du chargement de la page :", error);
//     }
// }
//v1
// async function loadPage(url) {
//     console.log(`🚀 Chargement de la page : ${url}`);
//     const pageContent = document.getElementById("page-content");
    
//     // Créer un conteneur temporaire pour la nouvelle page
//     let tempContainer = document.createElement("div");
//     tempContainer.style.position = "absolute";
//     tempContainer.style.top = "0";
//     tempContainer.style.left = "100%"; // Départ hors écran (droite)
//     tempContainer.style.width = "100%";
//     tempContainer.style.height = "100%";
//     tempContainer.style.zIndex = "100";
//     tempContainer.style.backgroundColor = "var(--custom-light)"; // Fixer le background
//     document.body.appendChild(tempContainer);

//     try {
//         const response = await fetch(url);
//         if (!response.ok) throw new Error(`❌ Erreur HTTP ${response.status}`);

//         const html = await response.text();
//         const parser = new DOMParser();
//         const doc = parser.parseFromString(html, "text/html");
//         tempContainer.innerHTML = doc.getElementById("page-content").innerHTML;

//         removeOldCSS();
//         await loadCSS(url);

//         let scriptToExecute = null;
//         let isReturningToIndex = url.includes("index.html") || url === "/" || url === "/ecoride/";
//         if (isReturningToIndex) {
//             scriptToExecute = "index.js";
//         } else if (url.includes("choosing-address.html")) {
//             scriptToExecute = "choosing-address.js";
//         } else if (url.includes("choosing-arrival-address.html")) {
//             scriptToExecute = "choosing-arrival-address.js";
//         } else if (url.includes("choosing-date.html")) {
//             scriptToExecute = "choosing-date.js";
//         } else if (url.includes("choosing-passengers.html")) {
//             scriptToExecute = "choosing-passengers.js";
//         }

//         // Charger dynamiquement le script AVANT la transition
//         if (!isReturningToIndex && scriptToExecute) {
//             console.log(`✅ Chargement du script : ${scriptToExecute}`);
//             await importDynamicScript(url);
//         }
        
//         // Attendre la fin de l’insertion et forcer le recalcul des styles
//         requestAnimationFrame(() => {
//             console.log("🔄 Application des styles enregistrés à tempContainer...");
//             let isReturningToIndex = url.includes("index.html") || url === "/" || url === "/ecoride/";
//             applyStoredStyles(tempContainer, (scriptName) => {
//                 if (scriptName) {
//                     console.log(`🚀 Exécution forcée de ${scriptName} après application des styles...`);
//                     importDynamicScript(scriptName).then(() => {
//                         console.log(`✅ ${scriptName} appliqué avec succès !`);
//                     });
//                 }
//             }, "index.js", isReturningToIndex);
            
            
//             document.body.offsetHeight; // Forcer le recalcul du layout

//             let tl = gsap.timeline();
//             tl.to(tempContainer, { x: "-100%", duration: 3, ease: "power2.inOut" })
//               .add(() => {
//                   pageContent.innerHTML = tempContainer.innerHTML;
//                   pageContent.style.backgroundColor = tempContainer.style.backgroundColor; // Assurer la bonne couleur
//                   tempContainer.remove();
//                   history.pushState(null, null, url);
//                   console.log(`✅ URL mise à jour : ${url}`);
                  
//                   // Vérification avant d'exécuter selectImage() et ensureBootstrapIcons
//                   setTimeout(() => {
//                       if (document.querySelector(".responsive-img")) {
//                           console.log("🔄 Recalibrage de l'image après stabilisation du layout...");
//                           document.body.offsetHeight;
//                           selectImage();
//                           ensureBootstrapIcons();
//                       } else {
//                           console.warn("⚠️ Aucune image responsive trouvée, selectImage() annulé.");
//                       }
//                   }, 100);
                  
//                   // ✅ Exécuter index.js seulement au retour vers l'index
//                   if (isReturningToIndex) {
//                       console.log(`🔄 Réexécution de index.js après retour.`);
//                       importDynamicScript("index.js").then(() => {
//                           console.log("✅ index.js appliqué après retour");
//                           setTimeout(() => {
//                               console.log("🔄 Sécurisation du recalcul d'image après index.js");
//                               selectImage();
//                           }, 50);
//                       });
//                   }
//               });
//         });
//     } catch (error) {
//         console.error("❌ Erreur lors du chargement de la page :", error);
//     }
// }
async function loadPage(url) {
    console.log(`🚀 Chargement de la page : ${url}`);
    const pageContent = document.getElementById("page-content");

    // Créer un conteneur temporaire pour la nouvelle page
    let tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.top = "0";
    tempContainer.style.left = "100%";
    tempContainer.style.width = "100%";
    tempContainer.style.height = "100%";
    tempContainer.style.zIndex = "100";
    tempContainer.style.backgroundColor = "var(--custom-light)";
    document.body.appendChild(tempContainer);

    let isReturningToIndex = url.includes("index.html") || url === "/" || url === "/ecoride/";

    try {
        if (isReturningToIndex) {
            console.log("📌 Retour vers index.html, récupération de l'état enregistré...");
            applyStoredStyles(tempContainer, () => {
                console.log("📌 `aps0` appliqué, tempContainer est bien rempli avec index.html.");
            }, "index.js");
        } else {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`❌ Erreur HTTP ${response.status}`);

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            tempContainer.innerHTML = doc.getElementById("page-content").innerHTML;
        }

        removeOldCSS();
        await loadCSS(url);

        let scriptToExecute = null;
        if (isReturningToIndex) {
            scriptToExecute = "index.js";
        } else if (url.includes("choosing-address.html")) {
            scriptToExecute = "choosing-address.js";
        } else if (url.includes("choosing-arrival-address.html")) {
            scriptToExecute = "choosing-arrival-address.js";
        } else if (url.includes("choosing-date.html")) {
            scriptToExecute = "choosing-date.js";
        } else if (url.includes("choosing-passengers.html")) {
            scriptToExecute = "choosing-passengers.js";
        }

        if (!isReturningToIndex && scriptToExecute) {
            console.log(`✅ Chargement du script : ${scriptToExecute}`);
            await importDynamicScript(url);
        }

        requestAnimationFrame(() => {
            console.log("🔄 Application des styles enregistrés à tempContainer...");
            applyStoredStyles(tempContainer, (scriptName) => {
                if (scriptName) {
                    console.log(`🚀 Exécution forcée de ${scriptName} après application des styles...`);
                    importDynamicScript(scriptName).then(() => {
                        console.log(`✅ ${scriptName} appliqué avec succès !`);
                    });
                }
            }, scriptToExecute);

            document.body.offsetHeight;

            let tl = gsap.timeline();
            tl.to(tempContainer, { x: "-100%", duration: 0.5, ease: "power2.inOut" })
              .add(() => {
                  pageContent.innerHTML = tempContainer.innerHTML;
                  pageContent.style.backgroundColor = tempContainer.style.backgroundColor;
                  tempContainer.remove();
                  history.pushState(null, null, url);
                  console.log(`✅ URL mise à jour : ${url}`);

                  setTimeout(() => {
                      console.log("🔄 Vérification de l'image après la transition...");
                      selectImage();
                      ensureBootstrapIcons();
                  }, 50);

                  if (isReturningToIndex) {
                      console.log(`🔄 Réexécution de index.js après retour.`);
                      importDynamicScript("index.js").then(() => {
                          console.log("✅ index.js appliqué après retour");
                          setTimeout(() => {
                              console.log("🔄 Sécurisation du recalcul d'image après index.js");
                              selectImage();
                          }, 50);
                      });
                  }
              });
        });
    } catch (error) {
        console.error("❌ Erreur lors du chargement de la page :", error);
    }
}















function removeOldCSS() {
    document.querySelectorAll("link[rel='stylesheet']").forEach(link => {
        if (link.href.includes("choosing-")) { // Supprime uniquement les styles liés aux pages dynamiques
            console.log(`❌ Suppression du CSS : ${link.href}`);
            link.remove();
        }
    });
}

async function loadCSS(url) {
    return new Promise((resolve, reject) => {
        let cssFile = "";
        const prefix = window.location.hostname === "benko45.github.io" ? "/ecoride/" : "";

        // 🔹 Déterminer quel fichier CSS charger selon l'URL
        if (url.includes("choosing-address.html")) {
            cssFile = `${prefix}public/css/choosing-address.css`;
        } else if (url.includes("choosing-arrival-address.html")) {
            cssFile = `${prefix}public/css/choosing-arrival-address.css`;
        } else if (url.includes("choosing-date.html")) {
            cssFile = `${prefix}public/css/choosing-date.css`;
        } else if (url.includes("choosing-passengers.html")) {
            cssFile = `${prefix}public/css/choosing-passengers.css`;
        } else if (url.includes("index.html")) {
            cssFile = `${prefix}public/css/main.css`;
        }
        
        if (!cssFile) {
            console.log("⚠️ Aucun fichier CSS trouvé pour cette page.");
            return resolve();
        }

        // Vérifier si le CSS est déjà chargé
        if (document.querySelector(`link[href="${cssFile}"]`)) {
            console.log(`🔹 CSS déjà chargé : ${cssFile}`);
            return resolve();
        }

        // Ajouter le fichier CSS dynamiquement
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssFile;
        link.onload = () => {
            console.log(`✅ CSS chargé : ${cssFile}`);
            resolve();
        };
        link.onerror = () => {
            console.error(`❌ Erreur de chargement CSS : ${cssFile}`);
            reject();
        };

        document.head.appendChild(link);
    });
}

async function importDynamicScript(url) {
    try {
        const prefix = window.location.hostname === "benko45.github.io" ? "/ecoride/" : "/";

        // 🔹 Déterminer quel fichier JS importer selon l'URL
        if (url.includes("choosing-address.html")) {
            const module = await import(`${prefix}src/js/choosing-address.js`);
            module.initChoosingAddress();
            console.log("✅ `choosing-address.js` chargé !");
        } else if (url.includes("choosing-arrival-address.html")) {
            const module = await import(`${prefix}src/js/choosing-arrival-address.js`);
            module.initChoosingArrivalAddress();
            console.log("✅ `choosing-arrival-address.js` chargé !");
        } else if (url.includes("choosing-date.html")) {
            const module = await import(`${prefix}src/js/choosing-date.js`);
            module.initChoosingDate();
            console.log("✅ `choosing-date.js` chargé !");
        } else if (url.includes("choosing-passengers.html")) {
            const module = await import(`${prefix}src/js/choosing-passengers.js`);
            module.initChoosingPassengers();
            console.log("✅ `choosing-passengers.js` chargé !");
        } else if (url.includes("index.html")) {
            const module = await import(`${prefix}src/js/index.js`);
            module.initIndex();
            console.log("✅ `index.js` chargé !");
        }
        
    } catch (error) {
        console.error("❌ Erreur lors du chargement du script :", error);
    }
    console.log("🔹 Fin de importDynamicScript");
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
