// hscrollGame.js — scroll orizzontale a "pagine" con wrap (circolare)
document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.getElementById("hpages");
  document.body.setAttribute("data-layout", "hscroll");

  // tutte le frecce presenti nelle varie sezioni
  const arrowsLeft  = document.querySelectorAll(".scroll-arrow.left");
  const arrowsRight = document.querySelectorAll(".scroll-arrow.right");

  // pagine orizzontali (supporta .hpage e .hpageGame)
  const pages = Array.from(viewport.querySelectorAll(".hpage, .hpageGame"));
  const pageCount = Math.max(pages.length, 1);

  // indice pagina attuale (arrotondato per evitare micro scarti di pixel)
  function currentIndex() {
    const pageWidth = viewport.clientWidth || 1;
    const idx = Math.round(viewport.scrollLeft / pageWidth);
    return Math.min(Math.max(idx, 0), pageCount - 1);
  }

  // vai a un indice normalizzandolo in modo circolare
  function goTo(index) {
    if (pageCount === 0) return;
    const pageWidth = viewport.clientWidth || 1;
    const normalized = ((index % pageCount) + pageCount) % pageCount; // wrap
    viewport.scrollTo({
      left: normalized * pageWidth,
      behavior: "smooth"
    });
  }

  function goNext() { goTo(currentIndex() + 1); }
  function goPrev() { goTo(currentIndex() - 1); }

  // click su TUTTE le frecce
  arrowsRight.forEach(btn => btn.addEventListener("click", goNext));
  arrowsLeft.forEach(btn  => btn.addEventListener("click", goPrev));

  // tastiera: frecce ← →
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft")  goPrev();
  });

  // al resize: riallinea alla pagina corrente (debounce)
  let rAF = null;
  window.addEventListener("resize", () => {
    if (rAF) cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => goTo(currentIndex()));
  });
});





// LINK ALLA PAGINA CORRISPONDENTE HREF

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const pageIndex = parseInt(params.get("page"));

  if (!isNaN(pageIndex)) {
    const hpages = document.getElementById("hpages");
    const targetSection = hpages.querySelectorAll(".hpageGame")[pageIndex - 1];
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "instant", inline: "center" });
    }
  }
});