// Elementi
const openBtn  = document.getElementById('openModalBtn');
const modal    = document.getElementById('myModal');
const dialog   = modal.querySelector('.modal__dialog');
const closeBtn = document.getElementById('closeModalBtn');

let lastFocused = null;

function openModal() {
  lastFocused = document.activeElement;
  modal.setAttribute('open', '');
  modal.setAttribute('aria-hidden', 'false');
  dialog.focus();
  modal.addEventListener('click', onBackdropClick);
  document.addEventListener('keydown', onEsc);
  document.addEventListener('keydown', focusTrap);
}

function closeModal() {
  modal.removeAttribute('open');
  modal.setAttribute('aria-hidden', 'true');
  modal.removeEventListener('click', onBackdropClick);
  document.removeEventListener('keydown', onEsc);
  document.removeEventListener('keydown', focusTrap);
  if (lastFocused) lastFocused.focus();
}

function onBackdropClick(e) {
  if (e.target === modal) closeModal();
}

function onEsc(e) {
  if (e.key === 'Escape') closeModal();
}

// Focus trap rudimentale
function focusTrap(e) {
  if (e.key !== 'Tab') return;
  const focusables = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    last.focus(); e.preventDefault();
  } else if (!e.shiftKey && document.activeElement === last) {
    first.focus(); e.preventDefault();
  }
}

// Event listeners
openBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);


