/** navigation.js
 * Accessible responsive navigation:
 * - Sticky header assumed via HTML/Tailwind
 * - Smooth scrolling on click
 * - Active link highlight using IntersectionObserver
 * - Mobile toggle with aria-expanded and focus management
 * - Keyboard navigation (arrow keys) inside nav
 */

export class Navigation {
  constructor() {
    // Query elements safely
    this.navToggle = document.getElementById('nav-toggle');
    this.navList = document.getElementById('nav-list');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.links = Array.from(document.querySelectorAll('.nav-link'));
    // Observe only sections that have an id (so we don't observe irrelevant sections)
    this.sections = Array.from(document.querySelectorAll('section[id]'));

    // sticky header height (used for offset if needed)
    this.headerEl = document.querySelector('header');
    this.headerHeight = this.headerEl ? this.headerEl.offsetHeight : 0;

    // Bind handlers
    this._onToggle = this._onToggle.bind(this);
    this._onDocumentKeydown = this._onDocumentKeydown.bind(this);
    this._onLinkKeydown = this._onLinkKeydown.bind(this);

    this.init();
  }

  init() {
    if (this.navToggle) this.navToggle.addEventListener('click', this._onToggle);

    // Bind link clicks for smooth scroll
    this.links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this._handleLinkClick(link);
      });

      // keyboard navigation on each link (Left/Right Up/Down)
      link.addEventListener('keydown', this._onLinkKeydown);
    });

    // document keydown (escape to close mobile)
    document.addEventListener('keydown', this._onDocumentKeydown);

    // IntersectionObserver to highlight currently visible section
    this._observeSections();
  }

  // Toggle mobile open/close
  _onToggle() {
    const isOpen = this.navToggle.getAttribute('aria-expanded') === 'true';
    this._toggleNav(!isOpen);
  }

  _toggleNav(open) {
    if (open) {
      // show mobile menu
      if (this.mobileMenu) {
        this.mobileMenu.classList.remove('hidden');
        this.mobileMenu.setAttribute('aria-hidden', 'false');
      }
      if (this.navList) {
        this.navList.classList.remove('hidden');
        this.navList.classList.add('flex', 'flex-col', 'gap-4', 'mt-4');
      }
      this.navToggle?.setAttribute('aria-expanded', 'true');
      // focus first link for accessibility
      const first = this.links[0];
      if (first) first.focus();
    } else {
      if (this.mobileMenu) {
        this.mobileMenu.classList.add('hidden');
        this.mobileMenu.setAttribute('aria-hidden', 'true');
      }
      if (this.navList) {
        this.navList.classList.add('hidden');
        this.navList.classList.remove('flex', 'flex-col', 'gap-4', 'mt-4');
      }
      this.navToggle?.setAttribute('aria-expanded', 'false');
    }
  }

  _handleLinkClick(link) {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    // Smooth scroll with offset to account for sticky header
    const top = target.getBoundingClientRect().top + window.pageYOffset - this.headerHeight - 8;
    window.scrollTo({
      top,
      behavior: 'smooth'
    });

    // Set active class immediately for visual feedback
    this._setActiveLink(link);

    // Close mobile nav after selection (if open)
    if (this.navToggle && this.navToggle.getAttribute('aria-expanded') === 'true') {
      this._toggleNav(false);
    }
  }

  _setActiveLink(active) {
    this.links.forEach(l => {
      l.classList.remove('bg-blue-600', 'text-white');
      l.removeAttribute('aria-current');
    });
    if (active) {
      active.classList.add('bg-blue-600', 'text-white');
      active.setAttribute('aria-current', 'page');
    }
  }

  // Arrow key navigation across links
  _onLinkKeydown(e) {
    const keysNext = ['ArrowRight', 'ArrowDown'];
    const keysPrev = ['ArrowLeft', 'ArrowUp'];

    if (keysNext.includes(e.key)) {
      e.preventDefault();
      this._focusOffset(1);
    } else if (keysPrev.includes(e.key)) {
      e.preventDefault();
      this._focusOffset(-1);
    }
  }

  _focusOffset(offset) {
    const current = document.activeElement;
    const idx = this.links.indexOf(current);
    let next = 0;
    if (idx === -1) {
      next = 0;
    } else {
      next = (idx + offset + this.links.length) % this.links.length;
    }
    this.links[next].focus();
  }

  _onDocumentKeydown(e) {
    // Escape closes mobile menu
    if (e.key === 'Escape') {
      if (this.navToggle && this.navToggle.getAttribute('aria-expanded') === 'true') {
        this._toggleNav(false);
        this.navToggle.focus();
      }
    }
  }

  // IntersectionObserver used to set the active nav link as user scrolls
  _observeSections() {
    if (!this.sections || this.sections.length === 0) return;

    // Use rootMargin so the intersection accounts for the sticky header height
    const rootMargin = `-${Math.min(this.headerHeight + 8, 120)}px 0px -40% 0px`;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          const link = document.querySelector(`.nav-link[href="#${id}"]`);
          if (link) this._setActiveLink(link);
        }
      });
    }, { threshold: 0.5, rootMargin });

    // Observe all sections
    this.sections.forEach(s => observer.observe(s));

    // store observer so it can be disconnected later if needed
    this._observer = observer;
  }

  // Optional cleanup if needed (not used here, but nice for tests)
  destroy() {
    this.navToggle?.removeEventListener('click', this._onToggle);
    document.removeEventListener('keydown', this._onDocumentKeydown);
    this.links.forEach(link => {
      link.removeEventListener('keydown', this._onLinkKeydown);
      link.removeEventListener('click', this._handleLinkClick);
    });
    if (this._observer) this._observer.disconnect();
  }
}

// Auto-initialize on DOM ready (main.js will also initialize; safe to keep here if called once)
