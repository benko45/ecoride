/**
 * Ajuste dynamiquement la largeur d'un élément en fonction de la largeur de la fenêtre.
 * La largeur est calculée comme (windowWidth / 2) - margin.
 * @param {HTMLElement} element - Élément HTML dont la largeur sera ajustée.
 * @param {number} margin - Marge à soustraire de la largeur calculée.
 */
export const adjustLine_1_ItemWidth = (element, margin) => {
    if (!(element instanceof HTMLElement)) {
        console.warn('Le paramètre passé n\'est pas un élément HTML valide.');
        return;
    }

    // Fonction pour ajuster la largeur
    const adjustWidth = () => {
        const windowWidth = window.innerWidth;
        const newWidth = (windowWidth / 2) - margin;
        element.style.width = `${newWidth}px`;
    };

    // Ajuste la largeur lors du chargement de la fenêtre
    window.addEventListener('DOMContentLoaded', adjustWidth);
    // Ajuste la largeur lors du redimensionnement de la fenêtre
    window.addEventListener('resize', adjustWidth);
};