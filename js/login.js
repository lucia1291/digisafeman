document.addEventListener("DOMContentLoaded", function () {

  /* ================== COSTANTI STORAGE ================== */
  var LS_USER_ID = "digisafe_user_id";
  var LS_USER = "dsmUser";
  var LS_AVATAR = "selectedAvatarSrc";

  // === Google Apps Script Web App (PUBBLICO) ===
  var GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbz9M0TIJjRaFH51Yk6i9xbczBIEgKslBdJ__YA_ms3NxzFuHvxJNS551fnoSXwUS9Qu/exec";

  var LS_DB = "dsmUsersDb"; // "database" locale: lista utenti pseudo-registrati

  function readDb() {
    try {
      var raw = localStorage.getItem(LS_DB);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function writeDb(arr) {
    try { localStorage.setItem(LS_DB, JSON.stringify(arr)); } catch (e) { /* ignore */ }
  }

  // inserisce o aggiorna l'utente nel DB (chiave: userId)
  function upsertUserInDb(userData) {
    var db = readDb();
    var idx = -1;

    for (var i = 0; i < db.length; i++) {
      if (db[i] && db[i].userId === userData.userId) { idx = i; break; }
    }

    if (idx >= 0) {
      db[idx] = Object.assign({}, db[idx], userData);
    } else {
      db.push(Object.assign({
        createdAt: new Date().toISOString(),
        adminDate: null
      }, userData));
    }

    writeDb(db);
  }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function getOrCreateUserId() {
    var id = null;
    try { id = localStorage.getItem(LS_USER_ID); } catch (e) { id = null; }

    if (!id) {
      var newId = null;
      try {
        newId = (crypto && crypto.randomUUID)
          ? crypto.randomUUID()
          : (Date.now() + "-" + Math.random().toString(16).slice(2));
      } catch (e2) {
        newId = Date.now() + "-" + Math.random().toString(16).slice(2);
      }

      try { localStorage.setItem(LS_USER_ID, newId); } catch (e3) { /* ignore */ }
      id = newId;
    }

    return id;
  }

  /* ================== INVIO A GOOGLE SHEET (Safari-safe) ================== */
  function postToGAS_(payloadObj) {
    if (!GAS_WEBAPP_URL) return Promise.reject(new Error("Missing GAS_WEBAPP_URL"));
    var body = "payload=" + encodeURIComponent(JSON.stringify(payloadObj || {}));

    return fetch(GAS_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: body,
      redirect: "follow",
      keepalive: true
    });
  }

  function sendRegistrationToGoogleSheet(userData) {
    if (!userData || !userData.userId) return;

    try {
      postToGAS_({
        action: "register",
        userId: userData.userId,
        firstName: userData.firstName,
        lastName: userData.lastName
      }).catch(function () { /* ignore */ });
    } catch (e) {
      // non bloccare la registrazione se fallisce la rete
    }
  }

  /* ================== STATUS TRAINING: JSONP (robusto senza CORS) ================== */
  function getStatusJSONP_(userObj) {
    return new Promise(function (resolve, reject) {
      if (!userObj) return reject(new Error("Missing userObj"));

      var cb = "dsm_cb_" + Math.random().toString(16).slice(2);
      var script = document.createElement("script");

      window[cb] = function (data) {
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        if (script && script.parentNode) script.parentNode.removeChild(script);
        resolve(data);
      };

      // Chiamiamo doGet?action=getstatus in JSONP
      var url =
        GAS_WEBAPP_URL +
        "?action=getstatus" +
        "&userId=" + encodeURIComponent(userObj.userId || "") +
        "&firstName=" + encodeURIComponent(userObj.firstName || "") +
        "&lastName=" + encodeURIComponent(userObj.lastName || "") +
        "&callback=" + encodeURIComponent(cb);

      script.src = url;
      script.async = true;

      script.onerror = function () {
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        if (script && script.parentNode) script.parentNode.removeChild(script);
        reject(new Error("JSONP error"));
      };

      document.head.appendChild(script);
    });
  }

  function applyTrainingStatusFromSheet_() {
    // Questo blocco gira solo sulle pagine che hanno quel div
    var statusBox = document.getElementById("statusTraining");
    if (!statusBox) return;

    var esitoSpan = statusBox.querySelector(".statusTrainingEsito");
    if (!esitoSpan) return;

    // Note: qui stampiamo la colonna "notes" dentro statusTrainingList
    var notesContainer = document.getElementById("statusTrainingList");
    var notesSpan = notesContainer ? notesContainer.querySelector(".TrainingList") : null;

    var userStr = safeGet(LS_USER);
    if (!userStr) {
      setPending_();
      setNotes_("nessuna nota");
      return;
    }

    var userObj = null;
    try { userObj = JSON.parse(userStr); } catch (e) {
      setPending_();
      setNotes_("nessuna nota");
      return;
    }
    if (!userObj) {
      setPending_();
      setNotes_("nessuna nota");
      return;
    }

    getStatusJSONP_(userObj)
      .then(function (res) {
        // se non trovato o errore: pending
        if (!res || !res.ok || !res.found) {
          setPending_();
          setNotes_("nessuna nota");
          return;
        }

        // NOTE
        setNotes_(String(res.notes || "").trim() || "nessuna nota");

        // DATE
        var adminDateStr = String(res.adminDate || "").trim();
        if (!adminDateStr) {
          setPending_();
          return;
        }

        // atteso yyyy-mm-dd
        var d = new Date(adminDateStr + "T00:00:00");
        if (isNaN(d.getTime())) {
          setStatus_("NECESSARIO AGGIORNAMENTO", "red");
          return;
        }

        var now = new Date();
        var diffMs = now.getTime() - d.getTime();
        var diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays <= 365) {
          setStatus_("COMPLETO", "green");
        } else if (diffDays <= 365 * 3) {
          setStatus_("PARZIALE", "orange");
        } else {
          setStatus_("NECESSARIO AGGIORNAMENTO", "red");
        }
      })
      .catch(function () {
        // offline o errore: non bloccare
        setPending_();
        setNotes_("nessuna nota");
      });

    function setStatus_(label, color) {
      esitoSpan.textContent = label;
      statusBox.style.backgroundColor = color;
    }

    function setPending_() {
      esitoSpan.textContent = "IN ATTESA DI CONTROLLO";
      statusBox.style.backgroundColor = "grey";
    }

    function setNotes_(text) {
      if (!notesSpan) return;
      notesSpan.textContent = text;
    }
  }

  /* ===== helper per aprire/chiudere overlay ===== */
  function openOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.add("is-visible");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.remove("is-visible");
    overlay.setAttribute("aria-hidden", "true");
  }

  function setupCloseOnBgAndButtons(overlay) {
    if (!overlay) return;

    var closeBtns = overlay.querySelectorAll("[data-close-register]");
    for (var i = 0; i < closeBtns.length; i++) {
      closeBtns[i].addEventListener("click", function () {
        closeOverlay(overlay);
      });
    }

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay(overlay);
    });
  }

  var loginOverlay    = document.getElementById("loginOverlay");
  var registerOverlay = document.getElementById("registerOverlay");
  var forgotOverlay   = document.getElementById("forgotOverlay");

  /* ================== APERTURA dai pulsanti della welcome ================== */
  var openLoginBtn    = document.getElementById("openLogin");
  var openRegisterBtn = document.getElementById("openRegister");

  if (openLoginBtn) {
    openLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();

      var userStr = safeGet(LS_USER);
      if (userStr) {
        window.location.href = "index.html";
        return;
      }

      if (registerOverlay) openOverlay(registerOverlay);
      else if (loginOverlay) openOverlay(loginOverlay);
    });
  }

  if (openRegisterBtn && registerOverlay) {
    openRegisterBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openOverlay(registerOverlay);
    });
  }

  var regFromLogin = document.getElementById("openRegisterFromLogin");
  if (regFromLogin && loginOverlay && registerOverlay) {
    regFromLogin.addEventListener("click", function (e) {
      e.preventDefault();
      closeOverlay(loginOverlay);
      openOverlay(registerOverlay);
    });
  }

  var openForgot = document.getElementById("openForgot");
  if (openForgot && loginOverlay && forgotOverlay) {
    openForgot.addEventListener("click", function (e) {
      e.preventDefault();
      closeOverlay(loginOverlay);
      openOverlay(forgotOverlay);
    });
  }

  setupCloseOnBgAndButtons(loginOverlay);
  setupCloseOnBgAndButtons(registerOverlay);
  setupCloseOnBgAndButtons(forgotOverlay);

  /* ================== TOGGLE VISIBILITÀ PASSWORD ================== */
  var pwdWrappers = document.querySelectorAll(".reg-label-password");
  var ICON_OPEN   = "👁️";
  var ICON_CLOSED = "👁️‍🗨️";

  for (var j = 0; j < pwdWrappers.length; j++) {
    (function (wrapper) {
      var input  = wrapper.querySelector("input");
      var eyeBtn = wrapper.querySelector(".reg-eye");
      if (!input || !eyeBtn) return;

      eyeBtn.textContent = ICON_OPEN;
      eyeBtn.style.display = "block";

      eyeBtn.addEventListener("click", function () {
        var isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        eyeBtn.textContent = isHidden ? ICON_CLOSED : ICON_OPEN;
      });
    })(pwdWrappers[j]);
  }

  /* ================== PSEUDO-REGISTRAZIONE (NOME + COGNOME) ================== */
  var formReg = document.querySelector("#registerOverlay .reg-form");

  if (formReg) {
    formReg.addEventListener("submit", function (e) {
      e.preventDefault();

      var firstNameInput = document.getElementById("regFirstName");
      var lastNameInput  = document.getElementById("regLastName");

      var first = firstNameInput ? firstNameInput.value.trim() : "";
      var last  = lastNameInput  ? lastNameInput.value.trim()  : "";
      if (!first || !last) return;

      var avatarImg = document.getElementById("selectedAvatar");
      var avatarSrc = safeGet(LS_AVATAR);
      if (!avatarSrc && avatarImg) avatarSrc = avatarImg.src;
      if (!avatarSrc) avatarSrc = "resources/avatars/avatar0.png";

      var userData = {
        userId: getOrCreateUserId(),
        firstName: first,
        lastName: last,
        fullName: (first + " " + last).replace(/\s+/g, " "),
        avatar: avatarSrc
      };

      safeSet(LS_USER, JSON.stringify(userData));
      upsertUserInDb(userData);

      sendRegistrationToGoogleSheet(userData);

      closeOverlay(registerOverlay);
      setTimeout(function () {
        window.location.href = "index.html";
      }, 300);
    });
  }

  /* ================== SELETTORE AVATAR (OVERLAY) ================== */
  var avatarBoxes      = document.querySelectorAll(".reg-avatar, .profile-avatar");
  var avatarOverlay    = document.getElementById("avatarOverlay");
  var avatarOptions    = avatarOverlay ? avatarOverlay.querySelectorAll(".avatar-option") : [];
  var currentAvatarImg = null;

  setupCloseOnBgAndButtons(avatarOverlay);

  if (avatarOverlay && avatarOptions.length && avatarBoxes.length) {

    for (var k = 0; k < avatarBoxes.length; k++) {
      (function (box) {
        var img = box.querySelector("img");
        if (!img) return;

        box.style.cursor = "pointer";

        box.addEventListener("click", function () {
          currentAvatarImg = img;
          openOverlay(avatarOverlay);
        });
      })(avatarBoxes[k]);
    }

    for (var m = 0; m < avatarOptions.length; m++) {
      avatarOptions[m].addEventListener("click", function () {
        var newSrc = this.getAttribute("data-avatar");
        if (currentAvatarImg && newSrc) {
          currentAvatarImg.src = newSrc;

          safeSet(LS_AVATAR, newSrc);

          try {
            var storedUserStr = safeGet(LS_USER);
            if (storedUserStr) {
              var userObj = JSON.parse(storedUserStr);
              userObj.avatar = newSrc;
              safeSet(LS_USER, JSON.stringify(userObj));
            }
          } catch (err2) {
            console.error("Impossibile aggiornare l'avatar dell'utente", err2);
          }
        }
        closeOverlay(avatarOverlay);
      });
    }
  }

  /* ================== APPLICA I DATI SALVATI (AVATAR + NOME) ================== */
  try {
    var storedUserStr2 = safeGet(LS_USER);
    var savedAvatar    = safeGet(LS_AVATAR);
    var user = null;

    if (storedUserStr2) {
      try { user = JSON.parse(storedUserStr2); }
      catch (err) { console.error("Impossibile leggere i dati utente salvati", err); }
    }

    var avatarToUse = null;
    if (user && user.avatar) avatarToUse = user.avatar;
    else if (savedAvatar) avatarToUse = savedAvatar;

    var regAvatarImg2 = document.getElementById("selectedAvatar");
    if (regAvatarImg2 && avatarToUse) regAvatarImg2.src = avatarToUse;

    var profileAvatarImg2 = document.querySelector(".profile-avatar img");
    if (profileAvatarImg2 && avatarToUse) profileAvatarImg2.src = avatarToUse;

    if (user) {
      var greetSpan = document.getElementById("profileGreeting");
      var nameSpan  = document.getElementById("profileName");
      var lastNameSpan = document.getElementById("profileEmail");

      if (greetSpan && user.fullName) greetSpan.textContent = user.fullName;
      if (nameSpan && user.firstName) nameSpan.textContent = user.firstName;
      if (lastNameSpan && user.lastName) lastNameSpan.textContent = user.lastName;
    }

    // dopo aver applicato i dati utente, aggiorna status training
    applyTrainingStatusFromSheet_();

  } catch (err3) {
    console.error("Impossibile applicare i dati salvati", err3);
  }

});


/* ================== MINI-TOOLS ADMIN (GLOBALI) ================== */
window.DSM_getUsersDb = function () {
  try {
    var raw = localStorage.getItem("dsmUsersDb");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

window.DSM_setAdminDate = function (userId, dateStr) {
  if (!userId) return false;

  var db = DSM_getUsersDb();
  for (var i = 0; i < db.length; i++) {
    if (db[i] && db[i].userId === userId) {
      db[i].adminDate = dateStr || null;
      localStorage.setItem("dsmUsersDb", JSON.stringify(db));
      return true;
    }
  }
  return false;
};
