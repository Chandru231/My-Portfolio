// script.js
// Professional interactive/animated enhancements for your portfolio
// Drop in at end of body: <script src="script.js"></script>

(() => {
  // ---------- Helpers ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  // ---------- Preloader ----------
  function initPreloader() {
    let pre = document.getElementById('preloader');
    if (!pre) {
      pre = document.createElement('div');
      pre.id = 'preloader';
      pre.className = 'preloader';
      pre.innerHTML = `<div class="spinner" aria-hidden="true"></div>`;
      document.body.prepend(pre);
    }
    // Remove preloader once content fully loaded + small delay for smoothness
    window.addEventListener('load', () => {
      pre.classList.add('loaded');
      setTimeout(() => pre.remove(), 600);
    });
  }

  // ---------- Mobile nav toggle ----------
  function initNavToggle() {
    const nav = $('nav');
    if (!nav) return;
    // create toggle button if missing
    if (!$('.nav-toggle', nav)) {
      const btn = document.createElement('button');
      btn.className = 'nav-toggle';
      btn.setAttribute('aria-label', 'Toggle navigation');
      btn.innerHTML = `<span class="bar"></span><span class="bar"></span><span class="bar"></span>`;
      nav.insertBefore(btn, nav.firstChild);
    }
    const toggle = $('.nav-toggle', nav);
    const links = $('.nav-links', nav);

    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', !!nav.classList.contains('open'));
    });

    // Close nav when a link clicked (mobile)
    $$('.nav-links a').forEach(a =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        links.classList.remove('open');
      })
    );
  }

  // ---------- Smooth scroll with offset (fixed nav) ----------
  function initSmoothScroll() {
    const headerHeight = () => {
      const nav = $('nav');
      return nav ? nav.offsetHeight + 8 : 0;
    };

    // only for internal anchor links
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href === '#' || href === '#!') return;
      const targetEl = document.querySelector(href);
      if (!targetEl) return;
      e.preventDefault();
      const top = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight();
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', href);
    });
  }

  // ---------- Active nav link on scroll (IntersectionObserver) ----------
  function initActiveNav() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-links a');
    if (!sections.length || !navLinks.length) return;

    const sectionMap = new Map(sections.map(s => [s.id, s]));
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
          }
        });
      },
      { root: null, rootMargin: '0px 0px -40% 0px', threshold: 0.15 }
    );
    sections.forEach(s => observer.observe(s));
  }

  // ---------- Scroll reveal (fade-up) ----------
  function initScrollReveal() {
    const revealables = $$('section, .project-card, .about-image, .card-content, header .hero-content');
    revealables.forEach(el => el.classList.add('will-reveal'));
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('revealed');
            o.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealables.forEach(el => obs.observe(el));
  }

  // ---------- Simple typing effect for hero ----------  
  function initTypingEffect() {
    const span = document.querySelector('header .hero-content h1 span');
    if (!span) return;
    const phrases = ["Hi, I'm Chandru", "Front-End Developer", "Designer", "Creator"];
    let p = 0, i = 0, deleting = false;
    const speed = 75;
    function tick() {
      const full = phrases[p];
      if (!deleting) {
        span.textContent = full.slice(0, i + 1);
        i++;
        if (i === full.length) {
          deleting = true;
          setTimeout(tick, 900);
          return;
        }
      } else {
        span.textContent = full.slice(0, i - 1);
        i--;
        if (i === 0) {
          deleting = false;
          p = (p + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? speed / 2 : speed);
    }
    tick();
  }

  // ---------- Subtle hero parallax (mouse move) ----------
  function initHeroParallax() {
    const header = $('header');
    if (!header) return;
    header.addEventListener('mousemove', e => {
      const rect = header.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      header.style.setProperty('--mx', `${clamp(x * 30, -15, 15)}px`);
      header.style.setProperty('--my', `${clamp(y * 20, -10, 10)}px`);
      // use these CSS vars in your CSS to nudge background elements (example below)
    });
    header.addEventListener('mouseleave', () => {
      header.style.setProperty('--mx', '0px');
      header.style.setProperty('--my', '0px');
    });
  }

  // ---------- Project card modal preview ----------
  function initProjectModal() {
    // create modal container
    let modal = document.getElementById('projectModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'projectModal';
      modal.className = 'project-modal';
      modal.innerHTML = `
        <div class="project-modal-inner" role="dialog" aria-modal="true">
          <button class="pm-close" aria-label="Close preview">✕</button>
          <div class="pm-body">
            <h3 class="pm-title"></h3>
            <p class="pm-desc"></p>
            <div class="pm-actions">
              <a class="pm-open" target="_blank" rel="noopener">Open</a>
              <button class="pm-close-btn">Close</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    const pmTitle = $('.pm-title', modal);
    const pmDesc = $('.pm-desc', modal);
    const pmOpen = $('.pm-open', modal);
    const closeButtons = $$('.pm-close, .pm-close-btn', modal);

    // attach click handlers to project links: open modal showing details and an "Open" button
    $$('.project-card .card-content a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const card = e.target.closest('.project-card') || e.target.closest('.card-content');
        const title = (card && card.querySelector('h3')) ? card.querySelector('h3').textContent : 'Project';
        const desc = (card && card.querySelector('p')) ? card.querySelector('p').textContent : '';
        const href = a.href || a.getAttribute('href');
        pmTitle.textContent = title;
        pmDesc.textContent = desc;
        pmOpen.href = href;
        // open modal
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    closeButtons.forEach(b => b.addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }));
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ---------- Lazy-load images that don't already use loading="lazy" ----------
  function initLazyImages() {
    const imgs = $$('img').filter(img => !img.loading);
    imgs.forEach(img => img.setAttribute('loading', 'lazy'));
  }

  // ---------- Back to top button ----------
  function initBackToTop() {
    let btn = document.getElementById('backToTop');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'backToTop';
      btn.className = 'back-to-top';
      btn.setAttribute('aria-label', 'Back to top');
      btn.textContent = '↑';
      document.body.appendChild(btn);
    }
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 450);
    });
  }

  // ---------- Small keyboard escape to close modals/nav ----------
  function initKeyboardShortcuts() {
    document.addEventListener('keyup', e => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('projectModal');
        if (modal && modal.classList.contains('open')) {
          modal.classList.remove('open');
          document.body.style.overflow = '';
        }
        const nav = $('nav');
        if (nav && nav.classList.contains('open')) {
          nav.classList.remove('open');
          const links = $('.nav-links', nav);
          if (links) links.classList.remove('open');
        }
      }
    });
  }

  // ---------- Init all ----------
  function init() {
    initPreloader();
    initNavToggle();
    initSmoothScroll();
    initActiveNav();
    initScrollReveal();
    initTypingEffect();
    initHeroParallax();
    initProjectModal();
    initLazyImages();
    initBackToTop();
    initKeyboardShortcuts();
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// Scroll reveal for skills
function initSkillsReveal() {
  const skillCards = document.querySelectorAll('.skill-card');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  skillCards.forEach(card => observer.observe(card));
}

// Call after DOM ready
document.addEventListener('DOMContentLoaded', initSkillsReveal);
