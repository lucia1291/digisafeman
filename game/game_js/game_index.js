/* game_index.js — versione pulita
   ---------------------------------
   Obiettivi:
   1) Generare i link dei livelli rispettando il gating.
   2) Garantire che, una volta superata la soglia (≥60% o stella),
      il livello successivo resti sbloccato anche se i tentativi
      successivi hanno una percentuale più bassa.
   3) Bloccare l’accesso ai livelli se le vite sono 0, con feedback.
   4) Evitare duplicazioni del sistema di toast: usa window.showToast
      se disponibile (creato da game.js), altrimenti fallback alert().
*/

'use strict';

/* ==============================
   Utilità progresso livelli
============================== */
function storageKeyFor(category, topic, level) {
  const C = String(category || '').toUpperCase();
  const T = String(topic || '').toUpperCase();
  return `level:${C}|${T}|${level}`;
}

function getLevelProgress(category, topic, level) {
  try {
    const raw = localStorage.getItem(storageKeyFor(category, topic, level));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_e) {
    return null;
  }
}

function setLevelProgress(category, topic, level, patch) {
  const key = storageKeyFor(category, topic, level);
  let prev = {};
  try {
    prev = JSON.parse(localStorage.getItem(key) || '{}');
  } catch (_e) {
    prev = {};
  }
  const next = { ...prev, ...patch };
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}

/*
  Sblocco livelli
  ---------------
  Regola: il livello N è sbloccato se (N === 1) oppure
          il livello N-1 ha percent >= 60 oppure ha starAwarded true
          oppure ha già flagged unlockedNext true (lock-in persistente).
  Inoltre, appena rileviamo una condizione di sblocco, scriviamo
  prev.unlockedNext = true per fissare lo stato e renderlo persistente
  anche se in futuro la percentuale salvata fosse più bassa.
*/
function isUnlocked(category, topic, level) {
  if (level <= 1) return true; // Il primo livello è sempre aperto

  const prev = getLevelProgress(category, topic, level - 1) || {};
  const percent = Number(prev.percent) || 0;
  const hasStar = !!prev.starAwarded;
  const wasUnlocked = !!prev.unlockedNext;

  const meetsThreshold = (percent >= 60) || hasStar || wasUnlocked;

  // Lock-in (idempotente): se raggiunta la soglia e non marcato, marca ora
  if (meetsThreshold && !wasUnlocked) {
    setLevelProgress(category, topic, level - 1, { unlockedNext: true });
  }

  return meetsThreshold;
}

/* =========================================================
   1) Costruzione pulsanti livello (rispetta sblocco)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hpageGame').forEach(section => {
    const categoryEl = section.querySelector('#titleGame h1');
    const category = categoryEl ? categoryEl.textContent.trim() : '';
    if (!category) return;

    section.querySelectorAll('.selectionLevel').forEach(sel => {
      const topicEl = sel.querySelector('.selectionLevelCateg h2');
      const topic = topicEl ? topicEl.textContent.trim() : '';
      if (!topic) return;

      sel.querySelectorAll('.level-btn').forEach(btn => {
        const numberEl = btn.querySelector('.number');
        const level = parseInt(numberEl ? numberEl.textContent : '0', 10);
        if (!level) return;

        // Tipo di gioco dal data-attribute (quest di default)
        const gameType = (btn.dataset.game || 'quest').toLowerCase();

        // Pagina giusta in base al tipo
        const targetPage = gameType === 'find'
          ? 'find.html'
          : 'quest.html';

        const href = `${targetPage}?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}&level=${level}`;
        const unlocked = isUnlocked(category, topic, level);

        if (unlocked) {
          // Livello sbloccato → link cliccabile
          if (btn.tagName.toLowerCase() === 'a') {
            // già <a>, aggiorno solo attributi
            btn.setAttribute('href', href);
            btn.classList.remove('locked');
            btn.removeAttribute('aria-disabled');
            btn.removeAttribute('title');
          } else {
            // trasformo <button> in <a>, preservando data-*
            const a = document.createElement('a');

            // classi: tolgo 'locked' se presente
            a.className = btn.className.replace(/\blocked\b/g, '').trim();
            a.classList.add('level-btn');

            // preserva tutti i data-attribute (es. data-game="find")
            for (const [k, v] of Object.entries(btn.dataset)) {
              a.dataset[k] = v;
            }

            a.href = href;
            a.innerHTML = btn.innerHTML;
            btn.replaceWith(a);
          }
        } else {
          // Livello bloccato → button non cliccabile con feedback
          let buttonEl = btn;

          if (btn.tagName.toLowerCase() === 'a') {
            const b = document.createElement('button');
            b.className = `${btn.className} locked`;
            b.innerHTML = btn.innerHTML;

            // preserva i data-attribute (es. data-game="find")
            for (const [k, v] of Object.entries(btn.dataset)) {
              b.dataset[k] = v;
            }

            buttonEl = b;
            btn.replaceWith(b);
          } else {
            btn.classList.add('locked');
          }

          buttonEl.setAttribute('type', 'button');
          buttonEl.setAttribute('aria-disabled', 'true');
          buttonEl.title = `🔒 Completa il livello ${level - 1} con almeno il 60% per sbloccare`;

          // Feedback al click sul livello bloccato
          buttonEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const msg = `Per sbloccare il livello ${level} serve ≥60% (o stella) nel livello ${level - 1}.`;
            if (window.showToast) {
              window.showToast(`🔒 ${msg}`);
            } else {
              alert(msg);
            }
          });
        }
      });
    });
  });
});

/* ==================================================================
   2) Blocco accesso livelli quando cuori = 0 (usa showToast se esiste)
   ================================================================== */
