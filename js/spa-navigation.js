let isFirstNavigation = true;

/**
 * Initialise la navigation de la SPA.
 */
export function initNavigation(){
    if (isFirstNavigation) {
        window.history.replaceState({}, "", "index.html");
        isFirstNavigation = false;
    }
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
        const path = normalizeUrl(location.href);
        console.log("↩️ Retour navigateur vers:", path);
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
