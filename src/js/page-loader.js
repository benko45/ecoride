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

// Fonction pour charger une page avec AJAX + animation GSAP

async function loadPage(url) {
    console.log(`🚀 Début du chargement de la page : ${url}`);
    const pageContent = document.getElementById("page-content");

    try {
        // ✅ 1️⃣ Animation de sortie avec GSAP
        await gsap.to(pageContent, { opacity: 0, x: "-100%", duration: 0.5 });

        // ✅ 2️⃣ Supprimer les anciens styles CSS
        removeOldCSS();

        // ✅ 2️⃣ Préchargement de la nouvelle page
        const response = await fetch(url);
        if (!response.ok) throw new Error(`❌ Erreur HTTP ${response.status}`);

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // ✅ 3️⃣ Mise à jour du contenu
        pageContent.innerHTML = doc.getElementById("page-content").innerHTML;
        console.log("✅ Nouveau contenu inséré !");

        // ✅ 5️⃣ Charger dynamiquement le bon CSS
        await loadCSS(url);
        // setTimeout(() => { // Petite pause pour s'assurer que le CSS est bien chargé
        //     pageContent.offsetHeight; // ✅ Forcer un recalcul des styles
        // }, 100);
        // pageContent.offsetHeight; // ✅ Forcer un recalcul des styles

        // ✅ 4️⃣ Animation d’entrée avec GSAP
        await gsap.fromTo(pageContent, { opacity: 0, x: "100%" }, { opacity: 1, x: "0%", duration: 0.5 });

        // ✅ 5️⃣ Importation dynamique du bon script
        await importDynamicScript(url);

        // ✅ Force la mise à jour de l'image de fond
        setTimeout(() => {
            console.log(`🔍 URL actuelle après transition : ${window.location.pathname}`);
            if (window.location.pathname.includes("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("public/html/")) {
                console.log("✅ selectImage() exécuté pour index.html");
                selectImage();
            }
        }, 100); // Petite pause pour s'assurer que le DOM est bien mis à jour

        // ✅ 6️⃣ Mise à jour de l’historique
        history.pushState(null, null, url);
        console.log(`✅ URL mise à jour : ${url}`);

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

        // 🔹 Déterminer quel fichier CSS charger selon l'URL
        if (url.includes("choosing-address.html")) {
            cssFile = "public/css/choosing-address.css";
        } else if (url.includes("choosing-arrival-address.html")) {
            cssFile = "public/css/choosing-arrival-address.css";
        } else if (url.includes("choosing-date.html")) {
            cssFile = "public/css/choosing-date.css";
        } else if (url.includes("choosing-passengers.html")) {
            cssFile = "public/css/choosing-passengers.css";
        } else if (url.includes("index.html")) {
            cssFile = "public/css/main.css";
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
        if (url.includes("choosing-address.html")) {
            const module = await import("./choosing-address.js");
            module.initChoosingAddress();
            console.log("✅ `choosing-address.js` chargé !");
        } else if (url.includes("choosing-arrival-address.html")) {
            const module = await import("./choosing-arrival-address.js");
            module.initChoosingArrivalAddress();
            console.log("✅ `choosing-arrival-address.js` chargé !");
        } else if (url.includes(`choosing-date.html`)) {
            const module = await import("./choosing-date.js");
            module.initChoosingDate();
            console.log("✅ `choosing-date.js` chargé !");
        } else if (url.includes("choosing-passengers.html")) {
            const module = await import("./choosing-passengers.js");
            module.initChoosingPassengers();
            console.log("✅ `choosing-passengers.js` chargé !");
        } else if (url.includes("index.html")) {
            const module = await import("./index.js");
            module.initIndex();
            console.log("✅ `index.js` chargé !");
        }
    } catch (error) {
        console.error("❌ Erreur lors du chargement du script :", error);
    }
}