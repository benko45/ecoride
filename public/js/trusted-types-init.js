if (typeof trustedTypes !== 'undefined') {
  window.policy = trustedTypes.createPolicy('default', {
    createHTML: (input) => input,
    createScriptURL: (input) => input,
    //  createScript: (input) => input : pas encore assez généralement supporté
  });
} else {
  // Fallback pour les navigateurs sans Trusted Types
  window.policy = {
    createHTML: (input) => input,
    createScriptURL: (input) => input,
    //  createScript: (input) => input
  };
}
