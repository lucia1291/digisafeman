// js/header.js — markup compatibile con il tuo CSS, senza stili inline/iniettati
(function () {
  "use strict";

  // BASE PATH (funziona anche se il sito è in una sottocartella)
  function computeBasePath() {
    const pick =
      Array.from(document.scripts).find(s => /\/header\.js(\?|$)/.test(s.src)) ||
      document.currentScript;

    const src = pick && pick.src ? pick.src : location.href;
    const jsDir = new URL(".", src);     // .../js/
    const base  = new URL("..", jsDir);  // .../
    let p = base.pathname;
    if (!p.endsWith("/")) p += "/";
    return p;
  }
  const BASE = computeBasePath();

  // Relativo -> assoluto rispetto a BASE (senza dominio)
  function absPath(href) {
    if (!href) return href;
    if (/^(?:[a-z]+:|#)/i.test(href)) return href; // http:, mailto:, #...
    const clean = href.replace(/^\/+/, "");
    const u = new URL(clean, location.origin + BASE);
    return u.pathname + u.search + u.hash;
  }

  // Crea header (markup che il tuo CSS già stila)
  function buildHeader() {
    if (document.getElementById("site-header")) return;

    const header = document.createElement("header");
    header.id = "site-header";
    header.setAttribute("aria-label", "Intestazione del sito");

    header.innerHTML = `
      <div id="headerContent">
        <a href="index.html">
          <div class="logoContent">
            <div class="logo">
              <img src="resources/icons/logo_header.svg" alt="Logo">
            </div>
            <div class="logoName">
              <h1>DigiSafeMan</h1>
            </div>
          </div>
        </a>

        <div class="menuContent">
          <button type="button" onclick="toggleDiv()">
            <div class="hamburger" onclick="toggleMenu(this)">
              <span></span><span></span><span></span>
            </div>
          </button>

          <div id="menuButton">
            <ul>
              <!-- NIENTE <button> QUI: il CSS si aspetta un <li> “puro” -->
              <li onclick="toggleMenu2(this)">
                <div id="menuIcon">
                  <img src="resources/icons/gear.svg" alt="Impostazioni">
                </div>
                <h2>impostazioni</h2>
              </li>
              <li>
			    <a href="paginaPersonale.html">
					<div id="menuIcon">
					  <img src="resources/icons/personal.svg" alt="Pagina personale">
					</div>
					<h2>pagina personale</h2>
				</a>
              </li>
              <li>
                <a href="preferiti.html">
                  <div id="menuIcon">
                    <img src="resources/icons/favourite_red.svg" alt="Preferiti">
                  </div>
                  <h2>preferiti</h2>
                </a>
              </li>
			  <li>
                <a href="cerca.html">
                  <div id="menuIcon">
                    <img src="resources/icons/searchRed.svg" alt="Cerca">
                  </div>
                  <h2>cerca</h2>
                </a>
              </li>
              <li id="loginLogoutItem">
				  <a href="login.html" id="loginLogoutLink">
					<div id="menuIcon">
					  <img src="resources/icons/log.svg" alt="Login">
					</div>
					<h2 id="loginLogoutText">login</h2>
				  </a>
				</li>
            </ul>
          </div>

          <div id="menuButtonImposta" class="active">
            <ul>
              <li id="menu-button" onclick="toggleMenu3(this)">
                <div id="menuIconImposta">
                  <h2>Attiva/Disattiva barra di navigazione inferiore</h2>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `;

    document.body.prepend(header);
  }

  // Porta a percorsi assoluti i link/immagini dell’header (robusto tra cartelle)
  function absolutizeHeaderAssets() {
    const root = document.getElementById("site-header");
    if (!root) return;

    root.querySelectorAll("a[href]").forEach(a => {
      a.setAttribute("href", absPath(a.getAttribute("href")));
    });
    root.querySelectorAll("img[src]").forEach(img => {
      img.setAttribute("src", absPath(img.getAttribute("src")));
    });
    root.querySelectorAll("[srcset]").forEach(el => {
      const srcset = el.getAttribute("srcset");
      if (!srcset) return;
      const fixed = srcset.split(",").map(part => {
        const [url, size] = part.trim().split(/\s+/, 2);
        return [absPath(url), size].filter(Boolean).join(" ");
      }).join(", ");
      el.setAttribute("srcset", fixed);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    absolutizeHeaderAssets();
	setupLoginLogout(); // 
	 lockMenuIfLoggedOut();
  });
  
  function setupLoginLogout() {
  const user = localStorage.getItem("dsmUser");

  const text = document.getElementById("loginLogoutText");
  const link = document.getElementById("loginLogoutLink");

  if (!text || !link) return;

  if (user) {
    // 👉 UTENTE LOGGATO
    text.textContent = "logout";
    link.href = "#";

    link.onclick = function (e) {
      e.preventDefault();
      localStorage.removeItem("dsmUser");
      localStorage.removeItem("selectedAvatarSrc");
      localStorage.removeItem("digisafe_user_id");

      window.location.href = "login.html";
    };
  } else {
    // 👉 UTENTE NON LOGGATO
    text.textContent = "login";
    link.href = "login.html";
    link.onclick = null;
  }
}


function lockMenuIfLoggedOut() {
  const isLogged = !!localStorage.getItem("dsmUser");

  if (isLogged) return;

  // tutti i link del menu
  const menuLinks = document.querySelectorAll("#menuButton a");

  menuLinks.forEach(link => {
    const href = link.getAttribute("href");

    if (
      href.includes("paginaPersonale") ||
      href.includes("game")
    ) {
      link.classList.add("disabled-link");
      link.removeAttribute("href");

      link.onclick = function (e) {
        e.preventDefault();
        alert("Devi effettuare il login per accedere a questa sezione");
      };
    }
  });
}

/* ================== BLOCCO LINK HOME SE LOGOUT ================== */

(function lockHomeLinksIfLoggedOut() {
  const isLogged = !!localStorage.getItem("dsmUser");
  if (isLogged) return;

  // link da bloccare nella home
  const blockedLinks = document.querySelectorAll(
    'a[href*="paginaPersonale"], a[href*="game"]'
  );

  blockedLinks.forEach(link => {
    link.classList.add("disabled-link");
    link.removeAttribute("href");

    link.addEventListener("click", function (e) {
      e.preventDefault();
      alert("Accedi o registrati per utilizzare questa funzione");
    });
  });
})();


})();
