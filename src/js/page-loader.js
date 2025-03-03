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
    // const currentURL = window.location.pathname;

    // console.log(`🚀 Début de la transition : ${currentURL} → ${url}`);

    let exitDirection = "-100%";  // Sortie par la gauche (par défaut)
    let enterDirection = "100%";  // Entrée par la droite (par défaut)

    if (url.includes("choosing-address.html")) {
        exitDirection = "-100%"; // Sort par la gauche
        enterDirection = "100%"; // Entre par la droite
    } else if (url.includes("index.html")) {
        exitDirection = "100%"; // Sort par la droite
        enterDirection = "-100%"; // Entre par la gauche
    }

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
                    pageContent.innerHTML = newContent;

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

                    console.log("✅ Nouvelle page chargée avec transition !");

                    // 🔄 Recharger les scripts et styles après la transition
                    reloadScripts(url);

                })
                .catch(error => console.error("❌ Erreur lors du chargement de la page :", error));
        }
    });
}

function reloadScripts(url) {
    // 📌 Extraire le nom de la page cible (sans `.html`)
    let pageName = url.split("/").pop().replace(".html", "");

    // Détermine le bon chemin en fonction de l'environnement (local ou GitHub Pages)
    const scriptPath = window.location.hostname === "benko45.github.io"
        ? `/ecoride/src/js/${pageName}.js`
        : `/src/js/${pageName}.js`;

    console.log(`🔄 Rechargement du script : ${scriptPath}`);

    const moduleScript = document.createElement("script");
    moduleScript.src = scriptPath;
    moduleScript.type = "module";
    moduleScript.defer = true;
    document.body.appendChild(moduleScript);
}

