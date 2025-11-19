/**
 * preferiti.js — toggle & persistenza preferiti tra pagine
 * - Click su #selectFavourite (o .selectFavourite):
 *    • se è rosso  -> spegne + rimuove dai preferiti
 *    • se è spento -> accende + salva nei preferiti
 * - Stato "rosso" persiste cambiando pagina (localStorage)
 * - SOLO in preferiti.html rende la lista clonando TUTTA la .singleList salvata
 * - In preferiti.html aggiunge un pulsante "Svuota tutto" che cancella tutto
 */

(function () {
  "use strict";

  const KEY = "preferiti_min";
  const IS_FAVORITI_PAGE = /(^|\/)preferiti\.html(\?|#|$)/i.test(
    location.pathname + location.search + location.hash
  );

  // ---------- Storage ----------
  function getList() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function setList(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }
  function addItem(id, html) {
    const list = getList();
    if (!list.some(x => x.id === id)) {
      list.push({ id, html });
      setList(list);
    }
  }
  function removeItem(id) {
    setList(getList().filter(x => x.id !== id));
  }
  function clearAll() {
    setList([]);
  }

  // ---------- Helpers DOM ----------
  function getFavoritesContainer() {
    // Contenitore SOLO in preferiti.html
    return document.getElementById("listaPreferiti");
  }

  // ID stabile per la card corrente (.singleList)
  function deriveId(single) {
    if (!single) return null;

    // 1) priorità: qualunque discendente con data-id
    const data = single.querySelector("[data-id]");
    if (data) {
      const v = data.getAttribute("data-id");
      if (v) return String(v);
    }

    // 2) alternativa: href del link interno
    const a = single.querySelector("a[href]");
    if (a) {
      const href = a.getAttribute("href");
      try { return "href:" + new URL(href, location.origin).pathname; }
      catch { return "href:" + href; }
    }

    // 3) fallback: testo normalizzato
    const text = (single.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120);
    return "text:" + text;
  }

  function getFavBox(single) {
    return single.querySelector("#selectFavourite, .selectFavourite");
  }
  function getChip(favBox) {
    return favBox?.querySelector(".selectFavouriteCheck") || favBox;
  }

  // Mantieni "rosso" in base a localStorage
  function syncActiveStatesOnPage() {
    const saved = new Set(getList().map(x => x.id));
    document.querySelectorAll(".singleList").forEach(single => {
      const id = deriveId(single);
      const favBox = getFavBox(single);
      const chip = getChip(favBox);
      if (!id || !chip) return;
      chip.classList.toggle("active", saved.has(id));
    });
  }

  // ---------- Toolbar in preferiti.html ----------
  function ensureToolbar() {
    if (!IS_FAVORITI_PAGE) return null;
    const container = getFavoritesContainer();
    if (!container) return null;

    let toolbar = document.getElementById("favToolbar");
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.id = "favToolbar";
      toolbar.style.display = "flex";
      toolbar.style.gap = "1rem";
      toolbar.style.justifyContent = "space-between";
      toolbar.style.alignItems = "center";
      toolbar.style.margin = "1rem 0";



      const btn = document.createElement("button");
      btn.id = "svuotaPreferiti";
      btn.type = "button";
      btn.textContent = "Svuota tutto";
      btn.style.padding = ".5rem .75rem";
      btn.style.borderRadius = "8px";
      btn.style.border = "1px solid #ddd";
      btn.style.cursor = "pointer";

      btn.addEventListener("click", () => {
        if (getList().length === 0) return;
        clearAll();
        renderFavorites();         // aggiorna l'elenco su questa pagina
        syncActiveStatesOnPage();  // se su preferiti.html hai elementi con toggle (in genere no), li spegne
      });

      toolbar.appendChild(title);
      toolbar.appendChild(btn);
      container.parentNode.insertBefore(toolbar, container);
    }
    updateToolbarCount();
    return toolbar;
  }

  function updateToolbarCount() {
    if (!IS_FAVORITI_PAGE) return;
    const title = document.getElementById("favTitle");
    if (!title) return;
    const n = getList().length;
    title.textContent = n ? `I tuoi preferiti (${n})` : "I tuoi preferiti";
  }

  // ---------- Render SOLO su preferiti.html ----------
  function renderFavorites() {
    if (!IS_FAVORITI_PAGE) return;      // mai render sulle altre pagine
    const container = getFavoritesContainer();
    if (!container) return;
    const list = getList();
    container.innerHTML = list.map(x => x.html).join("");
    ensureToolbar();     // assicura toolbar + aggiorna contatore
  }

  // ---------- Click handler globale (toggle + add/remove) ----------
  document.addEventListener("click", (e) => {
    const favBox = e.target.closest("#selectFavourite, .selectFavourite");
    if (!favBox) return;

    const single = favBox.closest(".singleList");
    if (!single) return;

    // Evita che eventuali <a> genitori navighino
    e.preventDefault();
    e.stopPropagation();

    const chip = getChip(favBox);
    const id = deriveId(single);
    if (!chip || !id) return;

    // Toggle UI
    const nowOn = chip.classList.toggle("active");

    if (nowOn) {
      // Salva clonando TUTTA la .singleList
      addItem(id, single.outerHTML);
    } else {
      // Spegni: rimuovi
      removeItem(id);
    }

    // Se siamo proprio su preferiti.html, ri-renderizza e aggiorna toolbar
    if (IS_FAVORITI_PAGE) {
      renderFavorites();
    }
  });

  // ---------- Init ----------
  document.addEventListener("DOMContentLoaded", () => {
    syncActiveStatesOnPage();  // evidenzia "rossi" dove serve
    renderFavorites();         // disegna la lista solo in preferiti.html
  });

  // Aggiorna pagine aperte in altre tab/finestre
  window.addEventListener("storage", (ev) => {
    if (ev.key !== KEY) return;
    syncActiveStatesOnPage();
    renderFavorites();
  });
})();
