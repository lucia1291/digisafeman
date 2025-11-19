(function () {
  // ====== PARAMETRI URL (come quest.js) ======
  const params = new URLSearchParams(location.search);
  const CATEGORY = (params.get('category') || 'MACCHINARI').toUpperCase();
  const TOPIC = (params.get('topic') || 'MOLATRICE').toUpperCase(); // default
  const LEVEL_NUMBER = parseInt(params.get('level') || '1', 10);

  // ====== STORAGE KEY COMPATIBILE ======
  const STORAGE_KEY = `level:${CATEGORY}|${TOPIC}|${LEVEL_NUMBER}`;

  // ====== STATO VITE / STELLE ======
  let hearts = parseInt(localStorage.getItem('pillvalueHeart') ?? '5', 10);
  let stars  = parseInt(localStorage.getItem('pillvalueStar') ?? '0', 10);

  const pillHearts = document.getElementById('pillHearts');
  const pillStars  = document.getElementById('pillStars');
  function refreshPills () {
    if (pillHearts) pillHearts.textContent = hearts;
    if (pillStars)  pillStars.textContent  = stars;
  }
  function saveHearts () {
    localStorage.setItem('pillvalueHeart', String(hearts));
  }
  function saveStars () {
    localStorage.setItem('pillvalueStar',  String(stars));
  }

  // ====== SCENE / ERRORI (3 schermate x 3 errori) ======
  // ====== SCENE / ERRORI DA BANCA DATI ======
  let scenes = [];

  // default di emergenza se non troviamo nulla in banca dati
  const defaultScenes = [
    {
      title: "Pericoli",
      image: "trova1.png",
      description: "Trova i 3 errori nascosti nella scena.",
      errors: [
        { x: 32, y: 27, label: "Mancanza di protezione per il viso" },
        { x: 58, y: 45, label: "Protezione della mola non adeguata" },
        { x: 40, y: 69, label: "Operatore senza guanti protettivi" }
      ]
    }
  ];

  // Recupero dal file find_errors_bank.js
  if (window.FIND_ERRORS_BANK &&
      window.FIND_ERRORS_BANK[CATEGORY] &&
      window.FIND_ERRORS_BANK[CATEGORY][TOPIC] &&
      window.FIND_ERRORS_BANK[CATEGORY][TOPIC][LEVEL_NUMBER]) {

    scenes = window.FIND_ERRORS_BANK[CATEGORY][TOPIC][LEVEL_NUMBER];
  } else {
    console.warn("Scene non trovate per", CATEGORY, TOPIC, LEVEL_NUMBER, "uso default.");
    scenes = defaultScenes;
  }

  const TOTAL_ERRORS = scenes.reduce((sum, s) => sum + s.errors.length, 0);

  // ====== DOM GIOCO TROVA ERRORI ======
  const imageShell   = document.getElementById('imageShell');
  const sceneImage   = document.getElementById('sceneImage');
  const tagTitleEl   = document.getElementById('tagTitle');
  const topLabelTitle= document.getElementById('topLabelTitle'); // opzionale
  const captionText  = document.getElementById('captionText');
  const foundTopEl   = document.getElementById('foundTop');
  const totTopEl     = document.getElementById('totTop');
  const sceneIndexEl = document.getElementById('sceneIndex');
  const sceneTotalEl = document.getElementById('sceneTotal');
  const btnNextScene = document.getElementById('btnNextScene');
  const progressDots = document.getElementById('progressDots');

  // ====== DOM RIEPILOGO (come quest.js) ======
  const summary   = document.getElementById('summary');
  const card      = document.getElementById('card');
  const winLose   = document.getElementById('winLose');
  const scoreLine = document.getElementById('scoreLine');
  const meterBar  = document.getElementById('meterBar');
  const levelStar = document.getElementById('levelStar');
  const btnRetry  = document.getElementById('btnRetry');
  const btnMenu   = document.getElementById('btnMenu');

  // ====== STATO GIOCO ======
  let currentScene = 0;
  const foundPerScene = scenes.map(() => new Set());
  let foundGlobal = 0;

  // ====== PUNTINI PROGRESSO ======
  function renderDots () {
    if (!progressDots) return;
    progressDots.innerHTML = '';
    for (let i = 0; i < scenes.length; i++) {
      const d = document.createElement('span');
      d.className = 'dot' + (i === currentScene ? ' active' : '');
      progressDots.appendChild(d);
    }
  }

  // ====== CARICA SCENA ======
  function loadScene (index) {
    currentScene = index;
    const scene = scenes[index];
    if (!scene || !imageShell || !sceneImage) return;

    if (tagTitleEl)    tagTitleEl.textContent    = scene.title;
    if (topLabelTitle) topLabelTitle.textContent = scene.title;
    if (captionText)   captionText.textContent   = scene.description;

    if (sceneIndexEl)  sceneIndexEl.textContent  = String(index + 1);
    if (sceneTotalEl)  sceneTotalEl.textContent  = String(scenes.length);

    if (totTopEl)      totTopEl.textContent      = String(scene.errors.length);
    if (foundTopEl)    foundTopEl.textContent    = String(foundPerScene[index].size);

    sceneImage.src = scene.image;

    // pulisci hotspot precedenti
    imageShell.querySelectorAll('.hotspot').forEach(h => h.remove());

    // crea hotspot
    scene.errors.forEach((err, i) => {
      const btn = document.createElement('button');
      btn.className = 'hotspot';
      btn.style.left = err.x + '%';
      btn.style.top  = err.y + '%';
      btn.dataset.errorIndex = String(i);
      if (foundPerScene[index].has(i)) {
        btn.classList.add('found');
      }
      btn.addEventListener('click', onHotspotClick);
      imageShell.appendChild(btn);
    });

    renderDots();
  }

  // ====== CLICK SU HOTSPOT ======
  function onHotspotClick (e) {
    const scene = scenes[currentScene];
    const idx = Number(e.currentTarget.dataset.errorIndex || '0');

    if (foundPerScene[currentScene].has(idx)) {
      if (captionText) captionText.textContent = scene.errors[idx].label;
      return;
    }

    foundPerScene[currentScene].add(idx);
    foundGlobal++;
    e.currentTarget.classList.add('found');

    if (foundTopEl)  foundTopEl.textContent = String(foundPerScene[currentScene].size);
    if (captionText) captionText.textContent = scene.errors[idx].label;
  }

  // ====== CLICK FUORI HOTSPOT (hint) ======
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

  // ====== AVANTI SCENA / FINE ======
  if (btnNextScene) {
    btnNextScene.addEventListener('click', () => {
      if (currentScene < scenes.length - 1) {
        loadScene(currentScene + 1);
      } else {
        endLevel(false);
      }
    });
  }

  // ====== PERSISTENZA (come quest.js) ======
  function persistLevel (percent) {
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
      stars++;
      saveStars();
      refreshPills();
    }
  }

  // ====== FINE LIVELLO (stesso layout del quiz) ======
  function endLevel (failedByHearts) {
    const percent = Math.round((foundGlobal / TOTAL_ERRORS) * 100);
    persistLevel(percent);

    if (card)    card.classList.add('hidden');
    if (summary) summary.classList.remove('hidden');

    // IMMAGINE WIN / LOSE / PERFECT
    if (winLose) {
      let imgSrc = "";
      let imgAlt = "";

      if (percent === 100) {
        imgSrc = "../resources/games/perfect.png";
        imgAlt = "Perfetto!";
      } else if (percent >= 60) {
        imgSrc = "../resources/games/win.png";
        imgAlt = "Hai vinto!";
      } else {
        imgSrc = "../resources/games/lose.png";
        imgAlt = "Hai perso";
      }

      winLose.innerHTML = `
        <img src="${imgSrc}" alt="${imgAlt}"
             class="winlose-anim"
             style="width:100%; height:100%; object-fit:contain;">
      `;
    }

    // TESTO RISULTATO – identico stile al quiz
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

    // LOGICA bottoni (come nel quiz)
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

  // ====== RIPROVA ======
  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      if (hearts <= 0) {
        location.href = 'index_game.html';
        return;
      }
      foundPerScene.forEach(set => set.clear());
      foundGlobal  = 0;
      currentScene = 0;

      if (summary)   summary.classList.add('hidden');
      if (card)      card.classList.remove('hidden');
      if (levelStar) levelStar.classList.remove('gold');
      if (meterBar)  meterBar.style.width = '0';

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
