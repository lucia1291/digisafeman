// game_js/imgquiz.js
(function(){
  // ====== PARAMETRI URL ======
  const params = new URLSearchParams(location.search);
  const CATEGORY = (params.get('category') || 'MACCHINARI').toUpperCase();
  const TOPIC    = (params.get('topic')    || 'MOLATRICE').toUpperCase();
  const LEVEL_NUMBER = parseInt(params.get('level') || '3', 10);

  // ====== DOMANDE (catalogo immagini) ======
  const QUESTIONS = IMG_QUESTIONS_BANK[TOPIC]?.[LEVEL_NUMBER] ?? [
    {
      q: "Domanda non definita per questo livello immagini.",
      img: null,
      a: ["../resources/games/placeholder/answer.png"],
      correct: 0
    }
  ];

  // ====== STORAGE KEY ======
  const STORAGE_KEY = `level:${CATEGORY}|${TOPIC}|${LEVEL_NUMBER}`;

  // ====== STATO ======
  let index = 0;
  let correct = 0;
  let hearts = parseInt(localStorage.getItem('pillvalueHeart') ?? '5', 10);
  let stars  = parseInt(localStorage.getItem('pillvalueStar') ?? '0', 10);

  // ====== DOM ======
  const qText = document.getElementById('qText');
  const qImage = document.getElementById('qImage');
  const answers = document.getElementById('answers');
  const btnNext = document.getElementById('btnNext');
  const btnRetry = document.getElementById('btnRetry');
  const btnMenu  = document.getElementById('btnMenu');
  const summary = document.getElementById('summary');
  const card = document.getElementById('card');
  const winLose = document.getElementById('winLose');
  const scoreLine = document.getElementById('scoreLine');
  const meterBar = document.getElementById('meterBar');
  const levelStar = document.getElementById('levelStar');
  const pillHearts = document.getElementById('pillHearts');
  const pillStars  = document.getElementById('pillStars');
  const progressDots = document.getElementById('progressDots');

  // ====== UI BAR ======
  function refreshPills(){
    pillHearts.textContent = hearts;
    pillStars.textContent = stars;
  }
  function saveHearts(){
    localStorage.setItem('pillvalueHeart', String(hearts));
  }
  function saveStars(){
    localStorage.setItem('pillvalueStar',  String(stars));
  }

  // ====== PROGRESS DOTS ======
  function renderDots(){
    progressDots.innerHTML = '';
    for(let i=0;i<QUESTIONS.length;i++){
      const d = document.createElement('span');
      d.className = 'dot' + (i===index ? ' active' : '');
      progressDots.appendChild(d);
    }
  }

  // ====== RENDER DOMANDA (risposte = immagini) ======
  function renderQuestion(){
    renderDots();
    const { q, a, img, correct: correctIdx } = QUESTIONS[index];
    qText.textContent = q;

    // immagine principale della domanda (se presente)
    qImage.innerHTML = '';
    if(img){
      const im = document.createElement('img');
      im.src = img;
      im.alt = "";
      qImage.appendChild(im);
      qImage.removeAttribute('aria-hidden');
    } else {
      qImage.setAttribute('aria-hidden','true');
    }

    // shuffle risposte mantenendo indice corretto
    const shuffled = a.map((path, i) => ({ path, index: i }));
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const newCorrectIndex = shuffled.findIndex(item => item.index === correctIdx);
    QUESTIONS[index].shuffledCorrect = newCorrectIndex;

    // render bottoni con IMG
    answers.innerHTML = '';
    shuffled.forEach((item, i)=>{
      const b = document.createElement('button');
      b.className = 'btn image-answer';

      const imgAns = document.createElement('img');
      imgAns.src = item.path;   // SOLO LINK A CARTELLA
      imgAns.alt = "risposta";
      imgAns.style.maxWidth = "100px";
      imgAns.style.height = "auto";

      b.appendChild(imgAns);
      b.addEventListener('click',()=>onAnswer(i));
      answers.appendChild(b);
    });

    btnNext.classList.add('hidden');
  }

  // ====== GESTIONE RISPOSTA ======
  function onAnswer(choice){
    const current = QUESTIONS[index];
    const btns = [...answers.querySelectorAll('button')];
    btns.forEach(b=>b.disabled=true);

    if(choice === current.shuffledCorrect){
      correct++;
      btns[choice].classList.add('ok');
    } else {
      btns[choice].classList.add('ko');
      btns[current.shuffledCorrect].classList.add('ok');
      if(hearts>0){
        hearts--;
        saveHearts();
      }
      refreshPills();
      if(hearts===0){
        endLevel(true);
        return;
      }
    }
    btnNext.classList.remove('hidden');
  }

  btnNext.addEventListener('click',()=>{
    index++;
    if(index < QUESTIONS.length){
      renderQuestion();
    } else {
      endLevel(false);
    }
  });

  // ====== Riprova ======
  btnRetry.addEventListener('click',()=>{
    if (hearts <= 0) {
      location.href = 'index_game.html';
      return;
    }
    index = 0;
    correct = 0;
    renderQuestion();
    summary.classList.add('hidden');
    card.classList.remove('hidden');
    btnRetry.classList.remove('hidden','ghost');
    btnRetry.textContent = 'Riprova';
  });

  // ====== PERSISTENZA ======
  function persistLevel(percent){
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const starAlready = !!prev.starAwarded;
    const starAwardedNow = (percent === 100);

    const payload = {
      correct,
      total: QUESTIONS.length,
      percent,
      starAwarded: starAlready || starAwardedNow
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    if(starAwardedNow && !starAlready){
      stars++;
      saveStars();
      refreshPills();
    }
  }

  // ====== FINE LIVELLO ======
  function endLevel(failedByHearts){
    const percent = Math.round((correct / QUESTIONS.length) * 100);
    persistLevel(percent);

    card.classList.add('hidden');
    summary.classList.remove('hidden');

    let imgSrc = "";
    let imgAlt = "";

    if (percent === 100) {
      imgSrc = "../resources/games/perfect.png";
      imgAlt = "Perfetto!";
    }
    else if (percent >= 70) {
      imgSrc = "../resources/games/win.png";
      imgAlt = "Hai vinto!";
    }
    else {
      imgSrc = "../resources/games/lose.png";
      imgAlt = "Hai perso";
    }

    winLose.innerHTML = `
      <img src="${imgSrc}" alt="${imgAlt}"
           class="winlose-anim"
           style="width:100%; height:100%; object-fit:contain;">
    `;

    const baseText = failedByHearts
      ? `Vite esaurite – punteggio ${correct}/${QUESTIONS.length} (${percent}%)`
      : `Hai concluso il livello: ${correct}/${QUESTIONS.length} corrette (${percent}%)`;

    if (percent < 70) {
      scoreLine.innerHTML = `${baseText}<br><strong style="color:#c62828">Per sbloccare il livello successivo serve almeno il 70%.</strong>`;
    } else {
      scoreLine.textContent = baseText;
    }

    meterBar.style.width = percent + '%';
    if(percent === 100){
      levelStar.classList.add('gold');
    }

    if (failedByHearts || hearts <= 0) {
      btnRetry.classList.add('hidden');
      btnRetry.classList.remove('ghost');
      btnRetry.textContent = 'Riprova';
      btnMenu.classList.remove('hidden');
      setTimeout(()=>btnMenu.focus(), 0);
    } else {
      btnRetry.classList.remove('hidden');
      btnRetry.classList.remove('ghost');
      btnRetry.textContent = 'Riprova';
    }
  }

  // ====== INIT ======
  document.getElementById('levelTitle').textContent =
    `${TOPIC} – Livello ${LEVEL_NUMBER} (immagini)`;
  refreshPills();
  renderDots();
  renderQuestion();
})();
