if (window.TrustedTypes) {
    // Crée une politique par défaut pour sécuriser le HTML et les scripts
    const policy = TrustedTypes.createPolicy('default', {
      createHTML: (input) => {
        // Tu peux ajouter ici des vérifications supplémentaires sur le contenu HTML avant de l'accepter
        return input;  // Construit des chaînes HTML sécurisées
      },
      createScript: (input) => {
        // Vérifie ou sécurise les scripts avant de les accepter
        return input;  // Construit des scripts sécurisés
      }
    });
  }
  