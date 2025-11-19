document.addEventListener('DOMContentLoaded', () => {
  // ============ TOAST AL CENTRO SCHERMO (istanza singola, riutilizzabile) ============ //
  const TOAST_DURATION = 2200;

  // Crea subito container e toast una sola volta
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.setAttribute('aria-live','polite');
    Object.assign(toastContainer.style, {
      position:'fixed',
      left:'50%',
      top:'50%',
      transform:'translate(-50%, -50%)',
      zIndex:'9999',
      pointerEvents:'none'
    });
    document.body.appendChild(toastContainer);
  }

  let appToast = document.getElementById('appToast');
  if (!appToast) {
    appToast = document.createElement('div');
    appToast.id = 'appToast';
    Object.assign(appToast.style, {
      maxWidth:'80vw',
      background:'rgba(0, 0, 0, 0.85)',
      color:'#fff',
      padding:'16px 20px',
      borderRadius:'14px',
      boxShadow:'0 8px 24px rgba(0,0,0,.3)',
      fontWeight:'700',
      fontSize:'16px',
      textAlign:'center',
      opacity:'0',
      transform:'scale(0.95)',
      transition:'opacity .25s ease, transform .25s ease',
      display:'inline-block',
      whiteSpace:'pre-line'
    });
    toastContainer.appendChild(appToast);
  }

  let toastTimer = null;
  function showToast(message) {
    appToast.textContent = message;
    // anima in
    requestAnimationFrame(() => {
      appToast.style.opacity = '1';
      appToast.style.transform = 'scale(1)';
    });
    // reset timer precedente e programma la scomparsa
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      appToast.style.opacity = '0';
      appToast.style.transform = 'scale(0.95)';
    }, TOAST_DURATION);
  }

  // Esponi globalmente per altri script (es. game_index.js)
  window.showToast = window.showToast || showToast;

  // 1️⃣ Aggiorna pillole in alto
  const hearts = parseInt(localStorage.getItem('pillvalueHeart') ?? '5', 10);
  const stars  = parseInt(localStorage.getItem('pillvalueStar') ?? '0', 10);
  document.querySelectorAll('.pillvalueHeart').forEach(el => el.textContent = hearts);
  document.querySelectorAll('.pillvalueStar').forEach(el => el.textContent = stars);

  // 2️⃣ Aggiorna ogni livello nel menu (percentuali, stelle, blocco livelli successivi)
  document.querySelectorAll('.hpageGame').forEach(section => {
    const category = section.querySelector('#titleGame h1')?.textContent.trim().toUpperCase();
    if (!category) return;

    section.querySelectorAll('.selectionLevel').forEach(sel => {
      const topic = sel.querySelector('.selectionLevelCateg h2')?.textContent.trim().toUpperCase();
      if (!topic) return;

      sel.querySelectorAll('.level-btn').forEach(btn => {
        const level = parseInt(btn.querySelector('.number')?.textContent ?? '0', 10);
        const key = `level:${category}|${topic}|${level}`;
        let data = null;
        try { data = JSON.parse(localStorage.getItem(key) || '{}'); } catch(_e){ data = {}; }

        const percent = Number.isFinite(data?.percent) ? data.percent : 0;
        const pctEl = btn.querySelector('.percentLevel h3');
        if (pctEl) pctEl.textContent = `${percent}%`;

        const star = btn.querySelector('.star');
        if (star) {
          star.style.background = (data?.starAwarded || percent === 100) ? 'gold' : '#848174';
        }

        // 🔒 BLOCCO DEI LIVELLI SUCCESSIVI + BADGE + MESSAGGIO ON CLICK
        if (level > 1) {
          const prevKey = `level:${category}|${topic}|${level - 1}`;
          let prevData = null;
          try { prevData = JSON.parse(localStorage.getItem(prevKey) || '{}'); } catch(_e){ prevData = {}; }

          const prevCompleted = (Number(prevData?.percent) >= 60) || !!prevData?.starAwarded;

          const ensureLockBadge = () => {
            let badge = btn.querySelector('.lock-badge');
            if (!badge) {
              badge = document.createElement('span');
              badge.className = 'lock-badge';
              badge.textContent = '🔒';
              Object.assign(badge.style, {
                position:'absolute',
                top:'6px',
                right:'6px',
                fontSize:'16px',
                lineHeight:'1',
                filter:'drop-shadow(0 1px 1px rgba(0,0,0,.3))'
              });
              const currentPos = getComputedStyle(btn).position;
              if (currentPos === 'static' || !currentPos) btn.style.position = 'relative';
              btn.appendChild(badge);
            }
          };
          const removeLockBadge = () => {
            const badge = btn.querySelector('.lock-badge');
            if (badge) badge.remove();
          };

          const LOCK_HANDLER_SYMBOL = '__lockClickHandler__';

          if (!prevCompleted) {
            btn.classList.add('locked');
            btn.style.opacity = '0.5';
            btn.setAttribute('aria-disabled', 'true');
            btn.setAttribute('title', 'Serve almeno il 60% nel livello precedente per sbloccare questo');
            ensureLockBadge();

            if (!btn[LOCK_HANDLER_SYMBOL]) {
              btn[LOCK_HANDLER_SYMBOL] = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const prevLevelNum = level - 1;
                showToast(`🔒 Livello bloccato!\nCompleta prima il livello ${prevLevelNum} di “${topic}” con almeno il 60%.`);
              };
              btn.addEventListener('click', btn[LOCK_HANDLER_SYMBOL]);
            }
          } else {
            btn.classList.remove('locked');
            btn.style.opacity = '';
            btn.removeAttribute('aria-disabled');
            btn.removeAttribute('title');
            removeLockBadge();

            if (btn[LOCK_HANDLER_SYMBOL]) {
              btn.removeEventListener('click', btn[LOCK_HANDLER_SYMBOL]);
              delete btn[LOCK_HANDLER_SYMBOL];
            }
          }
        }
      });
    });
  });
});
