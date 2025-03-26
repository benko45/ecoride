const express = require('express');
const helmet = require('helmet');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

app.use(express.static('.')); // ou '.' si index.html est à la racine
app.use(helmet());
// Configuration du Content-Security-Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"], // Permet uniquement les ressources provenant du même domaine
    scriptSrc: ["'self'", // Autorise les scripts venant du même domaine
                "https://code.jquery.com/jquery-3.7.1.min.js",
                "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
                "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js",
                "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/locales/bootstrap-datepicker.fr.min.js",
                "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
                "https://kit.fontawesome.com/06e14d9221.js",
                "https://code.jquery.com/jquery-3.7.1.min.js"], 
    styleSrc: ["'self'", // Autorise les styles venant du même domaine
                "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
                "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
                "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css",
                "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css",
                "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"], 
    imgSrc: ["'self'"], // Autorise les images venant du même domaine
    connectSrc: ["'self'"], // Ajout de la directive connectSrc pour les connexions XMLHttpRequest / WebSockets
    fontSrc: ["'self'"], // Autorise les polices venant du même domaine
    objectSrc: ["'none'"], // Bloque les objets (comme Flash)
    upgradeInsecureRequests: [], // Force les connexions HTTP à se faire en HTTPS si possible
    baseUri: ["'self'"], // Permet uniquement les liens de base venant du même domaine
    formAction: ["'self'"], // Autorise uniquement les actions de formulaire vers le même domaine
    "frame-ancestors": ["'self'"], // Bloque l'insertion du site dans un iframe
  }
}));

// Liste d'IP autorisées
const allowedIps = ['192.168.1.141', '137.66.6.96'];
app.use((req, res, next) => {
  const clientIp = req.ip;
  if (!allowedIps.includes(clientIp)) {
    return res.status(403).send('Forbidden: IP not allowed');
  }
  next();
});

// Limiter les origines autorisées
const allowedOrigins = ['https://ecoride-prod.fly.dev','https://ecoride-dev.fly.dev','https://ecoride-test.fly.dev'];
const options = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'), false);
    }
  }
};

app.use(cors(options));

// Route simple pour tester
app.get('/', (req, res) => {
  res.send('CSP correctement configuré avec Helmet!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});