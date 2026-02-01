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
      // fallback se crypto.randomUUID non esiste
      var newId = null;
      try {
        newId = (crypto && crypto.randomUUID)
          ? crypto.randomUUID()
          : (Date.now() + "-" + Math.random().toString(16).slice(2));
      } catch (e2) {
        newId = Date.now() + "-" + Math.random().toString(16).slice(2);
      }

      try {
        localStorage.setItem(LS_USER_ID, newId);
      } catch (e3) { /* ignore */ }

      id = newId;
    }

    return id;
  }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
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

  var openLoginBtn    = document.getElementById("openLogin");
  var openRegisterBtn = document.getElementById("openRegister");

  // Se vuoi trasformare il tasto LOGIN in "entra se già registrato"
  // altrimenti aprirà comunque l'overlay login (che potrai poi rimuovere).
  if (openLoginBtn) {
    openLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Se esiste già un utente pseudo-registrato, entra direttamente
      var userStr = safeGet(LS_USER);
      if (userStr) {
        window.location.href = "index.html"; // oppure "paginaPersonale.html"
        return;
      }

      // Altrimenti apri direttamente registrazione (più coerente senza password/email)
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

  /* ========== link "Registrati" dentro il login → apre registrazione ========== */

  var regFromLogin = document.getElementById("openRegisterFromLogin");
  if (regFromLogin && loginOverlay && registerOverlay) {
    regFromLogin.addEventListener("click", function (e) {
      e.preventDefault();
      closeOverlay(loginOverlay);
      openOverlay(registerOverlay);
    });
  }

  /* ========== link "Hai dimenticato la tua password?" → apre forgot ========== */
  // (puoi anche eliminare forgotOverlay dal markup se non ti serve)

  var openForgot = document.getElementById("openForgot");
  if (openForgot && loginOverlay && forgotOverlay) {
    openForgot.addEventListener("click", function (e) {
      e.preventDefault();
      closeOverlay(loginOverlay);
      openOverlay(forgotOverlay);
    });
  }

  /* ========== chiusura generica (sfondo + bottoni data-close-register) ========== */

  setupCloseOnBgAndButtons(loginOverlay);
  setupCloseOnBgAndButtons(registerOverlay);
  setupCloseOnBgAndButtons(forgotOverlay);

  /* ================== TOGGLE VISIBILITÀ PASSWORD (OCCHIO) ================== */
  // Se hai rimosso i campi password dal markup, questo blocco non fa nulla (va bene).

  var pwdWrappers = document.querySelectorAll(".reg-label-password");
  var ICON_OPEN   = "👁️";      // password nascosta
  var ICON_CLOSED = "👁️‍🗨️";   // password visibile

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

      // avatar scelto
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

      // chiudi overlay e vai alla home (o pagina personale)
      closeOverlay(registerOverlay);
      window.location.href = "index.html"; // oppure "paginaPersonale.html"
    });
  }

  /* ================== SELETTORE AVATAR (OVERLAY) ================== */

  var avatarBoxes      = document.querySelectorAll(".reg-avatar, .profile-avatar");
  var avatarOverlay    = document.getElementById("avatarOverlay");
  var avatarOptions    = avatarOverlay ? avatarOverlay.querySelectorAll(".avatar-option") : [];
  var currentAvatarImg = null;

  // abilita chiusura overlay avatar con sfondo e bottoni data-close-register
  setupCloseOnBgAndButtons(avatarOverlay);

  if (avatarOverlay && avatarOptions.length && avatarBoxes.length) {

    // clic sui box avatar (login, registrazione, pagina personale)
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

    // clic su uno degli avatar nell’overlay
    for (var m = 0; m < avatarOptions.length; m++) {
      avatarOptions[m].addEventListener("click", function () {
        var newSrc = this.getAttribute("data-avatar");
        if (currentAvatarImg && newSrc) {
          currentAvatarImg.src = newSrc;

          // salva la scelta in localStorage
          safeSet(LS_AVATAR, newSrc);

          // se esiste già un utente salvato, aggiorna anche il suo avatar
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
      try {
        user = JSON.parse(storedUserStr2);
      } catch (err) {
        console.error("Impossibile leggere i dati utente salvati", err);
      }
    }

    var avatarToUse = null;
    if (user && user.avatar) {
      avatarToUse = user.avatar;
    } else if (savedAvatar) {
      avatarToUse = savedAvatar;
    }

    // avatar nei pannelli di login/registrazione
    var regAvatarImg2 = document.getElementById("selectedAvatar");
    if (regAvatarImg2 && avatarToUse) {
      regAvatarImg2.src = avatarToUse;
    }

    // avatar nella pagina personale
    var profileAvatarImg2 = document.querySelector(".profile-avatar img");
    if (profileAvatarImg2 && avatarToUse) {
      profileAvatarImg2.src = avatarToUse;
    }

    // testo nella pagina personale (se presente)
    if (user) {
		var greetSpan = document.getElementById("profileGreeting");
		var nameSpan  = document.getElementById("profileName");
		var lastNameSpan = document.getElementById("profileEmail"); // nel tuo HTML questo è "Cognome"

		if (greetSpan && user.fullName) {
		  greetSpan.textContent = user.fullName;     // Ciao! Nome Cognome
		}

		if (nameSpan && user.firstName) {
		  nameSpan.textContent = user.firstName;     // Nome: solo Nome
		}

		if (lastNameSpan && user.lastName) {
		  lastNameSpan.textContent = user.lastName;  // Cognome: solo Cognome
		}
    }
  } catch (err3) {
    console.error("Impossibile applicare i dati salvati", err3);
  }




});
