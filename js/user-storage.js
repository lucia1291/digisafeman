/* ================== USER STORAGE (Google Sheet) ================== */

var USER_STORAGE = (function () {

  var LS_USER_ID = "digisafe_user_id";
  var LS_USER = "dsmUser";
  var LS_AVATAR = "selectedAvatarSrc";

  var GOOGLE_SHEET_WEBAPP_URL =
    "https://script.google.com/macros/s/AKfycbzn_22DvYXzmU3EjSul2GwrYz8x1SzYzQWFnSOV6OH7Xxw071inqXildr0fgFEYtlC-oA/exec";

  function getOrCreateUserId() {
    var id = localStorage.getItem(LS_USER_ID);
    if (!id) {
      id = "U" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(LS_USER_ID, id);
    }
    return id;
  }

  function getSavedAvatar() {
    return localStorage.getItem(LS_AVATAR) || "resources/avatars/avatar0.png";
  }

  function saveUser(firstName, lastName) {
    var userData = {
      userId: getOrCreateUserId(),
      firstName: firstName,
      lastName: lastName,
      fullName: (firstName + " " + lastName).replace(/\s+/g, " "),
      avatar: getSavedAvatar()
    };

    // salva localmente
    localStorage.setItem(LS_USER, JSON.stringify(userData));

    // salva / aggiorna su Google Sheet
    try {
      fetch(GOOGLE_SHEET_WEBAPP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(userData)
      });
    } catch (e) {}

    return userData;
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(LS_USER));
    } catch (e) {
      return null;
    }
  }

  return {
    saveUser,
    getUser
  };

})();
