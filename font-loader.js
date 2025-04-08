/**
 * File: G:\B.O.B\font-loader.js
 * Purpose: Handles local font loading and provides a smooth loading experience
 * Location: Project root directory
 * 
 * Related files:
 *   - G:\B.O.B\index.html (loads this script)
 *   - G:\B.O.B\font-styles.css (contains @font-face declarations)
 *   - G:\B.O.B\assets\fonts\* (font files referenced by this loader)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Add a class while fonts are loading
  document.documentElement.classList.add('fonts-loading');
  
  // Define our font families and weights to check
  const fontFamilies = [
    { family: 'Montserrat', weights: [300, 400, 700, 800] },
    { family: 'Gilroy', weights: [300, 800] }
  ];

  // Create an array of promises for each font
  const fontPromises = [];
  
  // If the browser supports the Font Loading API
  if ('fonts' in document) {
    // Create promises for each font weight
    fontFamilies.forEach(fontFamily => {
      fontFamily.weights.forEach(weight => {
        const fontPromise = document.fonts.load(`${weight} 1em ${fontFamily.family}`);
        fontPromises.push(fontPromise);
      });
    });
    
    // Wait for all fonts to load
    Promise.all(fontPromises)
      .then(() => {
        console.log('All fonts have loaded.');
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
      })
      .catch(err => {
        console.warn('Some fonts failed to load:', err);
        // Still remove the loading class and add the loaded class
        // to ensure the UI is displayed, even with fallback fonts
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
      });
  } else {
    // For browsers that don't support the Font Loading API
    // Just use a timeout as a fallback
    console.warn('Font Loading API not supported. Using timeout fallback.');
    setTimeout(() => {
      document.documentElement.classList.remove('fonts-loading');
      document.documentElement.classList.add('fonts-loaded');
    }, 500); // 500ms should be enough for most font loads
  }
  
  // Timeout safety net - ensure we remove the loading class even if something goes wrong
  setTimeout(() => {
    if (document.documentElement.classList.contains('fonts-loading')) {
      console.warn('Font loading timed out after 2 seconds.');
      document.documentElement.classList.remove('fonts-loading');
      document.documentElement.classList.add('fonts-loaded');
    }
  }, 2000);
});