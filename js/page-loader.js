import { initNavigation, navigation, normalizeUrl, setupPopstateHandler } from "./spa-navigation.js";




/******************************************************/
/*            Gestion de la Navigation                */
/******************************************************/
let _currentPage = "index"; // 📍 Page SPA actuellement affichée
export function getCurrentPage() {
    return _currentPage;
}
export function setCurrentPage(page) {
    _currentPage = page;
}
initNavigation();
setupPopstateHandler(loadPage);

/*****************************************************/
/*            Gestion des input data                 */
/*****************************************************/
export const tempData = {
    selectedDepartureAddress: null,
    selectedArrivalAddress: null,
    selectedDate: null,
    selectedPassengers: null
};

function applyTempDataToLocalStorage() {
    if (tempData.selectedDepartureAddress) {
        localStorage.setItem("selectedDepartureAddress", tempData.selectedDepartureAddress);
    }
    if(tempData.selectedArrivalAddress) {
        localStorage.setItem("selectedArrivalAddress", tempData.selectedArrivalAddress);
    }
    if (tempData.selectedDate) {
        localStorage.setItem("selectedDate", tempData.selectedDate);
    }
    if (tempData.selectedPassengers) {
        localStorage.setItem("selectedPassengers", tempData.selectedPassengers);
    }
    console.log("💾 Données temporaires transférées dans localStorage");
}

export function setTempData(key, value) {
    if (key in tempData) {
        tempData[key] = value;
    } else {
        console.warn(`❗ Clé inconnue dans tempData : ${key}`);
    }
}

export function resetTempData() {
    tempData.selectedDepartureAddress = null;
    tempData.selectedArrivalAddress = null;
    tempData.selectedDate = null;
    tempData.selectedPassengers = null;
    // console.log("🗑️ Données temporaires effacées");
}

/*****************************************************/
/*            Gestion du chargement de page          */
/*****************************************************/
window.addEventListener("pageshow", (event) => {
    // Ce bloc reste utile si on veut détecter un retour via bfcache
    console.log("📌 pageshow event", event.persisted ? "(restauré du cache)" : "(normal)");
    // location.reload();
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
                applyTempDataToLocalStorage();
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
            applyTempDataToLocalStorage();
            loadPage(el.getAttribute("data-navigate"));
        }
    });
});

async function loadPage(url, fromBackButton = false) {
    console.log(`🚀 loadPage() appelé pour : ${url}, retour =`, fromBackButton);
    console.trace(); // 💣 TRACE
    if (!url) {
        console.warn("⚠️ Aucune URL de retour trouvée, retour à la page d'accueil.");
        url = "/";
    }
    if (!isValidUrl(url)) {
        console.warn("⚠️ URL inattendue reçue dans loadPage():", url);
        console.trace(); // Voir qui a demandé ce loadPage()
    } 
    const pageContent = document.getElementById("page-content");
    generatePageSnapshot(url)
        .then(_prepareStyles)
        .then(tempContainer => pageTransition(url, tempContainer, pageContent, fromBackButton))
        .catch(err => console.error("Erreur :", err));
}

