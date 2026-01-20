// js/breadcrumb.js
(function () {
  "use strict";

  // Sezioni -> etichetta + pagina indice
  const SECTION_MAP = {
    "_macchine": { label: "macchine", href: "macchine.html" },
    "_attrezzature": { label: "attrezzature", href: "attrezzature.html" },
    "_dpi":          { label: "dpi", href: "dpi.html" },
	"_fire": { label: "incendi", href: "fire.html" },
	"_dlg": { label: "dlg", href: "dlg.html" },
	// aggiungi qui altre sezioni se vuoi:
  };

  // Base path del sito (funziona anche da sottocartelle)
  function computeBasePath() {
    const pick =
      Array.from(document.scripts).find(s =>
        /\/(breadcrumb|header|bottomnav|menu)\.js(\?|$)/.test(s.src)
      ) || document.currentScript;

    const src = pick && pick.src ? pick.src : location.href;
    const jsDir = new URL(".", src);    // .../js/
    const base  = new URL("..", jsDir); // .../
    let p = base.pathname;
    if (!p.endsWith("/")) p += "/";
    return p;
  }
  const BASE = computeBasePath();

  // href/src relativi -> assoluti rispetto a BASE (senza dominio)
  function absPath(href) {
    if (!href) return href;
    if (/^(?:[a-z]+:|#)/i.test(href)) return href; // http:, mailto:, #...
    const clean = href.replace(/^\/+/, "");
    const u = new URL(clean, location.origin + BASE);
    return u.pathname + u.search + u.hash;
  }

  // Titolo pagina: priorità data-breadcrumb > meta > #title h1 > main h1 > filename
  function getPageTitle() {
    const el = document.querySelector("[data-breadcrumb]");
    if (el) {
      const v = el.getAttribute("data-breadcrumb");
      if (v) return v.trim().replace(/\s+/g, " ");
    }
    const meta = document.querySelector('meta[name="breadcrumb-title"]');
    if (meta && meta.content) return meta.content.trim().replace(/\s+/g, " ");

    const h1Title = document.querySelector("#title h1");
    if (h1Title) return h1Title.textContent.trim().replace(/\s+/g, " ");

    const h1InMain = document.querySelector("main h1");
    if (h1InMain) return h1InMain.textContent.trim().replace(/\s+/g, " ");

    return null; // userò il nome file
  }

  function buildCrumbs() {
    const rel = location.pathname.startsWith(BASE)
      ? location.pathname.slice(BASE.length)
      : location.pathname.replace(/^\/+/, "");
    const parts = rel.split("/").filter(Boolean); // es: ["_macchine","0tornio.html"]

    const crumbs = [];
    const addLink    = (label, href) => crumbs.push({ label, href: absPath(href), current: false });
    const addCurrent = (label)       => crumbs.push({ label, href: null,        current: true  });

    // Home
    addLink("home", "index.html");

    const file = parts[parts.length - 1] || "index.html";
    const isIndex = file.toLowerCase() === "index.html";

    // “categorie” su pagine diverse da index
    if (!isIndex) addLink("categorie", "index.html");

    // Sezione (prima cartella) se mappata
    const sectionKey = parts.length > 1 ? parts[0] : null;
    if (sectionKey && SECTION_MAP[sectionKey]) {
      const s = SECTION_MAP[sectionKey];
      addLink(s.label, s.href);
    }

    // Pagina corrente (solo testo)
    if (!isIndex) {
      let title = getPageTitle();
      if (!title) title = file.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
      addCurrent(title.toLowerCase());
    }

    return crumbs;
  }

  // Render con il tuo markup/CSS
  function renderBreadcrumb() {
    const existing = document.getElementById("breadcrumb");
    const wrap = existing || document.createElement("div");
    wrap.id = "breadcrumb";

    const crumbs = buildCrumbs();

    // Back (ancora) con fallback a history.back()
    const showBack = crumbs.length > 1;
    const backHTML = showBack
      ? `<a href="${absPath('index.html')}" class="bread-back-link">
           <div class="back"><img src="${absPath('resources/icons/back.svg')}" alt="Indietro"></div>
         </a>`
      : `<a href="${absPath('index.html')}">
           <div class="back"><img src="${absPath('resources/icons/homeRed.svg')}" alt="Home"></div>
         </a>`;

    const itemsHTML = crumbs.map((c, i) => {
      const isLast = i === crumbs.length - 1;
      const sep = !isLast && !c.current ? " &nbsp;&gt;" : "";
      if (c.current) {
        return `<div class="breadcrumb current"><h4>${c.label}</h4></div>`;
      }
      return `<a href="${c.href}"><div class="breadcrumb"><h4>${c.label}${sep}</h4></div></a>`;
    }).join("");

    wrap.innerHTML = `<div class="breadContent">${backHTML}${itemsHTML}</div>`;

    if (!existing) {
      const main = document.querySelector("main");
      if (main && main.parentNode) main.parentNode.insertBefore(wrap, main);
      else document.body.insertBefore(wrap, document.body.firstChild);
    }

    // Se c'è history, il back link usa history.back()
    const backLink = wrap.querySelector(".bread-back-link");
    if (backLink) {
      backLink.addEventListener("click", (e) => {
        if (history.length > 1) { e.preventDefault(); history.back(); }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", renderBreadcrumb);
})();
