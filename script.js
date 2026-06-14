/* ============================================================
   CONFIG — change the wedding date here (YYYY, MM-1, DD, HH, MM)
   Note: month is 0-indexed, so September = 8
   ============================================================ */
const WEDDING_DATE = new Date(2026, 8, 27, 13, 0, 0); // Sep 27, 2026, 1:00 PM (ceremony)

/* ============================================================
   PRELOADER — fade out the animated rings once the page is ready.
   Hides on window load, with a safety fallback so a slow-loading
   song/image never leaves the loader stuck on screen.
   ============================================================ */
const loader = document.getElementById('loader');
function hideLoader() { if (loader) loader.classList.add('hidden'); }
window.addEventListener('load', () => setTimeout(hideLoader, 700)); // brief min display
setTimeout(hideLoader, 4000); // fallback cap

/* ============================================================
   NAV: shrink/colour on scroll + mobile menu toggle
   ============================================================ */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav__links');

const toTop = document.getElementById('toTop');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  if (toTop) toTop.classList.toggle('show', window.scrollY > 500);
});

if (toTop) {
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// close mobile menu after clicking a link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
const cd = {
  days:  document.getElementById('cd-days'),
  hours: document.getElementById('cd-hours'),
  mins:  document.getElementById('cd-mins'),
  secs:  document.getElementById('cd-secs'),
};

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const diff = WEDDING_DATE - new Date();

  if (diff <= 0) {
    // Wedding day has arrived 🎉
    const timer = document.querySelector('.countdown__timer');
    const title = document.querySelector('.countdown__title');
    if (timer) timer.innerHTML = '<p class="countdown__today">Today is the day! 🎉</p>';
    if (title) title.textContent = 'We’re Married!';
    return;
  }
  const s = Math.floor(diff / 1000);
  cd.days.textContent  = Math.floor(s / 86400);
  cd.hours.textContent = pad(Math.floor((s % 86400) / 3600));
  cd.mins.textContent  = pad(Math.floor((s % 3600) / 60));
  cd.secs.textContent  = pad(s % 60);
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ============================================================
   SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

// Observe each reveal element, and stagger siblings so grids cascade in.
document.querySelectorAll('.reveal').forEach(el => {
  const siblings = Array.from(el.parentElement.children)
    .filter(c => c.classList.contains('reveal'));
  if (siblings.length > 1) {
    const i = siblings.indexOf(el);
    el.style.transitionDelay = Math.min(i * 0.09, 0.45) + 's'; // cap the cascade
  }
  observer.observe(el);
});

/* ============================================================
   BACKGROUND MUSIC
   Browsers block autoplay-with-sound. Strategy:
   1) Try to autoplay on load (works only if the browser allows it).
   2) Otherwise, start on the visitor's FIRST interaction (click/scroll/key).
   3) The floating button always lets them play/pause manually.
   ============================================================ */
const audio   = document.getElementById('bgAudio');
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');

function setPlayingUI(isPlaying) {
  musicBtn.classList.toggle('playing', isPlaying);
  musicIcon.textContent = isPlaying ? '🔊' : '🎵';
  musicBtn.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
}

function playMusic() {
  audio.play().then(() => setPlayingUI(true)).catch(() => setPlayingUI(false));
}

// Manual toggle
musicBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (audio.paused) playMusic();
  else { audio.pause(); setPlayingUI(false); }
});

// 1) Optimistic autoplay attempt
playMusic();

// 2) Fallback: start on first user gesture (only if not already playing)
function startOnFirstInteraction() {
  if (audio.paused) playMusic();
  window.removeEventListener('click', startOnFirstInteraction);
  window.removeEventListener('scroll', startOnFirstInteraction);
  window.removeEventListener('keydown', startOnFirstInteraction);
  window.removeEventListener('touchstart', startOnFirstInteraction);
}
window.addEventListener('click', startOnFirstInteraction);
window.addEventListener('scroll', startOnFirstInteraction, { passive: true });
window.addEventListener('keydown', startOnFirstInteraction);
window.addEventListener('touchstart', startOnFirstInteraction, { passive: true });

/* ============================================================
   RSVP FORM — async submit to Formspree (no page reload)
   Works once you set the form's action="" to your Formspree URL.
   ============================================================ */
const form = document.getElementById('rsvpForm');
const status = document.getElementById('rsvpStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.className = 'rsvp__status';
  status.textContent = 'Sending…';

  // Guard: remind to configure Formspree
  if (form.action.includes('YOUR_FORM_ID')) {
    status.classList.add('error');
    status.textContent = 'Form not configured yet — add your Formspree URL in index.html.';
    return;
  }

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      form.reset();
      status.classList.add('success');
      status.textContent = 'Thank you! Your RSVP has been received. 💛';
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    status.classList.add('error');
    status.textContent = 'Something went wrong. Please try again or email us directly.';
  }
});
