(function(){
const containers = document.querySelectorAll('.carousel-container');


containers.forEach((container) => {
const track = container.querySelector('.carousel');
const slides = [...container.querySelectorAll('.slide')];
const prevBtn = container.querySelector('.carousel-arrow.prev');
const nextBtn = container.querySelector('.carousel-arrow.next');
const dots = [...container.querySelectorAll('.dot')];


if (!track || slides.length === 0) return;


/* helper: indice slide corrente (centro viewport) */
const currentIndex = () => {
const center = track.scrollLeft + track.clientWidth / 2;
let idx = 0;
for (let i = 0; i < slides.length; i++) {
if (slides[i].offsetLeft + slides[i].offsetWidth / 2 <= center) idx = i;
}
return idx;
};


const snapTo = (idx) => {
const clamped = Math.max(0, Math.min(idx, slides.length - 1));
const left = slides[clamped].offsetLeft;
track.scrollTo({ left, behavior: 'smooth' });
updateDots(clamped);
};


const updateDots = (active) => {
dots.forEach((d, i) => d.classList.toggle('active', i === (active ?? currentIndex())));
};


/* click su frecce */
prevBtn && prevBtn.addEventListener('click', () => snapTo(currentIndex() - 1));
nextBtn && nextBtn.addEventListener('click', () => snapTo(currentIndex() + 1));


/* click sui dot (se presenti) */
dots.forEach((d, i) => d.addEventListener('click', () => snapTo(i)));


/* tastiera quando il container ha il focus */
container.addEventListener('keydown', (e) => {
if (e.key === 'ArrowLeft') { e.preventDefault(); prevBtn?.click(); }
if (e.key === 'ArrowRight') { e.preventDefault(); nextBtn?.click(); }
});


/* aggiornamento dot durante lo scroll (anche da swipe mobile) */
let raf = null;
track.addEventListener('scroll', () => {
if (raf) cancelAnimationFrame(raf);
raf = requestAnimationFrame(() => updateDots());
}, { passive: true });


/* mostra/nascondi frecce in base alle capacità del device (in runtime) */
const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
const applyArrows = () => {
const show = mq.matches;
[prevBtn, nextBtn].forEach(btn => btn && (btn.style.display = show ? 'inline-flex' : 'none'));
};
applyArrows();
mq.addEventListener?.('change', applyArrows);


/* inizializza stato indicatori */
updateDots(0);
});
})();