(function () {
  function heartsNow() {
    return parseInt(localStorage.getItem('pillvalueHeart') ?? '5', 10);
  }

  // Intercetta i click sui livelli <a.level-btn> e blocca se vite = 0
  function interceptLevelClick(e) {
    const a = e.target.closest('a.level-btn');
    if (!a) return;

    if (heartsNow() <= 0) {
      e.preventDefault();
      e.stopPropagation();

      if (window.showToast) {
        window.showToast('💔 Vite esaurite!\nGuadagna altri cuori per continuare.');
      } else {
        alert('Vite esaurite! Guadagna altri cuori per continuare.');
      }

      const pill = document.querySelector('.pillvalueHeart');
      if (pill && pill.animate) {
        pill.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
          { duration: 350, easing: 'ease-out' }
        );
      }
    }
  }

  document.addEventListener('click', interceptLevelClick, true);
})();

/* ==================================================
   3) Gestione vite + modale “consiglio” con ricompensa
   ================================================== */
(function () {
  const HEARTS_KEY = 'pillvalueHeart';
  const HEARTS_MAX = 5;

  const btn = document.getElementById('btnGainLife');
  const modal = document.getElementById('lifeTipModal');
  const tipEl = document.getElementById('ltm-tip');
  const countEl = document.getElementById('ltm-count');
  const closeEl = document.getElementById('ltm-close');

  // Se non esistono gli elementi (es. nelle pagine quest/find) esci
  if (!btn || !modal || !tipEl || !countEl || !closeEl) return;

  const getHearts = () => parseInt(localStorage.getItem(HEARTS_KEY) ?? '5', 10);
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const setHearts = (n) => {
    localStorage.setItem(HEARTS_KEY, String(n));
    refreshPills();
    syncButton();
  };

  function refreshPills() {
    const n = getHearts();
    document.querySelectorAll('.pillvalueHeart').forEach(el => {
      el.textContent = n;
    });
  }

  function syncButton() {
    const hearts = getHearts();
    const enable = hearts < HEARTS_MAX;
    btn.disabled = !enable;
    btn.title = enable ? 'Guadagna una vita (+1)' : 'Vite al massimo';

    if (hearts === 0 && btn.animate) {
      btn.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
        { duration: 400, easing: 'ease-out' }
      );
    }
  }

  const TIPS = [
    'Fai una micro-pausa di 20 secondi: sgranchisci collo e spalle.',
    'Bevi un bicchiere d’acqua: idratazione = concentrazione.',
    'Alza lo sguardo: 20 secondi lontano dallo schermo per riposare gli occhi.',
    'Controlla la postura: piedi a terra, schiena appoggiata.',
    'Respira profondamente 5 volte per ridurre lo stress.',
  ];

  function randomTip() {
    return TIPS[Math.floor(Math.random() * TIPS.length)];
  }

  let timerId = null;

  function openTip() {
    tipEl.textContent = randomTip();
    countEl.textContent = '10';
    closeEl.disabled = true;
    modal.hidden = false;

    let remaining = 10;
    timerId = setInterval(() => {
      remaining -= 1;
      countEl.textContent = String(remaining);
      if (remaining <= 0) {
        clearInterval(timerId);
        timerId = null;
        closeEl.disabled = false;
        closeEl.focus();
      }
    }, 1000);
  }

  function closeTipAndReward() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    modal.hidden = true;

    const hearts = getHearts();
    const next = clamp(hearts + 1, 0, HEARTS_MAX);
    if (next !== hearts) {
      setHearts(next);
      if (window.showToast) {
        window.showToast(`❤️ +1 vita! (${next}/${HEARTS_MAX})`);
      }
    }
  }

  btn.addEventListener('click', openTip);
  closeEl.addEventListener('click', closeTipAndReward);

  const backdrop = modal.querySelector('.ltm-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (closeEl.disabled) {
        e.stopPropagation();
      } else {
        closeTipAndReward();
      }
    });
  }

  // Inizializza stato all’avvio
  document.addEventListener('DOMContentLoaded', () => {
    refreshPills();
    syncButton();
  });

  // Sincronizza tra tab
  window.addEventListener('storage', (e) => {
    if (e.key === HEARTS_KEY) {
      refreshPills();
      syncButton();
    }
  });
})();

/* ============================
   4) Help overlay (popup aiuto)
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
  const helpBtn = document.getElementById('helpBtn');
  const helpOverlay = document.getElementById('helpOverlay');
  const helpClose = document.getElementById('helpClose');

  // Non tutte le pagine hanno l’overlay
  if (!helpBtn || !helpOverlay || !helpClose) {
    return;
  }

  helpBtn.addEventListener('click', () => {
    helpOverlay.hidden = false;
  });

  helpClose.addEventListener('click', () => {
    helpOverlay.hidden = true;
  });

  helpOverlay.addEventListener('click', (e) => {
    if (e.target.classList && e.target.classList.contains('help-backdrop')) {
      helpOverlay.hidden = true;
    }
  });
});
