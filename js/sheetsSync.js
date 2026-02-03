(function () {
  // ✅ Il tuo endpoint Apps Script (quello /exec)
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbyYIuBuKCd_sxYBRGe3beTF5F2694D2I-Tw5lpTI1gc9ueSLl5Mr1QvDkirTNH5NG6F/exec";

  // Chiavi che usi già nel tuo sito
  const LS_USER = "dsmUser";
  const LS_AVATAR = "selectedAvatarSrc";

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function parseUser() {
    const raw = safeGet(LS_USER);
    if (!raw) return null;

    try {
      const u = JSON.parse(raw);
      if (!u) return null;

      // In login.js tu salvi questi campi dentro dsmUser:
      // userId, fullName, firstName, lastName, avatar
      // (avatar spesso è già dentro, ma facciamo fallback)
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
      userId: u.userId || "",
      fullName: u.fullName || "",
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      avatar: u.avatar || ""
	  createdAt: u.createdAt || "",
      lastAccess: u.lastAccess || "",
      dataFormazione: u.dataFormazione || "",
      note: u.note || "",
      // createdAt/lastAccess NON servono: nel tuo doPost metti new Date()
    };

    try {
      // ✅ text/plain evita preflight CORS
      await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        keepalive: true
      });

      // opzionale: log di debug
      // console.log("Inviato a Google Sheet:", reason, payload);

    } catch (e) {
      // opzionale: console.warn("Errore invio a Google Sheet", e);
    }
  }

  // 1) Prova a inviare quando la pagina si carica (se utente già presente)
  document.addEventListener("DOMContentLoaded", function () {
    sendToSheet("page_load");
  });

  // 2) Intercetta quando login.js salva dsmUser (pseudo-registrazione)
  //    così non devi toccare login.js
  try {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      originalSetItem(key, value);
      if (key === LS_USER) {
        sendToSheet("dsmUser_setItem");
      }
    };
  } catch {}
})();
