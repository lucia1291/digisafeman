// js/bottomnav.js — bottom bar robusta tra cartelle/sottocartelle
(function () {
  "use strict";

  // --- BASE PATH dal percorso di questo script (funziona anche in sottocartelle)
  function computeBasePath() {
    const pick =
      Array.from(document.scripts).find(s => /\/bottomnav\.js(\?|$)/.test(s.src)) ||
      document.currentScript;

    const src = pick && pick.src ? pick.src : location.href;
    const jsDir = new URL(".", src);     // .../js/
    const base  = new URL("..", jsDir);  // .../
    let p = base.pathname;
    if (!p.endsWith("/")) p += "/";
    return p;
  }
  const BASE = computeBasePath();

  // --- Relativo -> assoluto rispetto a BASE (senza dominio)
  function absPath(href) {
    if (!href) return href;
    if (/^(?:[a-z]+:|#)/i.test(href)) return href; // http:, mailto:, #...
    const clean = href.replace(/^\/+/, "");
    const u = new URL(clean, location.origin + BASE);
    return u.pathname + u.search + u.hash;
  }

  // --- Converte href/src (e srcset) all'interno di root
  function absolutize(root) {
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

  // --- Crea la bottom bar se non esiste già
  function ensureBottomNav() {
    if (document.getElementById("navbar")) return null;

    const nav = document.createElement("div");
    nav.id = "navbar";
    nav.innerHTML = `
      <div class="navButton">
        <a href="index.html">
          <div class="navIconBox">
            <div class="navIcon">
              <img src="resources/icons/home.svg" alt="Home">
            </div>
            <div class="navText"><h4>Home</h4></div>
          </div>
        </a>
      </div>
      <div class="navButton">
        <a href="preferiti.html">
          <div class="navIconBox">
            <div class="navIcon">
              <img src="resources/icons/favourite.svg" style="height:80%" alt="Preferiti">
            </div>
            <div class="navText"><h4>Preferiti</h4></div>
          </div>
        </a>
      </div>
      <div class="navButton">
        <a href="cerca.html">
          <div class="navIconBox">
            <div class="navIcon">
              <img src="resources/icons/search.svg" alt="Cerca">
            </div>
            <div class="navText"><h4>Cerca</h4></div>
          </div>
        </a>
      </div>
    `;

    document.body.appendChild(nav);
    absolutize(nav);
    return nav;
  }

  // --- Applica lo stato visibile/nascosto salvato da menu.js
  function applyOpenState(nav) {
    if (!nav) return;
    const isOpen = localStorage.getItem("menuOpen") === "true";
    // "" = lascia al CSS (flex), "none" = nascosto
    nav.style.display = isOpen ? "" : "none";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const nav = ensureBottomNav();
    if (!nav) {
      // se esiste già, sincronizza comunque i link/icone e lo stato
      const existing = document.getElementById("navbar");
      if (existing) {
        absolutize(existing);
        applyOpenState(existing);
      }
      return;
    }
    applyOpenState(nav);

    // Se cambi lo stato da un’altra tab, aggiorna anche qui
    window.addEventListener("storage", (ev) => {
      if (ev.key === "menuOpen") {
        applyOpenState(nav);
      }
    });
  });
})();
