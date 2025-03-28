import { fragmentAssets } from "./fragment-assets.js";
import { normalizeUrl, setCurrentPage } from "./spa-navigation.js";

/******************************************************/
/*      sécurisation de l'exécution des scripts       */
/*      les nonces sont générés côté serveur          */
/******************************************************/
const nonce = document.body.getAttribute("nonce") || document.querySelector("meta[name='csp-nonce']")?.getAttribute("content");

function loadAssetsForFragment(fragmentName, nonce = null) {
  const assets = fragmentAssets[fragmentName];
  if (!assets) return;

  for (const href of assets.styles || []) {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }

  for (const src of assets.scripts || []) {
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement("script");
      script.src = src;
      script.type = "module";
      if (nonce) script.setAttribute("nonce", nonce);
      document.body.appendChild(script);
    }
  }
}

export async function loadPage(url, isBackOrForward = false) {
  const fragmentName = url.replace(/\.html$/, "").split("/").pop();
  loadAssetsForFragment(fragmentName, nonce);

  try {
    const snapshot = await generatePageSnapshot(url);
    await pageTransition(snapshot, url);
    await importFragmentModule(fragmentName, isBackOrForward);
    setCurrentPage(normalizeUrl(url).replace(".html", ""));
  } catch (error) {
    console.error("Erreur lors du chargement du fragment :", error);
  }
}

async function pageTransition(incomingPage, url) {
    console.log("📦 Début de transition");
  
    const outgoingPage = document.getElementById("page-container");
  
    return new Promise((resolve) => {
      if (outgoingPage) {
        console.log("🎬 Animation fade-out");
        outgoingPage.classList.add("fade-out");
        outgoingPage.addEventListener("animationend", () => {
          console.log("🧹 Suppression ancienne page");
          outgoingPage.remove();
          document.body.appendChild(incomingPage);
          incomingPage.classList.add("fade-in");
          resolve();
        }, { once: true });
      } else {
        console.log("📥 Pas de page précédente");
        document.body.appendChild(incomingPage);
        incomingPage.classList.add("fade-in");
        resolve();
      }
    });
  }
  

async function generatePageSnapshot(url) {
    const html = await _fetchFragmentHTML(url);
    const temp = createTempContainer(html);
    extractAndApplyTitle(temp);

    return temp;
}

function createTempContainer(html) {
  const container = document.createElement("div");
  container.id = "page-container";
  container.innerHTML = window.policy.createHTML(html);
  return container;
}

async function _fetchFragmentHTML(url) {
  const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";
  return fetch(`${prefix}/${url.replace(/\.html$/, "")}`, { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return response.text();
    });
}

function extractAndApplyTitle(container) {
    const tempTitle = container.querySelector("title");
    if (tempTitle) document.title = tempTitle.textContent;
  }

async function importFragmentModule(fragmentName, isBackOrForward) {
    if (!isBackOrForward) {
        const fragmentModule = await import(`./${fragmentName}.js`);
        if (typeof fragmentModule[`init${toPascalCase(fragmentName)}`] === 'function') {
          fragmentModule[`init${toPascalCase(fragmentName)}`](fragmentName);
        }
      }
}

function toPascalCase(str) {
    return str
      .replace(/[_\- ]+/g, ' ')                 // remplace underscore, tiret, ou espace par un seul espace
      .replace(/([a-z])([A-Z])/g, '$1 $2')      // espace entre camelCase
      .toLowerCase()                            // tout en minuscules
      .split(' ')                               // découpe par mot
      .filter(Boolean)                          // supprime les chaînes vides
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // majuscule à chaque mot
      .join('');                                // concatène sans espace
  }

function updateSnapshotData(tempDiv) {
    const selectedDepartureAddress = localStorage.getItem('selectedDepartureAddress') || "Départ";
    const selectedArrivalAddress = localStorage.getItem('selectedArrivalAddress') || "Arrivée";
    const selectedPassengers = localStorage.getItem('selectedPassengers') || "1";
    const selectedDate = localStorage.getItem('selectedDate');


    const departureElement = tempDiv.querySelector('#selected-departure-address');
    const arrivalElement = tempDiv.querySelector('#selected-arrival-address');
    const passengersElement = tempDiv.querySelector('#passengers-nb');
    const dateElement = tempDiv.querySelector('#selected-date');

    if (departureElement && selectedDepartureAddress) {
        departureElement.textContent = selectedDepartureAddress;
    }
    if (arrivalElement && selectedArrivalAddress) {
        arrivalElement.textContent = selectedArrivalAddress;
    }
    if (passengersElement && selectedPassengers) {
        passengersElement.textContent = selectedPassengers;
    }
    if (dateElement && selectedDate) {
        dateElement.textContent = selectedDate;
    }
}