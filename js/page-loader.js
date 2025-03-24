import { initNavigation, navigation, normalizeUrl, setupPopstateHandler } from "./spa-navigation.js";
/******************************************************/
/*            Gestion de la Navigation                */
/******************************************************/
const expectedPages = [
    "index.html",
    "choosing-address.html",
    "choosing-arrival-address.html",
    "choosing-date.html",
    "choosing-passengers.html"
  ];
  
  // Si la page HTML a été chargée directement sans passer par index.html, on redirige
  const currentPath = window.location.pathname.split("/").pop();
  if (expectedPages.includes(currentPath) && currentPath !== "index.html") {
    console.warn("🚫 Page HTML accédée directement : redirection vers index.html");
    window.location.replace("index.html");
  }
  
initNavigation();
setupPopstateHandler(loadPage);
/******************************************************/

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        console.warn("♻️ Navigation via cache (bfcache) détectée. Rechargement forcé.");
        location.reload();
    }
});  

document.addEventListener("DOMContentLoaded", function () {
    // Interception globale des liens <a>
    document.body.addEventListener("click", function (event) {
        const link = event.target.closest("a");

        if (link && link.href.startsWith(window.location.origin)) {
            const isExternal = link.target === "_blank" || link.hasAttribute("download");
            const isHashLink = link.hash && link.pathname === window.location.pathname;

            if (!isExternal && !isHashLink) {
                event.preventDefault();
                const urlPathname = new URL(link.href).pathname.split("/").pop();
                console.log(`🔗 Interception <a> SPA : ${urlPathname}`);
                loadPage(urlPathname);
            }
        }
    });

    document.body.addEventListener("click", function (event) {
        let el = event.target;
        let shouldNavigate = true;

        while (el && el !== document.body) {
            if (el.id === "bouncing-arrows") {
                shouldNavigate = false; // ne pas naviguer
                break;
            }
            if (el.hasAttribute("data-navigate")) {
                break; // on a trouvé un élément navigable
            }
            el = el.parentElement;
        }

        if (shouldNavigate && el && el.hasAttribute("data-navigate")) {
            event.preventDefault();
            console.log(`🔗 Lien data-navigate : ${el.getAttribute("data-navigate")}`);
            loadPage(el.getAttribute("data-navigate"));
        }
    });
});

async function loadPage(url, fromBackButton = false) {

    console.log(`🚀 loadPage() appelé pour : ${url}, retour =`, fromBackButton);
    console.trace(); // 💣 TRACE

    const expectedPages = [
        "index.html",
        "choosing-address.html",
        "choosing-arrival-address.html",
        "choosing-date.html",
        "choosing-passengers.html",
      ];
      
      if (!expectedPages.includes(url)) {
        console.warn("⚠️ URL inattendue reçue dans loadPage():", url);
        console.trace(); // Voir qui a demandé ce loadPage()
      }
      
    if (!url) {
        console.warn("⚠️ Aucune URL de retour trouvée, retour à la page d'accueil.");
        url = "/";
    }
    const pageContent = document.getElementById("page-content");
    try {
        let { snapshot, styles } = await generatePageSnapshot(url);
        let tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.top = "0";
        tempContainer.style.left = "100%";
        tempContainer.style.width = "100%";
        tempContainer.style.height = "100%";
        tempContainer.style.zIndex = "100";
        tempContainer.style.backgroundColor = "var(--custom-light)";
        tempContainer.innerHTML = snapshot;
        document.body.appendChild(tempContainer);
        
        await loadCSSForPage(styles);
        scriptToImport(url);

        gsap.to(tempContainer, {
            left: "0%",
            duration: 1,
            ease: "power2.inOut",
            onComplete: async () => {
                pageContent.innerHTML = tempContainer.innerHTML;
                tempContainer.remove();
                navigation(url, fromBackButton);
                scriptToImport(url);
                console.log(`✅ Transition terminée vers ${url}`);
            }
        });

    } catch (error) {
        console.error("❌ Erreur lors du chargement de la page :", error);
    }
}

