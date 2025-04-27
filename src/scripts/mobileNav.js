class MobileNavigation {
  constructor() {
    this.nav = document.querySelector('.challenge-nav');
    this.toggleButton = document.createElement('button');
    this.setupToggleButton();
    this.setupEventListeners();
  }

  setupToggleButton() {
    this.toggleButton.className = 'mobile-nav-toggle';
    this.toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
    this.toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    `;
    document.body.appendChild(this.toggleButton);
  }

  setupEventListeners() {
    // Toggle button click
    this.toggleButton.addEventListener('click', () => {
      this.nav.classList.toggle('show');
      this.toggleButton.setAttribute('aria-expanded', this.nav.classList.contains('show'));
    });

    // Close on clicking outside
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target) && !this.toggleButton.contains(e.target) && this.nav.classList.contains('show')) {
        this.nav.classList.remove('show');
        this.toggleButton.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on clicking a link (mobile only)
    if (window.innerWidth <= 768) {
      const links = this.nav.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', () => {
          this.nav.classList.remove('show');
          this.toggleButton.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MobileNavigation();
});