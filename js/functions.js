export const selectImage = () => {
    // console.log("🖼️ selectImage() appelée !");

    // Définition du préfixe en fonction de l'environnement (GitHub Pages ou local)
    const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";

    const imageSources = [
        {
            class: "img-mobile",
            src: "/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_768.jpg",
            srcset: `
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_320.jpg 320w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_375.jpg 375w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_425.jpg 425w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_768.jpg 768w`,
            sizes: "(max-width: 767px) 100vw",
            alt: "Image mobile",
            minWidth: 0,
            maxWidth: 767
        },
        {
            class: "img-tablet",
            src: "/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md.jpg",
            srcset: `
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md_1024.jpg 1024w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md_1600.jpg 1600w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_md.jpg 2280w`,
            sizes: "(min-width: 768px) and (max-width: 1599px) 50vw",
            alt: "Image tablette",
            minWidth: 768,
            maxWidth: 1599
        },
        {
            class: "img-desktop",
            src: "/img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes.jpg",
            srcset: `
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_1024.jpg 1024w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes_1440.jpg 1440w,
                /img/Un_bouleau_au_bord_d_un_chemin_dans_les_Alpes.jpg 5472w`,
            sizes: "(min-width: 1600px) 33vw",
            alt: "Image grand écran",
            minWidth: 1600,
            maxWidth: Infinity
        }
    ];

    // Sélection du conteneur d'images
    const imageContainer = document.querySelector(".image-container");

    if (!imageContainer) {
        console.warn("⚠️ Aucun conteneur d'images trouvé !");
        return;
    }

    // Nettoyer le conteneur avant d'insérer de nouvelles images
    imageContainer.innerHTML = window.policy.createHTML("");

    // Déterminer la largeur actuelle de l'écran
    const screenWidth = window.innerWidth;

    imageSources.forEach(({ class: imgClass, src, srcset, sizes, alt, minWidth, maxWidth }) => {
        const img = document.createElement("img");
        img.classList.add("responsive-img", imgClass);
        // console.log("🖼️ Image insérée :",  `${prefix}${src}`);
        img.src = `${prefix}${src}`;
        img.srcset = srcset.split("\n").map(s => `${prefix}${s.trim()}`).join("\n");
        img.sizes = sizes;
        img.alt = alt;

        // Masquer les images qui ne correspondent pas à la taille d'écran
        if (screenWidth >= minWidth && screenWidth <= maxWidth) {
            img.classList.remove("hidden");
            img.classList.add("visible");
        } else {
            img.classList.remove("visible");
            img.classList.add("hidden");
        }

        imageContainer.appendChild(img);
    });

    // console.log("✅ Images insérées dynamiquement avec les bons chemins.");
};
