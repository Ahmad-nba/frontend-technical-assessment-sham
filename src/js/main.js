import { Navigation } from './navigation.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if nav exists
  if (document.querySelector('.nav-toggle') || document.querySelector('.nav-list')) {
    // eslint-disable-next-line no-new
    new Navigation();
  }
});
