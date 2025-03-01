/**
 * Ajuste dynamiquement la largeur de plusieurs éléments en fonction de la largeur de la fenêtre.
 * La largeur est calculée comme (windowWidth / 2) - margin.
 * @param {HTMLElement[]} elements - Tableau d'éléments HTML dont la largeur sera ajustée.
 * @param {number} margin - Marge à soustraire de la largeur calculée.
 */
export const adjustLine_1_ItemWidth = (elements, margin) => {
    // Vérifie que tous les éléments sont valides
    if (!Array.isArray(elements) || elements.some(el => !(el instanceof HTMLElement))) {
        console.warn('Tous les éléments passés ne sont pas des éléments HTML valides.');
        return;
    }

    // Fonction pour ajuster la largeur
    const adjustWidth = () => {
        // Récupère la largeur de la fenêtre et applique le calcul
        const windowWidth = window.innerWidth;
        const commonWidth = (windowWidth / 2) - margin;

        // Applique cette même largeur à tous les éléments
        elements.forEach(element => {
            element.style.width = `${commonWidth}px`;
            element.style.maxWidth = '100%';
            element.style.boxSizing = 'border-box';
            element.style.whiteSpace = 'nowrap';
            element.style.overflow = 'hidden';
            element.style.textOverflow = 'ellipsis';
            element.style.minWidth = '0';
            element.style.flexShrink = '1';
            element.style.flexGrow = '0';

            // Force le recalcul de la largeur
            const computedWidth = getComputedStyle(element).width;
            element.style.width = computedWidth;
        });
    };

    // Ajuste la largeur au chargement du DOM
    window.addEventListener('DOMContentLoaded', adjustWidth);

    // Ajuste la largeur lors du redimensionnement de la fenêtre
    window.addEventListener('resize', adjustWidth);
};
