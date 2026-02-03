/* js/sheetsSync.js
   Sincronizza la pseudo-registrazione (dsmUser) su Google Sheet via Apps Script.
   - NON modifica login.js
   - intercetta localStorage.setItem('dsmUser', ...)
   - aggiorna anche lastAccess ad ogni apertura pagina se esiste un utente
*/

(function () {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbyVogonXvvNnD_f3llbjs7VEw9eqm7_Nyl-PFQDNFAjrzvjJXL-jHdGKOFgIaOJcMJT/exec";
  const API_KEY = "prova";

  // Chiavi già usate dal tuo sito
  const LS_USER_ID = "digisafe_user_id";
  const LS_USER = "dsmUser";
  const LS_AVATAR = "selectedAvatarSrc";

  // Chiavi aggiuntive (solo per tracciare createdAt in modo stabile)
  const LS_CREATED_AT = "dsmCreatedAtISO";

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function parseUser() {
    const raw = safeGet(LS_USER);
    if (!raw) return null;

    try {
      const u = JSON.parse(raw);
      if (!u || !u.userId) return null;

      // Avatar: se manca, prova a recuperarlo anche dall’altra chiave
      if (!u.avatar) {
        const av = safeGet(LS_AVATAR);
        if (av) u.avatar = av;
      }

      return u;
    } catch (e) {
      return null;
    }
  }

  function getOrCreateCreatedAtISO() {
    let iso = safeGet(LS_CREATED_AT);
    if (!iso) {
      iso = new Date().toISOString();
      safeSet(LS_CREATED_AT, iso);
    }
    return iso;
  }

  function buildPayload(user, reason) {
    const nowISO = new Date().toISOString();

    return {
      apiKey: API_KEY,

      // i tuoi campi
      userId: user.userId || safeGet(LS_USER_ID) || "",
      fullName: user.fullName || ((user.firstName || "") + " " + (user.lastName || "")).trim(),
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      avatar: user.avatar || "",

      // tracking
      createdAt: getOrCreateCreatedAtISO(),
      lastAccess: nowISO,

      // campo admin (non lo tocchiamo qui)
      dataFormazione: "",

      // utile per debug lato server (facoltativo)
      _reason: reason || "unknown"
    };
  }

  async function postJSON(payload) {
    // Tentativo 1: fetch (più comune)
    try {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true // utile se la pagina sta cambiando
      });
      return true;
    } catch (e) {
      // Tentativo 2: sendBeacon (best effort)
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        return navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob);
      } catch (e2) {
        return false;
      }
    }
  }

  function syncNow(reason) {
    const user = parseUser();
    if (!user) return;

    const payload = buildPayload(user, reason);
    postJSON(payload);
  }

  // 1) Sync quando la pagina si apre (se l’utente esiste già)
  document.addEventListener("DOMContentLoaded", function () {
    syncNow("page_load");
  });

  // 2) Intercetta quando login.js salva dsmUser (registrazione / aggiornamento)
  try {
    const originalSetItem = localStorage.setItem.bind(localStorage);

    localStorage.setItem = function (key, value) {
      originalSetItem(key, value);

      // Se viene salvato dsmUser, allora sync immediato
      if (key === LS_USER) {
        // aggiorna/crea createdAt locale quando arriva il primo dsmUser
        getOrCreateCreatedAtISO();
        syncNow("dsmUser_setItem");
      }
    };
  } catch (e) {
    // se non si può patchare setItem, pazienza: resta il sync al load
  }

  // 3) (facoltativo) sync prima di chiudere/refresh (best effort)
  window.addEventListener("beforeunload", function () {
    syncNow("beforeunload");
  });
})();
