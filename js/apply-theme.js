/******************************************************/
/*            Gestion des Thèmes                      */
/******************************************************/

export function applyTheme() {
    // Variable pour stocker la sélection de l'utilisateur
    var selectedTheme = localStorage.getItem("theme") || "auto";
    // Appliquer le thème immédiatement au chargement
    setTheme(selectedTheme);
    // Gestion des clics sur le dropdown
    toggleTheme();
    // **Écoute les changements du mode système en mode auto**
    watchingAutoMode(selectedTheme);
};

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

function toggleTheme() {
    var dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(function (item) {
        item.addEventListener('click', function () {
            const selectedTheme = this.getAttribute('theme');
            setTheme(selectedTheme);
        });
    });
}

function watchingAutoMode(selectedTheme) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (selectedTheme === "auto") {
            setTheme("auto");
        }
    });
}