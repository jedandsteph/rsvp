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
   GALLERY
   - Preview shows a few photos; "View Full Gallery" opens a modal
     with all of them.
   - Click any photo to view it large (lightbox) with prev/next,
     backdrop click, and keyboard (Esc / ← / →).

   To add/remove photos: just keep them named 1.JPG, 2.JPG, … in
   img/gallery and update GALLERY_COUNT below.
   ============================================================ */
const GALLERY_COUNT   = 16;  // how many photos are in img/gallery (1.JPG … N.JPG)
const GALLERY_PREVIEW = 8;   // how many to show before "View Full Gallery"
const GALLERY = Array.from({ length: GALLERY_COUNT }, (_, i) => `img/gallery/${i + 1}.JPG`);

const lightbox = document.getElementById('lightbox');
const galleryModal = document.getElementById('galleryModal');

if (lightbox) {
  const lbImg   = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  const lbPrev  = document.getElementById('lbPrev');
  const lbNext  = document.getElementById('lbNext');
  let current = 0;

  function showPhoto(i) {
    current = (i + GALLERY.length) % GALLERY.length; // wrap around
    lbImg.src = GALLERY[current];
    lbImg.alt = 'Jed and Steph';
  }
  function openLightbox(i) {
    showPhoto(i);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // lock background scroll
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    // keep scroll locked if the full-gallery modal is still open underneath
    if (!galleryModal || !galleryModal.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  // Build a clickable thumbnail for a given photo index
  function buildThumb(index) {
    const img = document.createElement('img');
    img.src = GALLERY[index];
    img.alt = 'Jed and Steph';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('click', () => openLightbox(index));
    img.addEventListener('error', () => { img.style.display = 'none'; });
    return img;
  }

  // Populate the preview grid (first few) and the full grid (all)
  const previewGrid = document.getElementById('galleryPreview');
  const fullGrid    = document.getElementById('galleryFull');
  GALLERY.forEach((_, i) => {
    if (previewGrid && i < GALLERY_PREVIEW) previewGrid.appendChild(buildThumb(i));
    if (fullGrid) fullGrid.appendChild(buildThumb(i));
  });

  // Lightbox controls
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => showPhoto(current - 1));
  lbNext.addEventListener('click', () => showPhoto(current + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // Full-gallery modal controls
  if (galleryModal) {
    const viewAllBtn = document.getElementById('viewAllBtn');
    const modalClose = document.getElementById('galleryModalClose');
    function openGalleryModal() {
      galleryModal.classList.add('open');
      galleryModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeGalleryModal() {
      galleryModal.classList.remove('open');
      galleryModal.setAttribute('aria-hidden', 'true');
      if (!lightbox.classList.contains('open')) document.body.style.overflow = '';
    }
    if (viewAllBtn) viewAllBtn.addEventListener('click', openGalleryModal);
    if (modalClose) modalClose.addEventListener('click', closeGalleryModal);
    galleryModal.addEventListener('click', (e) => {
      if (e.target === galleryModal || e.target.classList.contains('gallery-modal__scroll')) {
        closeGalleryModal();
      }
    });
    galleryModal._close = closeGalleryModal; // expose for the keyboard handler
  }

  // Keyboard: lightbox first (it's on top), then the modal
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showPhoto(current - 1);
      else if (e.key === 'ArrowRight') showPhoto(current + 1);
    } else if (galleryModal && galleryModal.classList.contains('open')) {
      if (e.key === 'Escape') galleryModal._close();
    }
  });
}

/* ============================================================
   BACKGROUND MUSIC — autoplay, no button.
   Browsers block autoplay-WITH-SOUND until the visitor interacts
   with the page, and that interaction MUST be a real user gesture
   (tap/click/key) — scroll alone does NOT count. So:
     1) Start playing MUTED immediately (this is always allowed), so
        the track is already running from page load.
     2) Unmute on the visitor's first real gesture, so sound kicks in
        instantly with no startup delay.
   ============================================================ */
const audio = document.getElementById('bgAudio');
if (audio) {
  // Gesture events the browser actually accepts as "user activation".
  // (scroll / mousemove are intentionally NOT here — they don't count.)
  const GESTURES = ['pointerdown', 'click', 'keydown', 'touchend'];

  // 1) Muted autoplay so playback is already running on load.
  audio.muted = true;
  audio.play().catch(() => {});

  // 2) Unmute on the first real interaction.
  let soundOn = false;
  function enableSound() {
    if (soundOn) return;
    soundOn = true;
    audio.muted = false;
    audio.volume = 1;
    audio.play().catch(() => {});
    GESTURES.forEach(evt => window.removeEventListener(evt, enableSound));
  }
  GESTURES.forEach(evt => window.addEventListener(evt, enableSound, { passive: true }));
}

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
