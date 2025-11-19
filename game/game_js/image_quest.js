(function(){
  const params = new URLSearchParams(location.search);
  const CATEGORY = (params.get('category') || 'MACCHINARI').toUpperCase();
  const TOPIC = (params.get('topic') || '').toUpperCase();
  const LEVEL = parseInt(params.get('level') || '1');

  const QUESTIONS = IMAGE_QUESTIONS_BANK[TOPIC]?.[LEVEL] ?? [];

  const STORAGE_KEY = `level:${CATEGORY}|${TOPIC}|${LEVEL}`;

  let index = 0;
  let correct = 0;

  let hearts = parseInt(localStorage.getItem('pillvalueHeart') ?? '5', 10);
  let stars  = parseInt(localStorage.getItem('pillvalueStar') ?? '0', 10);

  const qText = document.getElementById('qText');
  const answers = document.getElementById('answersImg');
  const btnNext = document.getElementById('btnNext');
  const progressDots = document.getElementById('progressDots');

  const summary = document.getElementById('summary');
  const card = document.getElementById('card');
  const winLose = document.getElementById('winLose');
  const scoreLine = document.getElementById('scoreLine');
  const meterBar = document.getElementById('meterBar');
  const levelStar = document.getElementById('levelStar');
  const btnRetry = document.getElementById('btnRetry');

  function renderDots(){
    progressDots.innerHTML = '';
    for(let i=0;i<QUESTIONS.length;i++){
      const d = document.createElement('span');
      d.className = "dot" + (i===index ? " active" : "");
      progressDots.appendChild(d);
    }
  }

  function renderQuestion(){
    const q = QUESTIONS[index];
    renderDots();
    qText.textContent = q.q;

    answers.innerHTML = '';

    q.options.forEach((imgSrc, i)=>{
      const wrap = document.createElement('div');
      wrap.className = 'img-answer';

      const img = document.createElement('img');
      img.src = imgSrc;
      img.dataset.index = i;

      img.addEventListener('click', ()=>selectAnswer(i));

      wrap.appendChild(img);
      answers.appendChild(wrap);
    });

    btnNext.classList.add('hidden');
  }

  function selectAnswer(i){
    const q = QUESTIONS[index];
    const all = answers.querySelectorAll('img');

    all.forEach(img => img.classList.add('disabled'));

    if(i === q.correct){
      correct++;
      all[i].classList.add('ok');
    } else {
      all[i].classList.add('ko');
      all[q.correct].classList.add('ok');

      if(hearts > 0){
        hearts--;
        localStorage.setItem('pillvalueHeart', hearts);
      }
    }

    btnNext.classList.remove('hidden');
  }

  btnNext.addEventListener('click', ()=>{
    index++;
    if(index < QUESTIONS.length){
      renderQuestion();
    } else endLevel();
  });

  function endLevel(){
    const percent = Math.round((correct / QUESTIONS.length) * 100);
    persist(percent);

    card.classList.add('hidden');
    summary.classList.remove('hidden');

    scoreLine.textContent = `${correct} risposte corrette su ${QUESTIONS.length}`;
    meterBar.style.width = percent + "%";
    if(percent === 100) levelStar.classList.add('gold');
  }

  function persist(percent){
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const starNow = percent === 100;

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      percent,
      starAwarded: prev.starAwarded || starNow
    }));

    if(starNow && !prev.starAwarded){
      stars++;
      localStorage.setItem('pillvalueStar', stars);
    }
  }

  btnRetry.addEventListener('click', ()=>location.reload());

  renderQuestion();

})();