async function generatePageSnapshot(url) {
    console.log(`📸 Génération et stabilisation de la page en arrière-plan : ${url}`);

    try {
        // let response = await fetch(`${url}?_=${Date.now()}`, { cache: "no-store" });
        const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";

        console.log("🔄 generatePageSnapshot() : url = ", url);
        // let response = await fetch(url, { cache: "no-store" });
        let response = await fetch(`${prefix}/${url}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        let htmlText = await response.text();
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlText;

        let pageContentElement = tempDiv.querySelector("#page-content");
        // console.log("🧪 generatePageSnapshot() : Contenu HTML chargé :", tempDiv.innerHTML);
        if (!pageContentElement) throw new Error( `❌ #page-content introuvable dans la page chargée !`);

        // 🔹 Correction : extraire uniquement le contenu interne de `#page-content`
        let snapshot = pageContentElement.cloneNode(true);
        snapshot.removeAttribute("id"); // Enlève l'ID pour éviter un conflit lors de l'insertion

        // console.log("✅ Contenu extrait sans doubler #page-content.");

        // 🔹 Mettre à jour le champ de données dans le snapshot
        if (window.location.pathname.includes("choosing-address")
                || window.location.pathname.includes("choosing-arrival-address")
                || window.location.pathname.includes("choosing-passengers")
                || url.includes("choosing-passengers")) {
                    updateSnapshotData(snapshot);
        } else {
            console.log("🔄 updateSelectedAddressInSnapshot() n'a pas été appliquée");
        }

        let styles = Array.from(tempDiv.querySelectorAll("link[rel='stylesheet']"));

        return { snapshot: snapshot.innerHTML, styles };
    } catch (error) {
        console.error("❌ Erreur lors de la capture de la page :", error);
        return { snapshot: "", styles: [] };
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

function importScript(scriptName, initFunctionName = null, initParam = null) {
    const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";

    console.log(`📦 Import dynamique de ${scriptName}.js...`);

    // Supprime l'ancien script s'il est déjà chargé
    document.querySelector(`script[src*='${scriptName}']`)?.remove();

    import(`${prefix}/js/${scriptName}.js`)
        .then(module => {
            if (initFunctionName && typeof module[initFunctionName] === "function") {
                module[initFunctionName](initParam);
                console.log(`✅ ${initFunctionName}() appelée depuis ${scriptName}.js`);
            } else if (initFunctionName) {
                console.warn(`⚠️ ${initFunctionName}() non trouvée dans ${scriptName}.js`);
            }
        })
        .catch(error => {
            console.error(`❌ Erreur lors de l'import de ${scriptName}.js :`, error);
        });
}

function scriptToImport(url) {
    console.log("📜 scriptToImport() appelé avec :", url);

    if(url.includes("index")) {
        importScript("index", "initIndex");
    } else if (url.includes("choosing-address")) {
        importScript("choosing-address", "initChoosingAddress", "choosing-address");
    } else if (url.includes("choosing-arrival-address")) {
        importScript("choosing-address", "initChoosingAddress", "choosing-arrival-address");
    } else if(url.includes("choosing-date")) {
        importScript("choosing-date", "initChoosingDate");
    } else if(url.includes("choosing-passengers")) {
        importScript("choosing-passengers", "initChoosingPassengers");
    }
}

/**
 * Met à jour la valeur du champ `selected-departure-address` dans le snapshot avant la transition.
 * @param {HTMLElement} tempDiv - Conteneur temporaire où la page est chargée avant le snapshot.
 */
function updateSnapshotData(tempDiv) {
    const selectedDepartureAddress = localStorage.getItem('selectedDepartureAddress') || "Départ";
    const selectedArrivalAddress = localStorage.getItem('selectedArrivalAddress') || "Arrivée";
    const selectedPassengers = localStorage.getItem('selectedPassengers') || "1";

    const departureElement = tempDiv.querySelector('#selected-departure-address');
    const arrivalElement = tempDiv.querySelector('#selected-arrival-address');
    const passengersElement = tempDiv.querySelector('#passengers-nb');

    if (departureElement) {
        departureElement.textContent = selectedDepartureAddress;
    }

    if (arrivalElement) {
        arrivalElement.textContent = selectedArrivalAddress;
    }

    if (passengersElement) {
        passengersElement.textContent = selectedPassengers;
    }
}





