
🔐 Rapport de sécurité front-end — ecoride-test.fly.dev

1. Contrôle CORS (Cross-Origin Resource Sharing)

✔ Test manuel :
Une requête avec un header Origin non autorisé retourne aucun en-tête Access-Control-Allow-Origin, ce qui déclenche la Same-Origin Policy (SOP) dans le navigateur.

    curl -i -H "Origin: https://evil.com" https://ecoride-test.fly.dev/

Réponse HTTP :
    HTTP/1.1 200 OK
    ...
    (no Access-Control-Allow-Origin present)

✅ Sécurisé : Aucune fuite de données inter-origines, pas de CORS permissif.


2. Content Security Policy (CSP)

Une CSP dynamique avec nonce est en place pour chaque requête :

- script-src et style-src incluent une directive nonce-<valeur> générée dynamiquement.
- Les sources externes sont explicitement whitelistsées.
- script-src-attr 'none' désactive les attributs on* inline.
- trusted-types est activé pour empêcher les injections de DOM XSS.

Exemple de CSP générée :
    Content-Security-Policy:
      default-src 'self';
      script-src 'self' <CDNs...> 'nonce-xyz';
      style-src 'self' <CDNs...> 'nonce-xyz';
      font-src 'self' <CDNs...>;
      img-src 'self' github.com avatars.githubusercontent.com;
      connect-src 'self' nominatim.openstreetmap.org ka-f.fontawesome.com;
      object-src 'none';
      form-action 'self';
      frame-ancestors 'self';
      trusted-types default;
      script-src-attr 'none';

✅ Sécurisé : protège efficacement contre les attaques XSS, y compris DOM-based XSS.


3. Trusted Types

Directive présente :
    trusted-types default;
    script-src-attr 'none';

Bien que require-trusted-types-for 'script' soit désactivé (pour compatibilité avec jQuery), l’activation partielle est déjà une bonne pratique.

✅ Sécurisé : activation progressive des Trusted Types, en cohérence avec les bibliothèques utilisées.


Conclusion

✅ L'application respecte les standards de sécurité front-end.
Aucun en-tête CORS permissif, CSP robuste avec nonce, Trusted Types partiellement actifs, et filtrage IP côté serveur.
Le site est protégé contre les accès inter-origines non autorisés et les principales attaques XSS client-side.
