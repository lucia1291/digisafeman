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

  // ====== SCENE / ERRORI ======
  let scenes = [];

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

  // ====== DOM RIEPILOGO ======
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

  // ====== CALCOLO BOX REALE DELL'IMMAGINE (object-fit: contain) ======
  function getImageLayout() {
    if (!imageShell || !sceneImage) return null;

    const shellRect = imageShell.getBoundingClientRect();
    const naturalW = sceneImage.naturalWidth;
    const naturalH = sceneImage.naturalHeight;

    if (!naturalW || !naturalH) return null;

    const containerW = shellRect.width;
    const containerH = shellRect.height;

    // replica di object-fit: contain
    const scale = Math.min(containerW / naturalW, containerH / naturalH);
    const drawW = naturalW * scale;
    const drawH = naturalH * scale;

    const offsetX = (containerW - drawW) / 2;
    const offsetY = (containerH - drawH) / 2;

    return {
      shellRect,
      offsetX,
      offsetY,
      drawW,
      drawH
    };
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

    // ridimensiono il pallino found in base alla dimensione reale dell'immagine
    const layout = getImageLayout();
    if (layout) {
      const base = Math.min(layout.drawW, layout.drawH);
      const visibleDiameter = base * 0.12; // 8% del lato più corto
      e.currentTarget.style.width  = visibleDiameter + 'px';
      e.currentTarget.style.height = visibleDiameter + 'px';
    }

    if (foundTopEl)  foundTopEl.textContent = String(foundPerScene[currentScene].size);
    if (captionText) captionText.textContent = scene.errors[idx].label;
  }

  // ====== POSIZIONA HOTSPOT RELATIVI ALL’IMMAGINE ======
  function placeHotspotsForScene(index) {
    const scene = scenes[index];
    if (!imageShell || !sceneImage || !scene) return;

    const layout = getImageLayout();
    if (!layout) return;

    const { shellRect, offsetX, offsetY, drawW, drawH } = layout;

    // grandezza area cliccabile & pallino proporzionale all'immagine
    const base = Math.min(drawW, drawH);
    const invisibleDiameter = base * 0.14; // area tap grande (invisibile)
    const visibleDiameter   = base * 0.12; // pallino found

    // pulisci hotspot precedenti
    imageShell.querySelectorAll('.hotspot').forEach(h => h.remove());

    scene.errors.forEach((err, i) => {
      const btn = document.createElement('button');
      btn.className = 'hotspot';
      btn.dataset.errorIndex = String(i);

      // coordinate RELATIVE ALL’IMMAGINE (x,y in %)
      const pxLeft = offsetX + drawW * (err.x / 100);
      const pxTop  = offsetY + drawH * (err.y / 100);

      // left/top relativi a imageShell
      btn.style.left = pxLeft + 'px';
      btn.style.top  = pxTop  + 'px';

      // default: area cliccabile ampia ma invisibile
      btn.style.width  = invisibleDiameter + 'px';
      btn.style.height = invisibleDiameter + 'px';

      // se già trovato (retry senza ricaricare pagina)
      if (foundPerScene[index].has(i)) {
        btn.classList.add('found');
        btn.style.width  = visibleDiameter + 'px';
        btn.style.height = visibleDiameter + 'px';
      }

      btn.addEventListener('click', onHotspotClick);
      imageShell.appendChild(btn);
    });
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

    sceneImage.onload = () => {
      placeHotspotsForScene(index);
    };

    // nel caso l'immagine sia già in cache
    if (sceneImage.complete && sceneImage.naturalWidth > 0) {
      placeHotspotsForScene(index);
    }

    sceneImage.src = scene.image;

    renderDots();
  }

  // ====== CLICK FUORI HOTSPOT (hint + perdita vita + alert una sola volta) ======
  let warnedOnce = false;

  if (imageShell) {
    imageShell.addEventListener('click', function (e) {
      // se è un hotspot, ignoriamo
      if (e.target.classList.contains('hotspot')) return;

      const layout = getImageLayout();
      if (!layout) return;

      const { shellRect, offsetX, offsetY, drawW, drawH } = layout;

      const clickX = e.clientX - shellRect.left;
      const clickY = e.clientY - shellRect.top;

      const scene = scenes[currentScene];
      let near = false;
      const threshold = 50; // px

      scene.errors.forEach(err => {
        const hx = offsetX + drawW * (err.x / 100);
        const hy = offsetY + drawH * (err.y / 100);
        const dist = Math.hypot(clickX - hx, clickY - hy);
        if (dist < threshold) near = true;
      });

      // popup "ci sei quasi" / "non è qui"
      const hint = document.createElement('div');
      hint.className = 'hint-popup';
      hint.textContent = near ? 'ci sei quasi' : 'non è qui';
      hint.style.left = clickX + 'px';
      hint.style.top  = clickY + 'px';
      imageShell.appendChild(hint);

      setTimeout(() => hint.remove(), 1200);

      // perdita vita se totalmente fuori
      if (!near) {
        if (!warnedOnce) {
          warnedOnce = true;

          const alertBox = document.createElement('div');
          alertBox.style.position = 'fixed';
          alertBox.style.top = '50%';
          alertBox.style.left = '50%';
          alertBox.style.transform = 'translate(-50%, -50%)';
          alertBox.style.padding = '16px';
          alertBox.style.background = 'white';
          alertBox.style.borderRadius = '12px';
          alertBox.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
          alertBox.style.zIndex = '9999';
          alertBox.style.fontSize = '18px';
          alertBox.style.textAlign = 'center';
          alertBox.innerHTML = `
            <strong>Attenzione!</strong><br>
            Cliccare nei punti sbagliati ti fa perdere vite!
            <br><br>
            <button id="alertCloseBtn" style="
              padding: 8px 20px;
              border: none;
              background: #DA0037;
              color: white;
              font-size: 16px;
              border-radius: 8px;
              cursor: pointer;">
              Ok
            </button>
          `;

          document.body.appendChild(alertBox);

          document.getElementById('alertCloseBtn').onclick = () => {
            alertBox.remove();
          };
        }

        hearts--;
        saveHearts();
        refreshPills();

        if (hearts <= 0) {
          endLevel(true);
        }
      }
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

  // ====== PERSISTENZA ======
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

  // ====== FINE LIVELLO ======
  function endLevel (failedByHearts) {
    const percent = Math.round((foundGlobal / TOTAL_ERRORS) * 100);
    persistLevel(percent);

    if (card)    card.classList.add('hidden');
    if (summary) summary.classList.remove('hidden');

    if (winLose) {
      let imgSrc = "";
      let imgAlt = "";

      if (percent === 100) {
        imgSrc = "../resources/games/perfect.png";
        imgAlt = "Perfetto!";
      } else if (percent >= 70) {
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

    const baseText = failedByHearts
      ? `Vite esaurite – errori trovati ${foundGlobal}/${TOTAL_ERRORS} (${percent}%)`
      : `Hai concluso il livello: ${foundGlobal}/${TOTAL_ERRORS} errori trovati (${percent}%)`;

    if (percent < 70) {
      scoreLine.innerHTML = `${baseText}<br><strong style="color:#c62828">Per sbloccare il livello successivo serve almeno il 70%.</strong>`;
    } else {
      scoreLine.textContent = baseText;
    }

    if (meterBar) meterBar.style.width = percent + '%';
    if (percent === 100 && levelStar) levelStar.classList.add('gold');

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

  // ====== RICALCOLO HOTSPOT SU RESIZE ======
  window.addEventListener('resize', () => {
    placeHotspotsForScene(currentScene);
  });

  // ====== INIT ======
  const levelTitle = document.getElementById('levelTitle');
  if (levelTitle) {
    levelTitle.textContent = `${TOPIC} – Livello ${LEVEL_NUMBER}`;
  }
  if (sceneTotalEl) sceneTotalEl.textContent = String(scenes.length);

  refreshPills();
  loadScene(0);
})();
