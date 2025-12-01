// hscroll.js — estratto dallo <script> inline
document.addEventListener('DOMContentLoaded', function(){
      document.body.setAttribute('data-layout','hscroll');

      const vp   = document.getElementById('hpages');
      const bar  = document.querySelector('#hscroll-progress .bar');
      const prog = document.getElementById('hscroll-progress');

      function pageCount(){ return vp ? vp.querySelectorAll('.hpage').length : 1; }

      function updateProgress(){
        const pages = Math.max(1, pageCount());
        const maxScroll = Math.max(1, vp.scrollWidth - vp.clientWidth);
        const currentScroll = vp.scrollLeft;
        const percentScroll = (currentScroll / maxScroll) * 100;

        const baseWidth = 100 / pages;
        const index = Math.round(currentScroll / vp.clientWidth);
        const proportional = baseWidth * (index + 1);

        const finalWidth = Math.min(100, Math.max(percentScroll, proportional, baseWidth));
        bar.style.width = finalWidth + '%';
        prog.setAttribute('aria-valuenow', String(Math.round(finalWidth)));
      }

      vp.addEventListener('scroll', updateProgress, {passive:true});
      window.addEventListener('resize', updateProgress);
      const mo = new MutationObserver(updateProgress);
      mo.observe(vp, {childList: true, subtree: false});
      updateProgress();

      // Randomizza le altezze dei blocchi colorati
      const groups = document.querySelectorAll('.blocks[data-randomizable="true"] .block');
      groups.forEach((el) => {
        const min = 50;  // px
        const max = 230; // px
        const h = Math.floor(Math.random() * (max - min + 1)) + min;
        el.style.setProperty('--h', h + 'px');
      });
	  
		  // --- CLICK sulla barra di progresso per cambiare pagina ---
	  const progressBarContainer = document.getElementById('hscroll-progress');
	  if (progressBarContainer && vp) {
		progressBarContainer.addEventListener('click', (e) => {
		  const rect = progressBarContainer.getBoundingClientRect();
		  const clickX = e.clientX - rect.left;        // posizione click
		  const percent = clickX / rect.width;         // 0 → 1

		  const pages = Math.max(1, pageCount());
		  const targetIndex = Math.floor(percent * pages); // pagina cliccata
		  const targetScrollLeft = targetIndex * vp.clientWidth;

		  vp.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
		});
	  }
    });

// --- DOTS PAGINATION (versione 100% JS, senza modifiche all'HTML) ---
document.addEventListener("DOMContentLoaded", () => {

  const vp = document.getElementById("hpages");
  if (!vp) return;

  // CREA IL CONTAINER DEI PALLINI
  const dotsContainer = document.createElement("div");
  dotsContainer.id = "hscroll-dots";
  dotsContainer.style.display = "flex";
  dotsContainer.style.justifyContent = "center";
  dotsContainer.style.gap = "10px";
  dotsContainer.style.margin = "10px 0 15px 0";

  // LO INSERISCE AUTOMATICAMENTE PRIMA DI <main>
  const main = document.querySelector("main.hscroll-layout");
  main.parentNode.insertBefore(dotsContainer, main);

  // CREA I PALLINI IN BASE AL NUMERO DI PAGINE
  const pages = vp.querySelectorAll(".hpage").length;

  for (let i = 0; i < pages; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";
    dot.style.width = "10px";
    dot.style.height = "10px";
    dot.style.borderRadius = "50%";
    dot.style.background = "#bbb";
    dot.style.transition = "background 0.3s, transform 0.3s";
    dot.dataset.index = i;

    if (i === 0) {
      dot.style.background = "#333";
      dot.style.transform = "scale(1.3)";
    }

    dotsContainer.appendChild(dot);
  }

  const dots = dotsContainer.querySelectorAll(".dot");

  // CLICK → NAVIGAZIONE TRA LE PAGINE
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.dataset.index);
      vp.scrollTo({ left: index * vp.clientWidth, behavior: "smooth" });
    });
  });

  // SCROLL → AGGIORNA IL PALLINO ATTIVO
  vp.addEventListener("scroll", () => {
    const index = Math.round(vp.scrollLeft / vp.clientWidth);

    dots.forEach((d, i) => {
      if (i === index) {
        d.style.background = "#333";
        d.style.transform = "scale(1.3)";
      } else {
        d.style.background = "#bbb";
        d.style.transform = "scale(1)";
      }
    });
  });

});
