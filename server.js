const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Politique CSP personnalisée ---
const cspDirectives = {
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
    "https://fonts.googleapis.com",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  imgSrc: [
    "'self'",
    "https://github.com"
  ]
};


const allowedIps = ['192.168.1.141', '137.66.6.96', '88.126.84.119']; // adresse statique de ZAP

const allowedOrigins = [
  'https://ecoride-prod.fly.dev',
  'https://ecoride-dev.fly.dev',
  'https://ecoride-test.fly.dev'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'), false);
    }
  }
};

//
// === 🔐 MIDDLEWARES DE SÉCURITÉ ===
//

// Headers de sécurité (Helmet)
app.use(helmet());

// CSP appliquée à toutes les requêtes (y compris erreurs)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    `default-src 'self'; ` +
    `script-src ${cspDirectives.scriptSrc.join(' ')}; ` +
    `style-src ${cspDirectives.styleSrc.join(' ')}; ` +
    `img-src ${cspDirectives.imgSrc.join(' ')}; ` +
    `font-src ${cspDirectives.fontSrc.join(' ')}; ` +
    `connect-src 'self' https://nominatim.openstreetmap.org/; ` +
    `object-src 'none'; upgrade-insecure-requests; ` +
    `base-uri 'self'; form-action 'self'; frame-ancestors 'self'; ` +
    `trusted-types default; require-trusted-types-for 'script'; script-src-attr 'none'`
  );  
  next();
});

// Filtrage IP avec exception ZAP
const allowedIpv6Prefixes = ['2a01:e0a:595:1dd0'];  // Préfixes IPv6 de ZAP
app.use((req, res, next) => {
  const forwardedIps = req.headers['x-forwarded-for']?.split(',') || [];
  const clientIp = forwardedIps[0] || req.ip;
  const userAgent = req.headers['user-agent'] || '';
  console.log(`Client IP: ${clientIp} | UA: ${userAgent}`);

  // Exception ZAP
  if (userAgent.includes('ZAP')) return next();

  const isAllowedIpv6 = allowedIpv6Prefixes.some(prefix => clientIp.startsWith(prefix));
  if (!allowedIps.includes(clientIp) && !isAllowedIpv6) {
    return res.status(403).sendFile(path.join(__dirname, '403.html'));
  }

  next();
});

// CORS (domaines autorisés uniquement)
app.use(cors(corsOptions));

//
// === 🚀 SERVEURS DE FICHIERS ET ROUTES ===
//

// Fichiers statiques
app.use(express.static('.'));

// Route d’accueil simple
app.get('/', (req, res) => {
  res.send('CSP correctement configuré avec Helmet!');
});

// Page 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

//
// === 🟢 LANCEMENT DU SERVEUR ===
//

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
