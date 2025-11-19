/* FUNZIONI MENU HEADER TOGGLE ------------------------------------------------- */

function toggleMenu(btn) {
  const menu = document.getElementById("menuButton");
  const menu2 = document.getElementById("menuButtonImposta");

  const menuIsOpen = menu.style.display === "block";
  const menu2IsOpen = menu2.style.display === "block";

  // Se entrambi aperti, chiudi entrambi
  if (menuIsOpen && menu2IsOpen) {
    menu.style.display = "none";
    menu2.style.display = "none";
    btn.classList.remove("active"); // rimuovi la classe X
    return;
  }

  // Altrimenti fai il toggle normale solo per menuButton
  btn.classList.toggle("active");

  if (menuIsOpen) {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}

function toggleMenu2(btn) {
  const menu = document.getElementById("menuButtonImposta");

  btn.classList.toggle("active");

  if (menu.style.display === "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}

/* GESTISCE NAVBAR + GOPLAY ------------------------------------------------- */
function toggleMenu3(btn) {
  const menu    = document.getElementById("navbar");
  const wrapper = document.getElementById("menuButtonImposta");
  const go      = document.getElementById("goPlay");

  const isMenuVisible = menu.style.display === "flex";

  if (isMenuVisible) {
    // 👉 STO NASCONDENDO LA NAVBAR
    menu.style.display = "none";
    document.body.classList.add("no-navbar");
    wrapper.classList.remove("inactive");
    wrapper.classList.add("active");
    localStorage.setItem("menuOpen", "false");
    localStorage.setItem("menuColor", "active");

    // goPlay deve stare sopra SOLO il footer
    if (go) go.style.bottom = "var(--h-footer)";

  } else {
    // 👉 STO MOSTRANDO LA NAVBAR
    menu.style.display = "flex";
    document.body.classList.remove("no-navbar");
    wrapper.classList.remove("active");
    wrapper.classList.add("inactive");
    localStorage.setItem("menuOpen", "true");
    localStorage.setItem("menuColor", "inactive");

    // goPlay deve stare sopra navbar + footer
    if (go) go.style.bottom = "calc(var(--h-navbar) + var(--h-footer))";
  }
}

// All'avvio della pagina
window.addEventListener("DOMContentLoaded", () => {
  const menu    = document.getElementById("navbar");
  const wrapper = document.getElementById("menuButtonImposta");
  const go      = document.getElementById("goPlay");

  if (!menu || !wrapper) return; // pagina senza navbar: esci tranquillo

  const isOpen     = localStorage.getItem("menuOpen") === "true";
  const savedClass = localStorage.getItem("menuColor") || "active";

  // Imposta visibilità menu
  menu.style.display = isOpen ? "flex" : "none";

  // Allinea la classe sul body in base allo stato salvato
  document.body.classList.toggle("no-navbar", !isOpen);

  // Imposta la classe corretta sul contenitore
  wrapper.classList.remove("active", "inactive");
  wrapper.classList.add(savedClass);

  // ⭐ Posiziona SUBITO goPlay in base allo stato salvato
  if (go) {
    if (isOpen) {
      // navbar attiva → sopra navbar + footer
      go.style.bottom = "calc(var(--h-navbar) + var(--h-footer))";
    } else {
      // navbar già disattivata → sopra solo footer
      go.style.bottom = "var(--h-footer)";
    }
  }
});

/* PULSANTE TORNA INDIETRO ------------------------------------------------- */

function goBack() {
  window.history.back();
}


/* SISTEMA DEL CAROSELLOOOOOOOO ------------------------------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById('carousel');
  if (!carousel) return;

  const dots = document.querySelectorAll('.dot');

  carousel.addEventListener('scroll', () => {
    const index = Math.round(carousel.scrollLeft / carousel.clientWidth);
    updateDots(index);
  });

  function updateDots(activeIndex) {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }
});
