const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Liste d'IP autorisées ---
const allowedIps = ['192.168.1.141', '137.66.6.96', '88.126.84.119'];
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  const userAgent = req.headers['user-agent'] || '';
  console.log(`Client IP: ${clientIp} | User-Agent: ${userAgent}`);

  // Autorise ZAP temporairement (optionnel)
  if (userAgent.includes('ZAP')) return next();

  if (!allowedIps.includes(clientIp)) {
    return res.status(403).send('Forbidden: IP not allowed');
  }
  next();
});

// --- CORS sur domaines autorisés ---
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
app.use(cors(corsOptions));

// --- Fichiers statiques ---
app.use(express.static('.'));

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
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
  ]
};

// --- CSP appliquée globalement ---
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    `default-src 'self'; ` +
    `script-src ${cspDirectives.scriptSrc.join(' ')}; ` +
    `style-src ${cspDirectives.styleSrc.join(' ')}; ` +
    `img-src 'self'; connect-src 'self' https://nominatim.openstreetmap.org/; ` +
    `font-src 'self'; object-src 'none'; upgrade-insecure-requests; ` +
    `base-uri 'self'; form-action 'self'; frame-ancestors 'self'; ` +
    `trusted-types default; require-trusted-types-for 'script'; script-src-attr 'none'`
  );
  next();
});

// --- Sécurité générale Helmet ---
app.use(helmet());

// --- Route racine ---
app.get('/', (req, res) => {
  res.send('CSP correctement configuré avec Helmet!');
});

// --- Middleware 404 avec redirection vers 404.html ---
const path = require('path');
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// --- Lancement serveur ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
