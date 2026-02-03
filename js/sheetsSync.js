(function () {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbyVogonXvvNnD_f3llbjs7VEw9eqm7_Nyl-PFQDNFAjrzvjJXL-jHdGKOFgIaOJcMJT/exec";
  const API_KEY  = "digisafe-2026-admin"; // DEVE essere uguale a quello nell'Apps Script

  const LS_USER = "dsmUser";
  const LS_AVATAR = "selectedAvatarSrc";
  const LS_CREATED_AT = "dsmCreatedAtISO";

  function safeGet(k){ try { return localStorage.getItem(k); } catch { return null; } }
  function safeSet(k,v){ try { localStorage.setItem(k,v); } catch {} }

  function getOrCreateCreatedAtISO() {
    let iso = safeGet(LS_CREATED_AT);
    if (!iso) { iso = new Date().toISOString(); safeSet(LS_CREATED_AT, iso); }
    return iso;
  }

  function parseUser() {
    const raw = safeGet(LS_USER);
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      if (!u || !u.userId) return null;
      if (!u.avatar) {
        const av = safeGet(LS_AVATAR);
        if (av) u.avatar = av;
      }
      return u;
    } catch {
      return null;
    }
  }

  async function sendToSheet(reason) {
    const u = parseUser();
    if (!u) return;

    const payload = {
      apiKey: API_KEY,
      userId: u.userId,
      fullName: u.fullName || ((u.firstName||"") + " " + (u.lastName||"")).trim(),
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      avatar: u.avatar || "",
      createdAt: getOrCreateCreatedAtISO(),
      lastAccess: new Date().toISOString(),
      _reason: reason || ""
    };

    // IMPORTANT: text/plain evita preflight CORS
    try {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        keepalive: true
      });
    } catch {}
  }

  // 1) sync quando la pagina si apre (se esiste già un utente)
  document.addEventListener("DOMContentLoaded", () => {
    sendToSheet("page_load");
  });

  // 2) intercetta quando login.js salva dsmUser
  try {
    const original = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      original(key, value);
      if (key === LS_USER) {
        getOrCreateCreatedAtISO();
        sendToSheet("dsmUser_setItem");
      }
    };
  } catch {}

})();
