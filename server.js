const express = require('express');
const helmet = require('helmet');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

app.use(helmet());

// Configuration du Content-Security-Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "https://code.jquery.com/jquery-3.7.1.min.js",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
      "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js",
      "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/locales/bootstrap-datepicker.fr.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      "https://kit.fontawesome.com/06e14d9221.js",
      "https://unpkg.com/trusted-types@3.0.4/dist/es6/trustedtypes.full.es6.js"
    ],
    styleSrc: [
      "'self'",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
      "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css",
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    ],
    imgSrc: ["'self'"],
    connectSrc: ["'self'", "https://nominatim.openstreetmap.org/"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'self'"],
    trustedTypes: ['default'],
    requireTrustedTypesFor: ['script']
  }
}));

// Liste d'IP autorisées
const allowedIps = ['192.168.1.141', '137.66.6.96', '88.126.84.119']; // 88.126.84.119 = IP de ZAP

// Middleware IP autorisée (compatible proxy)
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  console.log(`Client IP: ${clientIp}`);
  if (!allowedIps.includes(clientIp)) {
    return res.status(403).send('Forbidden: IP not allowed');
  }
  next();
});

// CORS autorisé pour sous-domaines spécifiques
const allowedOrigins = [
  'https://ecoride-prod.fly.dev',
  'https://ecoride-dev.fly.dev',
  'https://ecoride-test.fly.dev'
];

const options = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'), false);
    }
  }
};

app.use(cors(options));
app.use(express.static('.'));

// Route de test
app.get('/', (req, res) => {
  res.send('CSP correctement configuré avec Helmet!');
});

// Lancement du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});