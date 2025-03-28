const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const viewsPath = path.join(__dirname, 'views');

fs.readdir(viewsPath, (err, files) => {
  if (err) {
    console.error("❌ Le dossier views/ est introuvable en production !");
  } else {
    console.log("✅ Contenu du dossier views :", files);
  }
});

// === 📁 CONFIGURATION DES DOSSIERS ===
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // views/ contient index.ejs, fragments/, layout.ejs

// === 📄 LAYOUTS EJS ===
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layout');

// === 🔐 CSP DIRECTIVES ===
const cspDirectives = {
  scriptSrc: [
    "'self'",
    "https://code.jquery.com/jquery-3.7.1.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/locales/bootstrap-datepicker.fr.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
    "https://unpkg.com/trusted-types@3.0.4/dist/es6/trustedtypes.full.es6.js"
  ],
  styleSrc: [
    "'self'",
    "https://fonts.googleapis.com",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com"
  ],
  imgSrc: [
    "'self'",
    "https://github.com",
    "https://avatars.githubusercontent.com"
  ]
};

// === 🔐 IP AUTORISÉES + ZAP ===
const allowedIps = ['88.126.84.119', '91.166.155.218', '127.0.0.1', '::1', '192.168.1.141', '192.168.1.128', '137.66.6.96'];  // adresse statique de ZAP
const allowedIpv6Prefixes = ['2a01:e0a:595:1dd0'];  // Préfixe IPv6 mobile de ZAP

// === 🔐 CORS AUTORISÉS ===
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  'https://ecoride-prod.fly.dev',
  'https://ecoride-dev.fly.dev',
  'https://ecoride-test.fly.dev'
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🌐 Requête entrante avec origin =", origin);

    // Autoriser si pas d'origin (requête locale / navigation directe)
    // ou si l'origin contient localhost:3000 ou 127.0.0.1:3000
    if (
      !origin ||
      origin.includes("localhost:3000") ||
      origin.includes("127.0.0.1:3000")
    ) {
      callback(null, true);
    } else {
      console.warn("❌ Origin refusée :", origin);
      callback(new Error("CORS not allowed"));
    }
  }
};

// === 🔐 MIDDLEWARES SÉCURITÉ ===

// Helmet (en premier si CSP personnalisée ensuite)
app.use(helmet());

// Middleware CSP dynamique avec nonce
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;

  res.setHeader('Content-Security-Policy',
    `default-src 'self'; ` +
    `script-src ${cspDirectives.scriptSrc.join(' ')} 'nonce-${nonce}'; ` +
    `style-src ${cspDirectives.styleSrc.join(' ')} 'nonce-${nonce}'; ` +
    `img-src ${cspDirectives.imgSrc.join(' ')}; ` +
    `font-src ${cspDirectives.fontSrc.join(' ')}; ` +
    `connect-src 'self' https://nominatim.openstreetmap.org/ https://ka-f.fontawesome.com; ` +
    `object-src 'none'; upgrade-insecure-requests; ` +
    `base-uri 'self'; form-action 'self'; frame-ancestors 'self'; ` +
    `trusted-types default; script-src-attr 'none'` //require-trusted-types-for 'script'; est incompatible jQuery
  );

  next();
});

// Filtrage IP avec exception ZAP
app.use((req, res, next) => {
  const forwardedIps = req.headers['x-forwarded-for']?.split(',') || [];
  const clientIp = forwardedIps[0] || req.ip;
  const userAgent = req.headers['user-agent'] || '';
  console.log(`Client IP: ${clientIp} | UA: ${userAgent}`);

  if (userAgent.includes('ZAP')) return next();
  const isAllowedIpv6 = allowedIpv6Prefixes.some(prefix => clientIp.startsWith(prefix));
  // if (!allowedIps.includes(clientIp) && !isAllowedIpv6) {
  //   return res.status(403).sendFile(path.join(__dirname, '403.html'));
  // }

  next();
});

// CORS
app.use(cors(corsOptions));

// === 🚀 FICHIERS PUBLICS ===
app.use('/public', express.static(path.join(__dirname, 'public')));

// === 📄 ROUTES PRINCIPALES ===

// Index (SPA root page)
app.get('/', (req, res) => {
  console.log("access /");
  try { 
    res.render('index', {
    nonce: res.locals.nonce,
    title: "Accueil",
    userIsReturning: false})
  } catch (err) {
    console.error('❌ Erreur dans res.render(index):', err);
    res.status(500).send('Erreur rendering index.ejs');
  }
});

// Fragments dynamiques (ex: choosing-address, results, etc.)
app.get('/:name', (req, res) => {
  const fragment = req.params.name;
  res.render(`${fragment}`, {
    nonce: res.locals.nonce,
    userIsReturning: true
  });
});

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err.stack);
  res.status(500).send('Erreur interne du serveur');
});

// === 🚀 START SERVEUR ===
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
