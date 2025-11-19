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

