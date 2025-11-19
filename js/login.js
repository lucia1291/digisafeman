document.addEventListener("DOMContentLoaded", function () {

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

  if (openLoginBtn && loginOverlay) {
    openLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openOverlay(loginOverlay);
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

  /* ================== CHECK PASSWORD / SALVATAGGIO DATI (REGISTRAZIONE) ================== */

  var formReg   = document.querySelector("#registerOverlay .reg-form");
  var pwd       = document.getElementById("regPassword");
  var pwdRepeat = document.getElementById("regPasswordConfirm");
  var pwdError  = document.getElementById("regPasswordError");

  if (formReg && pwd && pwdRepeat && pwdError) {
    formReg.addEventListener("submit", function (e) {
      pwdError.textContent = "";
      pwdError.classList.remove("is-visible");

      // se le password non coincidono → blocca l'invio
      if (pwd.value.trim() !== pwdRepeat.value.trim()) {
        e.preventDefault();
        pwdError.textContent = "Le password non coincidono.";
        pwdError.classList.add("is-visible");
        pwdRepeat.focus();
        return;
      }

      // se coincidono, oltre al normale submit salviamo i dati in localStorage
      var nomeInput  = formReg.querySelector('input[type="text"]');
      var emailInput = formReg.querySelector('input[type="email"]');
      var avatarImg  = document.getElementById("selectedAvatar");

      // avatar scelto
      var avatarSrc = null;
      try {
        avatarSrc = localStorage.getItem("selectedAvatarSrc");
      } catch (err) {
        avatarSrc = null;
      }
      if (!avatarSrc && avatarImg) {
        avatarSrc = avatarImg.src;
      }
      if (!avatarSrc) {
        avatarSrc = "resources/avatars/avatar0.png";
      }

      var userData = {
        name:     nomeInput  ? nomeInput.value.trim()  : "",
        email:    emailInput ? emailInput.value.trim() : "",
        password: pwd.value.trim(),
        avatar:   avatarSrc
      };

      try {
        localStorage.setItem("dsmUser", JSON.stringify(userData));
      } catch (err) {
        console.error("Impossibile salvare i dati utente", err);
      }
      // NON facciamo preventDefault qui, così il form mantiene il suo comportamento normale
    });

    pwdRepeat.addEventListener("input", function () {
      pwdError.textContent = "";
      pwdError.classList.remove("is-visible");
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
          currentAvatarImg = img;          // memorizza quale avatar aggiornare
          openOverlay(avatarOverlay);      // apre l’overlay con i quadrati avatar
        });
      })(avatarBoxes[k]);
    }

    // clic su uno degli avatar nell’overlay
    for (var m = 0; m < avatarOptions.length; m++) {
      avatarOptions[m].addEventListener("click", function () {
        var newSrc = this.getAttribute("data-avatar");
        if (currentAvatarImg && newSrc) {
          // aggiorna l’immagine nel box cliccato (registrazione, login o profilo)
          currentAvatarImg.src = newSrc;

          // salva la scelta in localStorage
          try {
            localStorage.setItem("selectedAvatarSrc", newSrc);
          } catch (err) {
            console.error("Impossibile salvare l'avatar", err);
          }

          // se esiste già un utente salvato, aggiorna anche il suo avatar
          try {
            var storedUserStr = localStorage.getItem("dsmUser");
            if (storedUserStr) {
              var userObj = JSON.parse(storedUserStr);
              userObj.avatar = newSrc;
              localStorage.setItem("dsmUser", JSON.stringify(userObj));
            }
          } catch (err2) {
            console.error("Impossibile aggiornare l'avatar dell'utente", err2);
          }
        }
        closeOverlay(avatarOverlay); // chiude l’overlay dopo la scelta
      });
    }
  }

  /* === applica i dati salvati (avatar + nome/email/password) se esistono === */
  try {
    var storedUserStr2 = localStorage.getItem("dsmUser");
    var savedAvatar    = localStorage.getItem("selectedAvatarSrc");
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
      var greetSpan   = document.getElementById("profileGreeting");
      var nameSpan    = document.getElementById("profileName");
      var emailSpan   = document.getElementById("profileEmail");
      var passSpan    = document.getElementById("profilePassword");

      if (greetSpan && user.name)    greetSpan.textContent = user.name;
      if (nameSpan && user.name)     nameSpan.textContent  = user.name;
      if (emailSpan && user.email)   emailSpan.textContent = user.email;
      if (passSpan && user.password) passSpan.textContent  = "********";
    }
  } catch (err) {
    console.error("Impossibile applicare i dati salvati", err);
  }

});
