// js/sheets-db.js
// Salva la pseudo-registrazione su Google Sheets via Apps Script Web App

window.DSM_DB = (function () {
  "use strict";

  // 👇 INCOLLA QUI la Web App URL di Apps Script
  const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbwdAncI0cuxTsfvezHHg0u5_2unRf1YJTkQcjuVVC8EdSvYdjf5PcDKpkR0ZN3fa31gXA/exec";

  function postJSON(url, data) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    }).then(r => r.json().catch(() => ({ ok:false, error:"Invalid JSON response" })));
  }

  // coda offline (se l’utente è senza rete)
  const QUEUE_KEY = "dsm_db_queue";

  function enqueue(payload) {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
      q.push({ t: Date.now(), payload });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch (e) {}
  }

  function flushQueue() {
    let q;
    try { q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
    catch (e) { q = []; }

    if (!q.length) return;

    // invia in ordine e svuota solo se va bene
    const copy = q.slice();
    return copy.reduce((p, item) => {
      return p.then(() => postJSON(ENDPOINT_URL, item.payload));
    }, Promise.resolve())
    .then(() => {
      localStorage.setItem(QUEUE_KEY, "[]");
    })
    .catch(() => {
      // se fallisce, lascio la coda
    });
  }

  function savePseudoRegistration(userData) {
    if (!ENDPOINT_URL || ENDPOINT_URL.includes("INCOLLA_LA_TUA_WEB_APP_URL")) {
      console.warn("DSM_DB: endpoint non configurato");
      return Promise.resolve({ ok:false, error:"Endpoint not configured" });
    }

    // prova subito
    return postJSON(ENDPOINT_URL, userData)
      .catch(() => {
        // offline / rete KO: metto in coda
        enqueue(userData);
        return { ok:false, queued:true };
      });
  }

  // tenta flush quando torna la rete
  window.addEventListener("online", flushQueue);
  // tenta flush all’avvio
  setTimeout(flushQueue, 1000);

  return { savePseudoRegistration, flushQueue };
})();
