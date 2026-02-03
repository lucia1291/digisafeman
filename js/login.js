document.addEventListener("DOMContentLoaded", function () {

  /* ================== COSTANTI STORAGE ================== */
  var LS_USER_ID = "digisafe_user_id";
  var LS_USER = "dsmUser";
  var LS_AVATAR = "selectedAvatarSrc";

  function getOrCreateUserId() {
    var id = null;
    try {
      id = localStorage.getItem(LS_USER_ID);
    } catch (e) {
      id = null;
    }

    if (!id) {
      id = "U" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      try {
        localStorage.setItem(LS_USER_ID, id);
      } catch (e) { /* ignore */ }
    }
    return id;
  }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }


  /* ================== SALVATAGGIO SU GOOGLE SHEET (opzionale) ==================
     - Richiede una Google Apps Script Web App (URL /exec)
     - Su GitHub Pages spesso conviene inviare in modalità "fire-and-forget" per evitare problemi CORS
  */

  var GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzn_22DvYXzmU3EjSul2GwrYz8x1SzYzQWFnSOV6OH7Xxw071inqXildr0fgFEYtlC-oA/exec"; // <-- incolla qui l'URL della tua Web App (/exec)

  function saveUserToSheet(userData) {
    if (!GOOGLE_SHEET_WEBAPP_URL) return;

    try {
      fetch(GOOGLE_SHEET_WEBAPP_URL, {
        method: "POST",
        // "no-cors" = invio senza leggere la risposta (utile su hosting statico)
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(userData)
      }).catch(function () { /* ignore */ });
    } catch (e) {
      // ignore
    }
  }


  /* ===== helper per aprire/chiudere overlay ===== */

  function openOverlay(overlay) {
    if (!overlay) return;
    overlay.style.display = "flex";
    document.body.classList.add("no-scroll");
  }

  function closeOverlay(overlay) {
    if (!overlay) return;
    overlay.style.display = "none";
    document.body.classList.remove("no-scroll");
  }

  function wireOverlayClose(overlay) {
    if (!overlay) return;

    // chiusura con attributo data-close-register (es. "continua come ospite")
    var closeBtns = overlay.querySelectorAll("[data-close-register]");
    for (var i = 0; i < closeBtns.length; i++) {
      closeBtns[i].addEventListener("click", function () {
        closeOverlay(overlay);
      });
    }

    // chiudi cliccando sullo sfondo scuro
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        closeOverlay(overlay);
      }
    });
  }

  var loginOverlay    = document.getElementById("loginOverlay");
  var registerOverlay = document.getElementById("registerOverlay");
  var forgotOverlay   = document.getElementById("forgotOverlay");

  /* ================== APERTURA dai pulsanti della welcome ================== */

  function byId(id) { return document.getElementById(id); }

  var btnLoginWelcome    = byId("btnLoginWelcome");
  var btnRegisterWelcome = byId("btnRegisterWelcome");

  if (btnLoginWelcome) {
    btnLoginWelcome.addEventListener("click", function () {
      openOverlay(loginOverlay);
    });
  }

  if (btnRegisterWelcome) {
    btnRegisterWelcome.addEventListener("click", function () {
      openOverlay(registerOverlay);
    });
  }

  wireOverlayClose(loginOverlay);
  wireOverlayClose(registerOverlay);
  wireOverlayClose(forgotOverlay);

  /* ================== TOGGLE password ================== */
  function wirePasswordToggle(wrapperId, inputId) {
    var w = byId(wrapperId);
    if (!w) return;
    var inp = byId(inputId);
    var btn = w.querySelector(".togglePassword");
    if (!inp || !btn) return;

    btn.addEventListener("click", function () {
      var isPwd = inp.getAttribute("type") === "password";
      inp.setAttribute("type", isPwd ? "text" : "password");
      btn.textContent = isPwd ? "🙈" : "👁️";
    });
  }

  wirePasswordToggle("loginPasswordWrapper", "loginPassword");
  wirePasswordToggle("registerPasswordWrapper", "registerPassword");
  wirePasswordToggle("forgotPasswordWrapper", "forgotPassword");

  /* ================== SELEZIONE AVATAR ================== */

  var avatarButtons = document.querySelectorAll(".avatarChoice");
  for (var a = 0; a < avatarButtons.length; a++) {
    avatarButtons[a].addEventListener("click", function () {
      // togli selezione
      for (var b = 0; b < avatarButtons.length; b++) {
        avatarButtons[b].classList.remove("selected");
      }
      this.classList.add("selected");

      var src = this.getAttribute("data-avatar");
      if (src) safeSet(LS_AVATAR, src);
    });
  }

  // se già salvato, rimetti evidenza
  var savedAvatar = safeGet(LS_AVATAR);
  if (savedAvatar) {
    for (var c = 0; c < avatarButtons.length; c++) {
      if (avatarButtons[c].getAttribute("data-avatar") === savedAvatar) {
        avatarButtons[c].classList.add("selected");
      }
    }
  }

  /* ================== LOGIN / REGISTRAZIONE (pseudo) ================== */

  function gotoHome() {
    // Se hai una pagina personale dedicata puoi cambiare qui
    window.location.href = "paginaPersonale.html";
  }

  // LOGIN
  var loginForm = byId("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var email = (byId("loginEmail") ? byId("loginEmail").value : "").trim();
      var pass  = (byId("loginPassword") ? byId("loginPassword").value : "").trim();

      // qui è "pseudo login": se esiste user in localStorage fai entrare
      var u = safeGet(LS_USER);
      if (u) {
        closeOverlay(loginOverlay);
        gotoHome();
      } else {
        alert("Nessun utente registrato localmente. Usa 'Registrati'.");
      }
    });
  }

  // LINK "Password dimenticata?"
  var openForgot = byId("openForgot");
  if (openForgot) {
    openForgot.addEventListener("click", function (e) {
      e.preventDefault();
      closeOverlay(loginOverlay);
      openOverlay(forgotOverlay);
    });
  }

  // TORNA A LOGIN da forgot
  var backToLogin = byId("backToLogin");
  if (backToLogin) {
    backToLogin.addEventListener("click", function (e) {
      e.preventDefault();
      closeOverlay(forgotOverlay);
      openOverlay(loginOverlay);
    });
  }

  // FORGOT (demo)
  var forgotForm = byId("forgotForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Demo: recupero password non attivo.");
      closeOverlay(forgotOverlay);
    });
  }

  // REGISTRAZIONE
  var registerForm = byId("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var first = (byId("registerFirstName") ? byId("registerFirstName").value : "").trim();
      var last  = (byId("registerLastName") ? byId("registerLastName").value : "").trim();
      var email = (byId("registerEmail") ? byId("registerEmail").value : "").trim();
      var pass  = (byId("registerPassword") ? byId("registerPassword").value : "").trim();

      if (!first || !last) {
        alert("Inserisci nome e cognome.");
        return;
      }

      // avatar scelto o default
      var avatarSrc = safeGet(LS_AVATAR);
      if (!avatarSrc) avatarSrc = "resources/avatars/avatar0.png";

      var userData = {
        userId: getOrCreateUserId(),
        firstName: first,
        lastName: last,
        fullName: (first + " " + last).replace(/\s+/g, " "),
        avatar: avatarSrc
      };

      safeSet(LS_USER, JSON.stringify(userData));
      saveUserToSheet(userData);

      // chiudi overlay e vai alla home (o pagina personale)
      closeOverlay(registerOverlay);
      gotoHome();
    });
  }

  // Link "Hai già un account? Accedi"
  var linkToLogin = byId("linkToLogin");
  if (linkToLogin) {
    linkToLogin.addEventListener("click", function (e) {
      e.preventDefault();
      closeOverlay(registerOverlay);
      openOverlay(loginOverlay);
    });
  }

});
