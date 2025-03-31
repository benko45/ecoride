/******************************************************/
/*            Gestion des Thèmes                      */
/******************************************************/

export function applyTheme(container = document) {
    const selectedTheme = localStorage.getItem("theme") || "auto";
    setTheme(selectedTheme);
    watchingAutoMode(selectedTheme);
    // Réattache les écouteurs à chaque fois, dans le bon container
    toggleTheme(container);
}

function setTheme(theme) {
    // Déterminer le vrai thème utilisé (light ou dark) en cas de "auto"
    var effectiveTheme = (theme === "auto")
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light")
        : theme;

    // **1️⃣ Met à jour Bootstrap (applique la couleur correcte)**
    document.documentElement.setAttribute("theme", effectiveTheme);

    // **2️⃣ Stocke le thème sélectionné pour l'affichage correct de l'icône**
    document.documentElement.setAttribute("selected-theme", theme);

    // Sauvegarder le thème dans le localStorage pour la prochaine fois
    localStorage.setItem("theme", theme);
}

function toggleTheme(container = document) {
    const menu = container.querySelector('.dropdown-menu');
    if (!menu) {
        console.warn("⚠️ .dropdown-menu introuvable dans", container);
        return;
    }

    // On supprime les anciens écouteurs s’il y en a (via clone)
    const clone = menu.cloneNode(true);
    menu.replaceWith(clone);

    clone.addEventListener('click', function (event) {
        const item = event.target.closest('.dropdown-item');
        if (item) {
            const selectedTheme = item.getAttribute('theme');
            setTheme(selectedTheme);
        }
    });
}


function watchingAutoMode(selectedTheme) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (selectedTheme === "auto") {
            setTheme("auto");
        }
    });
}