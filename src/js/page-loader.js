import { selectImage } from "./functions.js";

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

// ✅ Fonction pour charger une page avec AJAX + animation GSAP
async function loadPage(url) {
    console.log(`🚀 Début du chargement de la page : ${url}`);
    const pageContent = document.getElementById("page-content");

    // 🟢 1️⃣ Créer un conteneur temporaire pour charger la nouvelle page
    let tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.top = "0";
    tempContainer.style.left = "0"; 
    tempContainer.style.width = "100%";
    tempContainer.style.height = "100%";
    tempContainer.style.opacity = "0"; 
    tempContainer.style.zIndex = "100"; 
    document.body.appendChild(tempContainer);

    try {
        // ✅ 2️⃣ Préchargement de la nouvelle page
        const response = await fetch(url);
        if (!response.ok) throw new Error(`❌ Erreur HTTP ${response.status}`);

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // ✅ 3️⃣ Corriger dynamiquement les chemins des images
        doc.querySelectorAll("img").forEach(img => {
            if (img.getAttribute("data-src")) {
                img.setAttribute("src", img.getAttribute("data-src"));
            }
            if (img.getAttribute("data-srcset")) {
                img.setAttribute("srcset", img.getAttribute("data-srcset"));
            }
        });

        // ✅ 4️⃣ Insérer le nouveau contenu dans `tempContainer`
        tempContainer.innerHTML = doc.getElementById("page-content").innerHTML;

        // ✅ 5️⃣ Charger dynamiquement le CSS avant d'afficher la nouvelle page
        removeOldCSS();
        await loadCSS(url);

        // ✅ 6️⃣ Déterminer quel script doit être exécuté après la transition
        let scriptToExecute = null;
        if (url.includes("index.html") || url === "/" || url === "/ecoride/") {
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

        // ✅ 8️⃣ Rendre `tempContainer` immédiatement visible pour éviter le glitch
        tempContainer.style.opacity = "1";

        // ✅ 9️⃣ Animation de transition avec `gsap.timeline()`
        let tl = gsap.timeline();

        tl.set(tempContainer, { x: "100%" }) 
          .to(tempContainer, { x: "0%", duration: 0.5, ease: "power2.inOut" }) 
          .to(pageContent, { opacity: 0, x: "-50%", duration: 0.5, ease: "power2.inOut" }, "-=0.4") 
          .add(async () => {
              // ✅ 🔟 Remplacement propre du contenu
              pageContent.innerHTML = tempContainer.innerHTML;
              pageContent.style.opacity = "1"; 
              pageContent.style.transform = "translateX(0%)"; 

              // ✅ 🏁 Supprimer `tempContainer` proprement après la transition
              tempContainer.remove();

              // ✅ 📌 Charger dynamiquement le bon script après la transition
              if (scriptToExecute) {
                  console.log(`✅ Chargement du script : ${scriptToExecute}`);
                  await importDynamicScript(url);
              }

              // ✅ 🔄 Vérifier et recharger Bootstrap Icons
              setTimeout(ensureBootstrapIcons, 0);

              // ✅ 🔄 Mise à jour de l’historique de navigation
              history.pushState(null, null, url);
              console.log(`✅ URL mise à jour : ${url}`);
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
