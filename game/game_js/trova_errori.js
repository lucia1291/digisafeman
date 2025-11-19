(function () {
  // ====== PARAMETRI URL (come quest.js) ======
  const params = new URLSearchParams(location.search);
  const CATEGORY = (params.get('category') || 'MACCHINARI').toUpperCase();
  const TOPIC = (params.get('topic') || 'MOLATRICE').toUpperCase(); // esempio default
  const LEVEL_NUMBER = parseInt(params.get('level') || '1', 10);

  // ====== STORAGE KEY COMPATIBILE con il resto ======
  const STORAGE_KEY = `level:${CATEGORY}|${TOPIC}|${LEVEL_NUMBER}`;

  // ====== STATO VITE / STELLE (come quest.js) ======
  let hearts = parseInt(localStorage.getItem('pillvalueHeart') ?? '5', 10);
  let stars  = parseInt(localStorage.getItem('pillvalueStar') ?? '0', 10);

  const pillHearts = document.getElementById('pillHearts');
  const pillStars  = document.getElementById('pillStars');
  function refreshPills(){ if(pillHearts) pillHearts.textContent = hearts; if(pillStars) pillStars.textContent = stars; }
  function saveHearts(){ localStorage.setItem('pillvalueHeart', String(hearts)); }
  function saveStars(){  localStorage.setItem('pillvalueStar',  String(stars));  }

  // ====== SCENE / ERRORI (3 schermate x 3 errori) ======
  const scenes = [
    {
      title: "Pericoli",
      image: "trova1.png",
      description: "Trova i 3 errori nascosti nella scena.",
      errors: [
        { x: 32, y: 27, label: "Mancanza di protezione per il viso" },
        { x: 58, y: 45, label: "Protezione della mola non adeguata" },
        { x: 40, y: 69, label: "Operatore senza guanti protettivi" }
      ]
    },
    {
      title: "Pericoli",
      image: "trova2.png",
      description: "Individua altri 3 errori di sicurezza.",
      errors: [
        { x: 25, y: 30, label: "Errore 1 schermata 2" },
        { x: 60, y: 55, label: "Errore 2 schermata 2" },
        { x: 75, y: 70, label: "Errore 3 schermata 2" }
      ]
    },
    {
      title: "Pericoli",
      image: "trova3.png",
      description: "Ultima schermata: trova gli ultimi 3 errori.",
      errors: [
        { x: 30, y: 35, label: "Errore 1 schermata 3" },
        { x: 55, y: 50, label: "Errore 2 schermata 3" },
        { x: 70, y: 65, label: "Errore 3 schermata 3" }
      ]
    }
  ];

  const TOTAL_ERRORS = scenes.reduce((sum, s) => sum + s.errors.length, 0);

  // ====== DOM GIOCO 2 ======
  const imageShell   = document.getElementById('imageShell');
  const sceneImage   = document.getElementById('sceneImage');
  const tagTitleEl   = document.getElementById('tagTitle');
  const topLabelTitle= document.getElementById('topLabelTitle');
  const captionText  = document.getElementById('captionText');
  const foundTopEl   = document.getElementById('foundTop');
  const totTopEl     = document.getElementById('totTop');
  const sceneIndexEl = document.getElementById('sceneIndex');
  const sceneTotalEl = document.getElementById('sceneTotal');
  const btnNextScene = document.getElementById('btnNextScene');
  const progressDots = document.getElementById('progressDots');

  // ====== DOM RIEPILOGO (UGUALE A quest.js) ======
  const summary   = document.getElementById('summary');
  const card      = document.getElementById('card');
  const scoreLine = document.getElementById('scoreLine');
  const meterBar  = document.getElementById('meterBar');
  const levelStar = document.getElementById('levelStar');
  const btnRetry  = document.getElementById('btnRetry');
  const btnMenu   = document.getElementById('btnMenu');

  // ====== STATO GIOCO 2 ======
  let currentScene = 0;
  // per ogni scena, un Set con gli indici di errore trovati
  const foundPerScene = scenes.map(() => new Set());
  let foundGlobal = 0; // conteggio totale errori trovati (per il riepilogo)

  // ====== PROGRESS DOTS (3 schermate) ======
  function renderDots() {
    if (!progressDots) return;
    progressDots.innerHTML = '';
    for (let i = 0; i < scenes.length; i++) {
      const d = document.createElement('span');
      d.className = 'dot' + (i === currentScene ? ' active' : '');
      progressDots.appendChild(d);
    }
  }

  // ====== CARICA SCENA ======
  function loadScene(index) {
    currentScene = index;
    const scene = scenes[index];

    if (!scene || !imageShell || !sceneImage) return;

    // titolo e testi
    if (tagTitleEl) tagTitleEl.textContent = scene.title;
    if (topLabelTitle) topLabelTitle.textContent = scene.title;
    if (captionText) captionText.textContent = scene.description;

    if (sceneIndexEl) sceneIndexEl.textContent = String(index + 1);
    if (sceneTotalEl) sceneTotalEl.textContent = String(scenes.length);

    if (totTopEl) totTopEl.textContent = String(scene.errors.length);
    if (foundTopEl) foundTopEl.textContent = String(foundPerScene[index].size);

    sceneImage.src = scene.image;

    // pulisci vecchi hotspot
    imageShell.querySelectorAll('.hotspot').forEach(h => h.remove());

    // crea hotspot per la scena corrente
    scene.errors.forEach((err, i) => {
      const btn = document.createElement('button');
      btn.className = 'hotspot';
      btn.style.left = err.x + "%";
      btn.style.top  = err.y + "%";
      btn.dataset.errorIndex = String(i);
      if (foundPerScene[index].has(i)) {
        btn.classList.add('found');
      }
      btn.addEventListener('click', onHotspotClick);
      imageShell.appendChild(btn);
    });

    renderDots();
  }

  // ====== CLICK SU HOTSPOT (errore corretto) ======
  function onHotspotClick(e) {
    const scene = scenes[currentScene];
    const idx = Number(e.currentTarget.dataset.errorIndex || '0');

    // già trovato → solo caption
    if (foundPerScene[currentScene].has(idx)) {
      if (captionText) captionText.textContent = scene.errors[idx].label;
      return;
    }

    // nuovo errore
    foundPerScene[currentScene].add(idx);
    foundGlobal++;
    e.currentTarget.classList.add('found');

    if (foundTopEl) foundTopEl.textContent = String(foundPerScene[currentScene].size);
    if (captionText) captionText.textContent = scene.errors[idx].label;
  }

  // ====== CLICK FUORI HOTSPOT → "non è qui" / "ci sei quasi" ======
  if (imageShell) {
    imageShell.addEventListener('click', function (e) {
      if (e.target.classList.contains('hotspot')) return;

      const rect = imageShell.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const scene = scenes[currentScene];
      let near = false;
      const threshold = 50; // px

      scene.errors.forEach(err => {
        const hx = rect.width * (err.x / 100);
        const hy = rect.height * (err.y / 100);
        const dist = Math.hypot(clickX - hx, clickY - hy);
        if (dist < threshold) near = true;
      });

      const hint = document.createElement('div');
      hint.className = 'hint-popup';
      hint.textContent = near ? 'ci sei quasi' : 'non è qui';
      hint.style.left = clickX + 'px';
      hint.style.top  = clickY + 'px';
      imageShell.appendChild(hint);

      setTimeout(() => hint.remove(), 1200);
    });
  }

  // ====== AVANTI SCHERMATA / FINE LIVELLO ======
  if (btnNextScene) {
    btnNextScene.addEventListener('click', () => {
      if (currentScene < scenes.length - 1) {
        loadScene(currentScene + 1);
      } else {
        // ultima schermata → riepilogo
        endLevel(false);
      }
    });
  }

  // ====== PERSISTENZA (UGUALE STRUTTURA A quest.js) ======
  function persistLevel(percent) {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const starAlready    = !!prev.starAwarded;
    const starAwardedNow = (percent === 100);

    const payload = {
      correct: foundGlobal,
      total:   TOTAL_ERRORS,
      percent,
      starAwarded: starAlready || starAwardedNow
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    if (starAwardedNow && !starAlready) {
      stars++; saveStars(); refreshPills();
    }
  }
  
  // ====== FINE LIVELLO – STESSO RIEPILOGO VISIVO ======
  function endLevel(failedByHearts) {
    const percent = Math.round((foundGlobal / TOTAL_ERRORS) * 100);
    persistLevel(percent);

    if (card)    card.classList.add('hidden');
    if (summary) summary.classList.remove('hidden');

    const baseText = failedByHearts
      ? `Vite esaurite – errori trovati ${foundGlobal}/${TOTAL_ERRORS} (${percent}%)`
      : `Hai concluso il livello: ${foundGlobal}/${TOTAL_ERRORS} errori trovati (${percent}%)`;

    if (percent < 60) {
      scoreLine.innerHTML = `${baseText}<br><strong style="color:#c62828">Per sbloccare il livello successivo serve almeno il 60%.</strong>`;
    } else {
      scoreLine.textContent = baseText;
    }

    if (meterBar) meterBar.style.width = percent + '%';
    if (percent === 100 && levelStar) levelStar.classList.add('gold');

    // qui, a differenza del quiz, non consumiamo vite sui tentativi,
    // quindi hearts non dovrebbe mai arrivare a 0 per questo gioco
    if (failedByHearts || hearts <= 0) {
      if (btnRetry) {
        btnRetry.classList.add('hidden');
        btnRetry.classList.remove('ghost');
        btnRetry.textContent = 'Riprova';
      }
      if (btnMenu) {
        btnMenu.classList.remove('hidden');
        setTimeout(() => btnMenu.focus(), 0);
      }
    } else {
      if (btnRetry) {
        btnRetry.classList.remove('hidden');
        btnRetry.classList.remove('ghost');
        btnRetry.textContent = 'Riprova';
      }
    }
  }

  // ====== RIPROVA (reset livello trova errori) ======
  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      if (hearts <= 0) {
        location.href = 'index_game.html';
        return;
      }
      // reset stato
      for (let i = 0; i < foundPerScene.length; i++) {
        foundPerScene[i].clear();
      }
      foundGlobal = 0;
      currentScene = 0;

      if (summary) summary.classList.add('hidden');
      if (card)    card.classList.remove('hidden');
      if (levelStar) levelStar.classList.remove('gold');
      if (meterBar) meterBar.style.width = '0';

      loadScene(0);
    });
  }

  // ====== INIT ======
  const levelTitle = document.getElementById('levelTitle');
  if (levelTitle) {
    levelTitle.textContent = `${TOPIC} – Livello ${LEVEL_NUMBER}`;
  }
  if (sceneTotalEl) sceneTotalEl.textContent = String(scenes.length);

  refreshPills();
  loadScene(0);
})();
