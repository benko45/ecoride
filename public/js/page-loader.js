import { fragmentAssets } from "./fragment-assets.js";
import { normalizeUrl, setCurrentPage } from "./spa-navigation.js";
import { toPascalCase } from "./functions.js";
import { positionDropdownMenu } from "./index.js";

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

export async function handleNavigation(page, isBackOrForward = false) {
  if (!isBackOrForward) {
    const { applyTempDataToLocalStorage } = await import("./handleData.js");
    applyTempDataToLocalStorage();
    const { navigation } = await import("./spa-navigation.js");
    navigation(`${page}.html`);
  } else {
    const { resetTempData } = await import("./handleData.js");
    resetTempData();
  }
  await loadPage(`${page}.html`, isBackOrForward);
}

export async function loadPage(url, isBackOrForward = false) {
  const fragmentName = url.replace(/\.html$/, "").split("/").pop();
  loadAssetsForFragment(fragmentName, nonce);

  try {
    const snapshot = await generatePageSnapshot(url);
    await importFragmentModule(fragmentName, isBackOrForward, snapshot);
    await pageTransition(snapshot, isBackOrForward);
    setCurrentPage(normalizeUrl(url).replace(".html", ""));
  } catch (error) {
    console.error("Erreur lors du chargement du fragment :", error);
  }
}

async function pageTransition(incomingPage, isBackOrForward) {
  const allContainers = document.querySelectorAll("#page-container");
  const outgoingPage = allContainers[allContainers.length - 1];
  const enterClass = isBackOrForward ? "slide-in-left" : "slide-in-right";

  incomingPage.style.zIndex = "2";
  if (outgoingPage) outgoingPage.style.zIndex = "1";

  incomingPage.classList.add("pre-enter");
  document.body.appendChild(incomingPage);
  void incomingPage.offsetWidth;

  incomingPage.classList.remove("pre-enter");
  incomingPage.classList.add(enterClass);

  return new Promise((resolve) => {
    incomingPage.addEventListener("animationend", () => {
      // ✅ Seulement ici on retire l’ancienne
      outgoingPage?.remove();
      resolve();
    }, { once: true });

    // 🛡 fallback si l’event "animationend" ne se déclenche pas
    const computedDuration = getComputedStyle(incomingPage).getPropertyValue('--transitionTime') || '0.4s';
    const ms = parseFloat(computedDuration) * (computedDuration.includes('ms') ? 1 : 1000);
    setTimeout(() => {
      outgoingPage?.remove();
      resolve();
    }, ms + 50);
  });
}

async function generatePageSnapshot(url) {
  const html = await _fetchFragmentHTML(url);
  // console.log("🧪 HTML fetché depuis", url, ":", html);
  const temp = createTempContainer(html);
  extractAndApplyTitle(temp);
  return temp;
}

function createTempContainer(html) {
  const container = document.createElement("div");
  container.id = "page-container";
  const safeHtml = window.policy.createHTML(html);

  const tempDoc = document.implementation.createHTMLDocument();
  tempDoc.documentElement.innerHTML = window.policy.createHTML(safeHtml);

  // ✅ Copier les classes du body source
  const tempBody = tempDoc.body;
  container.className = tempBody.className;
  if (!container.classList.length) {
    container.classList.add("background-light");
    console.warn("⚠️ Aucun fond détecté sur le body du fragment. Ajout de 'background-light' par défaut.");
  }
  const bodyContent = tempBody.innerHTML;
  container.innerHTML = window.policy.createHTML(bodyContent);
  return container;
}

async function _fetchFragmentHTML(url) {
  const prefix = window.location.pathname.startsWith("/ecoride") ? "/ecoride" : "";
  return fetch(`${prefix}/${url.replace(/\.html$/, "")}`,
    { cache: "no-store",
      headers: {
        "x-requested-by": "spa"
      }
    })
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
  const fragmentModule = await import(`./${fragmentName}.js`);
  const initFn = fragmentModule[`init${toPascalCase(fragmentName)}`];
  if (typeof initFn === 'function') {
    console.log("📦 Appel de", `init${toPascalCase(fragmentName)}`, "avec container:", container);
    initFn(container);
    if(fragmentName.includes("index")) {
      positionDropdownMenu(container);
    }
  }
  console.log("📦 importFragmentModule — fragment:", fragmentName, "| back/forward ?", isBackOrForward);
}
