/******************************************************/
/*            Gestion de la Navigation                */
let isFirstNavigation = true;         
if (isFirstNavigation) {
    //initialisation de l'historique de navigation
    window.history.replaceState({}, "", "index.html");
    isFirstNavigation = false;
}
let position = "index.html"
/******************************************************/

document.addEventListener("DOMContentLoaded", function () {

    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("a");
        if (target) {
            event.preventDefault();
            const urlPathname = new URL(target.href).pathname.split("/").pop();
            loadPage(urlPathname);
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
            loadPage(el.getAttribute("data-navigate"));
        }
        
    });

    // Gestion des retours arrière
    window.addEventListener("popstate", function () {
        console.log("↩️ Retour en arrière détecté !");
        const path = new URL(location.href).pathname.replace(/^\//, "");
        if(position === "index.html") {
            if(isFirstNavigation) {
                position = path;
                loadPage(path, true);
            }
        } else {
            position = path;
            loadPage(path, true);
        }
    });
});

async function loadPage(url, fromBackButton = false) {

    console.log(`🚀 loadPage() appelé pour : ${url}`);
    const addressPage = url.includes("choosing-address")
            ? "choosing-address"
            : "choosing-arrival-address";

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
        scriptToImport(url, addressPage);

        gsap.to(tempContainer, {
            left: "0%",
            duration: 1,
            ease: "power2.inOut",
            onComplete: async () => {
                pageContent.innerHTML = tempContainer.innerHTML;
                tempContainer.remove();
                navigation(url, fromBackButton);
                scriptToImport(url, addressPage);
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

function scriptToImport(url, addressPage) {
    if(url.includes("index.html")) {
        importScript("index", "initIndex");
    } else if(url.includes(addressPage)) {
        importScript("choosing-address", "initChoosingAddress", addressPage);
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

function navigation(url, fromBackButton) {
    if (!fromBackButton) {
        if (isFirstNavigation) {
            window.history.replaceState({}, "", url); // index.html ou autre au tout début
            isFirstNavigation = false;
        } else {
            window.history.pushState({}, "", url); // à chaque navigation classique
        }
    }    
}



const historyLog = [];

function logHistoryEvent(action, path = location.pathname) {
    historyLog.push({ action, path, time: new Date().toLocaleTimeString() });
    console.clear();
    console.log("🧭 Historique SPA (dernier en bas) :");
    historyLog.forEach((entry, index) => {
        console.log(
            `${index + 1}. ${entry.time} — [${entry.action}] ${entry.path}`
        );
    });
}

// Intercepter les pushState et replaceState
(function () {
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;

    history.pushState = function (...args) {
        originalPush.apply(this, args);
        logHistoryEvent("pushState", args[2]); // args[2] = URL
    };

    history.replaceState = function (...args) {
        originalReplace.apply(this, args);
        logHistoryEvent("replaceState", args[2]);
    };
})();

// Intercepter les retours en arrière / avant
window.addEventListener("popstate", () => {
    logHistoryEvent("popstate");
});


