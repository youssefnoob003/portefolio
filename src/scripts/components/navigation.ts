/**
 * Initializes navigation functionality
 */
export function initializeNavigation(): void {
  document.querySelectorAll('.nav-item').forEach((item) => {
    const element = item as HTMLElement;
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'scale(1.1)';
    });
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'scale(1)';
    });
  });
  
  // Add active class to current page navigation item
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach((item) => {
    const navLink = item as HTMLAnchorElement;
    const href = navLink.getAttribute('href');
    
    if (href === currentPath || 
        (href !== '/' && currentPath.startsWith(href || '')) ||
        (href === '/' && currentPath === '/index.html')) {
      navLink.classList.add('active');
    }
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeNavigation);