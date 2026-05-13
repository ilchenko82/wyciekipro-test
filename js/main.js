/* ==========================================================================
   WyciekiPro — Main JavaScript
   Header scroll, mobile menu, scroll reveal, counter animation, lightbox
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Header scroll effect ───────────────────────────────────────────────
  const header = document.getElementById('header');
  let lastScroll = 0;

  function updateHeader() {
    if (!header) return;
    const currentScroll = window.scrollY;
    if (currentScroll > 60 || document.body.classList.contains('always-scrolled')) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // Run on load

  // ── Mobile menu ────────────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active');

      if (isOpen) {
        // Compensate for scrollbar disappearing
        const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = scrollbarW + 'px';
        header.style.paddingRight = scrollbarW + 'px';
      } else {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        header.style.paddingRight = '';
      }
    });

    // Close on link click
    mobileMenu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        header.style.paddingRight = '';
      });
    });
  }

  // ── Smooth scroll for nav links ────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Scroll Reveal (IntersectionObserver) ───────────────────────────────
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show everything
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // ── Counter Animation ──────────────────────────────────────────────────
  const counters = document.querySelectorAll('.counter-animated');

  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // ── Language Switcher (stub) ───────────────────────────────────────────
  const langBtns = document.querySelectorAll('.lang-switch__btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // TODO: implement i18n translation swap
    });
  });

  // ── Modal Form ─────────────────────────────────────────────────────────
  const modalForm = document.getElementById('modal-contact-form');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = modalForm.querySelector('.modal__submit');
      const originalText = btn.textContent;
      
      btn.textContent = 'Wysyłanie...';
      btn.disabled = true;

      const formData = new FormData(modalForm);

      fetch('send.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if(data.success) {
          btn.textContent = '✓ Wysłano!';
          btn.style.background = 'var(--color-success)';
          btn.style.borderColor = 'var(--color-success)';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.disabled = false;
            modalForm.reset();
            closeModal();
          }, 2000);
        } else {
          alert('Błąd: ' + (data.message || 'Nie udało się wysłać formularza.'));
          btn.textContent = originalText;
          btn.disabled = false;
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Wystąpił błąd podczas wysyłania.');
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  }

});

// ── Lightbox ───────────────────────────────────────────────────────────────
function openLightbox(item) {
  const img = item.querySelector('img');
  const label = item.querySelector('.gallery__item-label');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');

  if (img && lightbox) {
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = label ? label.textContent : '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Modal Form ────────────────────────────────────────────────────────────
function openModal(e) {
  // Prevent any anchor from navigating / scrolling to #contact
  if (e && e.preventDefault) e.preventDefault();

  const modal = document.getElementById('modal-form');
  if (!modal) return;

  // Lock scroll without jumping: fix the body at current position
  const scrollY = window.scrollY;
  document.body.style.top = `-${scrollY}px`;
  document.body.style.overflow = 'hidden';
  document.body.dataset.scrollY = scrollY;

  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('modal-form');
  if (!modal) return;

  modal.classList.remove('open');

  // Restore scroll position
  const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
  document.body.style.overflow = '';
  document.body.style.top = '';
  window.scrollTo({ top: scrollY, behavior: 'instant' });
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  const lightbox = document.getElementById('lightbox');
  const modal = document.getElementById('modal-form');
  if (lightbox && e.target === lightbox) closeLightbox();
  if (modal && e.target === modal) closeModal();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeModal();
  }
});
