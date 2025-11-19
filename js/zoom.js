(function(){
    const zoomer = document.getElementById('zoomer');
    const panzoom = zoomer.querySelector('.panzoom');
    const caption = document.getElementById('caption');
    const markers = Array.from(zoomer.querySelectorAll('.marker'));
    const photoImg = document.getElementById('photoImage');

    let zoomed = false;
    let photoReady = false;

    // Stato pan durante il drag
    let isPointerDown = false;
    let startX = 0, startY = 0;
    let startTx = 0, startTy = 0;
    let targetTx = 0, targetTy = 0; // valori desiderati
    let lastAppliedTx = 0, lastAppliedTy = 0; // ultimi applicati
    let movedDuringDrag = false;

    // RAF throttling
    let rafId = null;
    function applyTransformRaf() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (lastAppliedTx !== targetTx || lastAppliedTy !== targetTy) {
          panzoom.style.setProperty('--tx', targetTx + 'px');
          panzoom.style.setProperty('--ty', targetTy + 'px');
          lastAppliedTx = targetTx;
          lastAppliedTy = targetTy;
        }
      });
    }

    /* Precarica la foto realistica per evitare flicker al primo zoom */
    function preloadPhoto() {
      if (!photoImg || !photoImg.src) return;
      if (photoImg.complete) {
        photoReady = true;
        return;
      }
      photoImg.addEventListener('load', () => { photoReady = true; }, { once: true });
      photoImg.addEventListener('error', () => { photoReady = false; }, { once: true });
    }
    preloadPhoto();

    function getScale() {
      const rootStyles = getComputedStyle(document.documentElement);
      const s = parseFloat(rootStyles.getPropertyValue('--scale'));
      return Number.isFinite(s) && s > 0 ? s : 2.6;
    }

    // Limita la traslazione per evitare "vuoti" ai bordi
    function clampPan(tx, ty) {
      const rect = zoomer.getBoundingClientRect();
      const s = getScale();
      const minTx = rect.width  - rect.width  * s;
      const minTy = rect.height - rect.height * s;
      const maxTx = 0;
      const maxTy = 0;
      return {
        tx: Math.max(minTx, Math.min(tx, maxTx)),
        ty: Math.max(minTy, Math.min(ty, maxTy))
      };
    }

    function setTransformImmediate(tx, ty) {
      targetTx = tx;
      targetTy = ty;
      lastAppliedTx = tx;
      lastAppliedTy = ty;
      panzoom.style.setProperty('--tx', tx + 'px');
      panzoom.style.setProperty('--ty', ty + 'px');
    }

    function zoomToPoint(px, py, text){
      const rect = zoomer.getBoundingClientRect();
      const s = getScale();

      let tx = (rect.width / 2) - (px * s);
      let ty = (rect.height / 2) - (py * s);
      ({ tx, ty } = clampPan(tx, ty));
      setTransformImmediate(tx, ty);

      zoomer.classList.add('zoomed');
      // blocca lo scroll nativo mentre siamo in zoom-in
      zoomer.style.touchAction = 'none';        // evita scroll/pinch su touch
      zoomer.style.overscrollBehavior = 'contain'; // limita l’elastic scroll

      caption.textContent = text || '';
      caption.classList.add('show');
      zoomed = true;
    }

    function zoomOut(){
      setTransformImmediate(0, 0);
      zoomer.classList.remove('zoomed');
      caption.classList.remove('show');
      zoomed = false;

      // ripristina comportamento di scroll normale
      zoomer.style.touchAction = '';
      zoomer.style.overscrollBehavior = '';
    }

    // Clic su marcatore => zoom sul centro del bottone
    markers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = zoomer.getBoundingClientRect();
        const b = btn.getBoundingClientRect();
        const centerX = (b.left + b.right) / 2 - rect.left;
        const centerY = (b.top + b.bottom) / 2 - rect.top;
        const text = btn.getAttribute('data-caption') || '';

        if (zoomer.classList.contains('zoomed')) {
          zoomOut();
        } else {
          zoomToPoint(centerX, centerY, text);
        }
      });
    });

    // Drag per fare PAN quando zoomed (pointer events = mouse + touch + pen)
    let savedTransition = getComputedStyle(panzoom).transition;

    zoomer.addEventListener('pointerdown', (e) => {
      if (!zoomed) return;

      isPointerDown = true;
      movedDuringDrag = false;

      startX = e.clientX;
      startY = e.clientY;

      // leggi i valori correnti
      const txStr = getComputedStyle(panzoom).getPropertyValue('--tx').trim();
      const tyStr = getComputedStyle(panzoom).getPropertyValue('--ty').trim();
      startTx = parseFloat(txStr) || 0;
      startTy = parseFloat(tyStr) || 0;

      // durante il drag niente transition per evitare scatti
      savedTransition = getComputedStyle(panzoom).transition;
      panzoom.style.transition = 'none';

      zoomer.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    zoomer.addEventListener('pointermove', (e) => {
      if (!isPointerDown || !zoomed) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!movedDuringDrag && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        movedDuringDrag = true;
      }

      let tx = startTx + dx;
      let ty = startTy + dy;
      ({ tx, ty } = clampPan(tx, ty));

      // aggiorna target e applica via RAF
      targetTx = tx;
      targetTy = ty;
      applyTransformRaf();

      // blocca lo scroll della pagina durante il pan
      e.preventDefault();
    }, { passive: false });

    function endPointer(e){
      if (!isPointerDown) return;
      isPointerDown = false;
      try { zoomer.releasePointerCapture(e.pointerId); } catch {}
      // ripristina la transition dopo il drag
      panzoom.style.transition = savedTransition || '';

      if (movedDuringDrag) {
        suppressNextClick();
      }
    }

    zoomer.addEventListener('pointerup', endPointer);
    zoomer.addEventListener('pointercancel', endPointer);
    zoomer.addEventListener('lostpointercapture', endPointer);

    // Sopprime un singolo click subito dopo un drag (evita zoom-out accidentale)
    function suppressNextClick() {
      const handler = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        zoomer.removeEventListener('click', handler, true);
      };
      zoomer.addEventListener('click', handler, true);
      setTimeout(() => zoomer.removeEventListener('click', handler, true), 0);
    }

    // Cliccando sull'immagine quando è zoomata => zoom-out
    zoomer.addEventListener('click', () => {
      if (zoomed) zoomOut();
    });

    // Esce dallo zoom al resize per evitare sfasamenti visivi
    window.addEventListener('resize', () => {
      if (!zoomed) return;
      zoomOut();
    });
  })();