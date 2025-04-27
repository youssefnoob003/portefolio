/**
 * Initializes hero component functionality
 */
export function initializeHero(): void {
  const heroElement = document.querySelector('.hero') as HTMLElement;
  
  if (heroElement) {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      // Create parallax effect
      heroElement.style.opacity = Math.max(0, 1 - scrollPosition / 700).toString();
      heroElement.style.transform = `translateY(${scrollPosition * 0.4}px)`;

      // Update scroll prompt opacity
      const scrollPrompt = document.querySelector('.scroll-prompt') as HTMLElement;
      if (scrollPrompt) {
        scrollPrompt.style.opacity = Math.max(0, 1 - scrollPosition / 300).toString();
      }
    }, { passive: true });
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeHero);