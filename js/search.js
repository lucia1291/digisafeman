// js/search.js
(function () {
  "use strict";

  const $ = (sel, el = document) => el.querySelector(sel);

  // === BASE PATH (robusto tra cartelle/sottocartelle) ===
  function computeBasePath() {
    const pick = Array.from(document.scripts).find(s => /\/search\.js(\?|$)/.test(s.src)) || document.currentScript;
    const src = pick && pick.src ? pick.src : location.href;
    const jsDir = new URL(".", src);     // .../js/
    const base  = new URL("..", jsDir);  // .../
    let p = base.pathname;
    if (!p.endsWith("/")) p += "/";
    return p;
  }
  const BASE = computeBasePath();

  function absPath(href) {
    if (!href) return href;
    if (/^(?:[a-z]+:|#)/i.test(href)) return href; // http:, mailto:, #...
    const clean = href.replace(/^\/+/, "");
    const u = new URL(clean, location.origin + BASE);
    return u.pathname + u.search + u.hash;
  }

  // === Normalizzazione testo ===
  const normalize = (s) => (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  // === Carica/normalizza/deduplica l'indice (per URL) ===
  function getEffectiveIndex() {
    const raw = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
    const byUrl = new Map();
    raw.forEach(it => {
      const url = absPath(it.url || "");
      if (!url) return;
      const title = it.title || "";
      const kws = Array.isArray(it.keywords) ? it.keywords.filter(Boolean) : [];
      if (!byUrl.has(url)) {
        byUrl.set(url, { title, url, keywords: [...new Set(kws)] });
      } else {
        const curr = byUrl.get(url);
        curr.keywords = [...new Set([...(curr.keywords || []), ...kws])];
        if (!curr.title && title) curr.title = title;
      }
    });
    return Array.from(byUrl.values());
  }
  const INDEX = getEffectiveIndex();

  // === Motore di ricerca (scoring semplice) ===
  function runSearch(query) {
    const q = normalize(query);
    if (!q) return [];
    return INDEX
      .map(item => {
        const title = normalize(item.title);
        const kws = (item.keywords || []).map(normalize);
        let score = 0;
        if (title === q) score += 300;
        else if (title.startsWith(q)) score += 150;
        else if (title.includes(q)) score += 80;
        kws.forEach(k => {
          if (k === q) score += 200;
          else if (k.startsWith(q)) score += 120;
          else if (k.includes(q)) score += 60;
        });
        return { item, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.item);
  }

  // === Suggerimenti: 1-per-pagina (label = titolo), scegli la miglior corrispondenza ===
  function getSuggestions(query, max = 8) {
    const q = normalize(query);
    if (!q) return [];

    const bestByUrl = new Map();

    INDEX.forEach(item => {
      const titleN = normalize(item.title);
      let score = 0;

      if (titleN === q) score = Math.max(score, 400);
      else if (titleN.startsWith(q)) score = Math.max(score, 220);
      else if (titleN.includes(q)) score = Math.max(score, 120);

      (item.keywords || []).forEach(k => {
        const nk = normalize(k);
        if (nk === q) score = Math.max(score, 300);
        else if (nk.startsWith(q)) score = Math.max(score, 180);
        else if (nk.includes(q)) score = Math.max(score, 90);
      });

      if (score > 0) {
        const prev = bestByUrl.get(item.url);
        if (!prev || score > prev.score) {
          bestByUrl.set(item.url, { url: item.url, text: item.title || item.url, score });
        }
      }
    });

    return Array
      .from(bestByUrl.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, max);
  }

  // === Scegli dove navigare (per Invio) ===
  function pickBestTarget(query) {
    const q = normalize(query);
    if (!q) return null;

    for (const it of INDEX) if (normalize(it.title) === q) return it.url;
    for (const it of INDEX) if ((it.keywords || []).some(k => normalize(k) === q)) return it.url;

    const s = getSuggestions(query, 1)[0];
    if (s) return s.url;

    const r = runSearch(query)[0];
    if (r) return r.url;

    return null;
  }

  // === Rendering risultati ===
  function renderResults(items) {
    const box = $("#results");
    if (!box) return;

    // Se c'è un <p> statico in #searchResults (es. "Nessun risultato.")
    const legacyMsg = document.querySelector("#searchResults p");

    if (!items.length) {
      if (legacyMsg) legacyMsg.hidden = false;
      box.innerHTML = "";
      return;
    }

    if (legacyMsg) legacyMsg.hidden = true;

    
  }

  // === Rendering suggerimenti (1-per-URL) ===
  function renderSuggestions(list, query) {
    const box = $("#suggestions");
    if (!box) return;
    if (!query || !list.length) {
      box.innerHTML = "";
      box.style.display = "none";
      return;
    }
    box.innerHTML = `
      <ul role="listbox">
        ${list.map(s => `
          <li role="option" data-url="${s.url}" data-text="${s.text}">
            <span class="suggTitle">${s.text}</span>
          </li>
        `).join("")}
      </ul>
    `;
    box.style.display = "block";
  }

  // === Esegue ricerca (risultati + suggerimenti) ===
  function doSearch(q) {
    renderResults(runSearch(q));
    renderSuggestions(getSuggestions(q), q);
  }

  // === UI wiring ===
  function setupUI() {
    const input = $("#searchInput");
    const sugg  = $("#suggestions");
    if (!input) return;

    // input live (debounced)
    let t = null;
    input.addEventListener("input", () => {
      clearTimeout(t);
      const q = input.value;
      t = setTimeout(() => doSearch(q), 120);
    });

    // Enter → vai alla pagina più pertinente (o mostra risultati)
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const q = input.value.trim();
        if (!q) return;
        const url = pickBestTarget(q);
        if (url) {
          location.href = url;
        } else {
          doSearch(q);
        }
      }
    });

    // Click su suggerimento → naviga subito
    sugg.addEventListener("click", (e) => {
      const li = e.target.closest("li[data-url]");
      if (!li) return;
      const url = li.getAttribute("data-url");
      if (url) location.href = url;
    });

    // chiudi suggerimenti al click fuori
    document.addEventListener("click", (e) => {
      if (!sugg.contains(e.target) && e.target !== input) {
        sugg.style.display = "none";
      }
    });

    // Avvio da hash (#q=...)
    const initQ = new URLSearchParams(location.hash.slice(1)).get("q") || "";
    if (initQ) {
      input.value = initQ;
      doSearch(initQ);
    }
  }

  document.addEventListener("DOMContentLoaded", setupUI);
})();
