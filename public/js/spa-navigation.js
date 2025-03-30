import { applyTempDataToLocalStorage, resetTempData } from "./handleData.js";
import { loadPage } from "./page-loader.js";

let isFirstNavigation = true;

let _currentPage = "index"; // 📍 Page SPA actuellement affichée
export function getCurrentPage() {
    return _currentPage;
}
export function setCurrentPage(page) {
    _currentPage = page;
}

/**
 * Initialise la navigation de la SPA.
 */
export function initNavigation() {
    const navEntry = performance.getEntriesByType("navigation")[0];

    if (navEntry?.type === "reload") {
        // ✅ Rechargement de page détecté
        console.log("🔄 Rechargement détecté — historique SPA réinitialisé");
        history.replaceState({}, "", "index.html");
        setCurrentPage("index");
        isFirstNavigation = false;
        return;
    }

    // Cas initial (chargement direct, pas reload)
    if (isFirstNavigation) {
        history.replaceState({}, "", "index.html");
        isFirstNavigation = false;
    }
}


export function listenToNavigation() {
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
                    window.__spaNavigated = true;
                    loadPage(urlPathname, false);
                    navigation(urlPathname);
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
                const page = el.getAttribute("data-navigate");
                console.log(`🔗 Lien data-navigate : ${page}`)
                applyTempDataToLocalStorage();
                window.__spaNavigated = true;
                loadPage(el.getAttribute("data-navigate"), false);
                navigation(page);
            }
        });
    });
}
/**
 * Nettoie et normalise une URL pour une SPA.
 * - supprime les slashes initiaux
 * - transforme les URL absolues en chemins relatifs propres
 */
export function normalizeUrl(url) {
    url = url.replace(/^[\/]+/, "");

    try {
        const parsed = new URL(url, window.location.origin);
        url = parsed.pathname.replace(/^[\/]+/, "");
    } catch (e) {
        // URL relative, on laisse tel quel
    }

    return url;
}

/**
 * Gère l'historique de navigation sans rechargement
 * @param {string} url - URL de la page cible
 * @param {boolean} fromBackButton - indique si l'appel vient d'un retour (popstate)
 */
export function navigation(url, fromBackButton = false) {
    url = normalizeUrl(url);
    if (!fromBackButton) {
        console.log("🧭 navigation() — pushing state to:", url);
        if (isFirstNavigation) {
            history.replaceState({}, "", url);
            isFirstNavigation = false;
        } else {
            history.pushState({}, "", url);
        }
    } else {
        console.log("🔙 navigation() ignorée (back button):", url);
    }
}


/**
 * Initialise l'écoute du bouton "back" ou "forward" navigateur.
 * Appelle la fonction de chargement passée en paramètre.
 */
export function setupPopstateHandler(loadPageCallback) {
    window.addEventListener("popstate", () => {
        let path = location.pathname;
        path = path.startsWith("/") ? path.slice(1) : path;
        path = path === "" ? "index.html" : path;
        const normalized = normalizeUrl(path);
        console.log("↩️ Retour navigateur vers:", path);
        resetTempData();
        window.__spaNavigated = true;
        loadPageCallback(path, true);
    });
}


/*****************************************************/
/*  Code pour debug l'historique                     */
/*  de navigation de la SPA                          */
/*****************************************************/
const historyLog = [];

function logHistoryEvent(action, path = normalizeUrl(location.pathname)) {
    historyLog.push({ action, path, time: new Date().toLocaleTimeString() });
    // console.clear();
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