async function generatePageSnapshot(url) {
    console.log(`📸 Chargement du fragment de page : ${url}`);
    const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";
    console.log("🔗 generatePageSnapshot : Chemin :", `${prefix}${paths.fragments}${url}`);
    try {
        const htmlText = await _fetchFragmentHTML(url);
        const tempDiv =_createTempDiv(htmlText);
        const styles = _extractAndRemoveStyles(tempDiv);
        const snapshot = tempDiv.innerHTML;
        const preparedSnapshot = _prepareSnapshotContent(snapshot);
        return { snapshot: preparedSnapshot, styles };
    } catch (error) {
        console.error("❌ Erreur lors du chargement du fragment :", error);
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

function _importScript(scriptName, initFunctionName = null, initParam_1 = null) {
    const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";

    console.log(`📦 Import dynamique de ${scriptName}.js...`);

    // Supprime l'ancien script s'il est déjà chargé
    document.querySelector(`script[src*='${scriptName}']`)?.remove();

    import(`${prefix}${paths.js}${scriptName}.js`)
        .then(module => {
            if (initFunctionName && typeof module[initFunctionName] === "function") {
                module[initFunctionName](initParam_1);
                console.log(`✅ ${initFunctionName}() appelée depuis ${scriptName}.js`);
            } else if (initFunctionName) {
                console.warn(`⚠️ ${initFunctionName}() non trouvée dans ${scriptName}.js`);
            }
        })
        .catch(error => {
            console.error(`❌ Erreur lors de l'import de ${scriptName}.js :`, error);
        });
}

function importScript(url, container) {
    console.log("📜 importScript() appelé avec :", url);
    if(url.includes("index")) {
        _importScript("index", "initIndex", container);
    } else if (url.includes("choosing-address")) {
        _importScript("choosing-address", "initChoosingAddress", "choosing-address");
    } else if (url.includes("choosing-arrival-address")) {
        _importScript("choosing-address", "initChoosingAddress", "choosing-arrival-address");
    } else if(url.includes("choosing-date")) {
        _importScript("choosing-date", "initChoosingDate");
    } else if(url.includes("choosing-passengers")) {
        _importScript("choosing-passengers", "initChoosingPassengers");
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

function createTempContainer(snapshot) {
    let tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.top = "0";
    tempContainer.style.left = "100%";
    tempContainer.style.width = "100%";
    tempContainer.style.height = "100%";
    tempContainer.style.zIndex = "100";
    tempContainer.style.backgroundColor = "var(--custom-light)";
    tempContainer.innerHTML = window.policy.createHTML(snapshot);

    return tempContainer;
}

function forceImageReload(container) {
    container.querySelectorAll("img").forEach(img => {
        const src = img.getAttribute("src");
        if (src) img.setAttribute("src", src);
    });
}

function isValidUrl(url) {
    const expectedPages = [
        "index.html",
        "choosing-address.html",
        "choosing-arrival-address.html",
        "choosing-date.html",
        "choosing-passengers.html"
    ];
    return expectedPages.includes(url);
}

async function _prepareStyles(result) {
    const { snapshot, styles } = result;
    const tempContainer = createTempContainer(snapshot);
    forceImageReload(tempContainer);
    document.body.appendChild(tempContainer);
    await loadCSSForPage(styles);
    return tempContainer;
}

function pageTransition(url, tempContainer, pageContent, fromBackButton) {
    importScript(url, tempContainer);
    gsap.to(tempContainer, {
        left: "0%",
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
            pageContent.innerHTML = window.policy.createHTML(tempContainer.innerHTML);
            tempContainer.remove();
            navigation(url, fromBackButton);
            importScript(url);
            setCurrentPage(normalizeUrl(url).replace(".html", ""));
            console.log(`✅ Transition terminée vers ${url}`);
        }
    });
}

async function _fetchFragmentHTML(url) {
    const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";
    return fetch(`${prefix}${paths.fragments}${url}`, { cache: "no-store" })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response.text();
        });
}

function _createTempDiv(htmlText) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = window.policy.createHTML(htmlText);
    return tempDiv;
}

function _extractAndRemoveStyles(container) {
    const styles = Array.from(container.querySelectorAll("link[rel='stylesheet']"));
    styles.forEach(link => link.remove());
    return styles;
}

function _prepareSnapshotContent(snapshot) {
    const tempWrapper = document.createElement("div");
    tempWrapper.innerHTML = window.policy.createHTML(snapshot);
    const pageContentDiv = tempWrapper.querySelector("#page-content");
    if (pageContentDiv) pageContentDiv.removeAttribute("id");
    updateSnapshotData(tempWrapper);
    return tempWrapper.innerHTML;
}