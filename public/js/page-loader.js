import { fragmentAssets } from "./fragment-assets.js";
import { normalizeUrl, setCurrentPage } from "./spa-navigation.js";
import { toPascalCase } from "./functions.js";

/******************************************************/
/*      sécurisation de l'exécution des scripts       */
/*      les nonces sont générés côté serveur          */
/******************************************************/
const nonce = document.body.getAttribute("nonce") || document.querySelector("meta[name='csp-nonce']")?.getAttribute("content");
const dynamicStyle = document.createElement('style');
if (nonce) dynamicStyle.setAttribute('nonce', nonce);
function loadAssetsForFragment(fragmentName, nonce = null) {
  const assets = fragmentAssets[fragmentName];
  if (!assets) return;

  for (const href of assets.styles || []) {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      if (nonce) link.setAttribute("nonce", nonce);
      document.head.appendChild(link);
    }
  }
}

export async function loadPage(url, isBackOrForward = false) {
  const fragmentName = url.replace(/\.html$/, "").split("/").pop();
  loadAssetsForFragment(fragmentName, nonce);

  try {
    const snapshot = await generatePageSnapshot(url);
    await pageTransition(snapshot, isBackOrForward);
    await importFragmentModule(fragmentName, isBackOrForward, snapshot);
    setCurrentPage(normalizeUrl(url).replace(".html", ""));
  } catch (error) {
    console.error("Erreur lors du chargement du fragment :", error);
  }
}


async function pageTransition(incomingPage, isBackOrForward) {
    const outgoingPage = document.getElementById("page-container");
  
    // Ajoute la bonne classe selon la direction
    const enterClass = isBackOrForward ? "slide-in-left" : "slide-in-right";
    const exitClass = isBackOrForward ? "slide-out-right" : "slide-out-left";
  
    return new Promise((resolve) => {
      if (outgoingPage) {
        outgoingPage.classList.add(exitClass);
        outgoingPage.addEventListener("animationend", () => {
          outgoingPage.remove();
          document.body.appendChild(incomingPage);
          incomingPage.classList.add(enterClass);
          resolve();
        }, { once: true });
      } else {
        document.body.appendChild(incomingPage);
        incomingPage.classList.add(enterClass);
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

async function importFragmentModule(fragmentName, isBackOrForward, container) {
    // if (!isBackOrForward) {
        const fragmentModule = await import(`./${fragmentName}.js`);
        if (typeof fragmentModule[`init${toPascalCase(fragmentName)}`] === 'function') {
          fragmentModule[`init${toPascalCase(fragmentName)}`](container);
        }
        console.log("📦 importFragmentModule — fragment:", fragmentName, "| back/forward ?", isBackOrForward);

      // }
}