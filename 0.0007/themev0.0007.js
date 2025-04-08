/**
 * File: G:\B.O.B\theme.js v0.0007
 * Purpose: Theme and accessibility management with fixed toggle functionality
 * Location: Project root directory
 * 
 * Related files:
 *   - G:\B.O.B\index.html (imports this script)
 *   - G:\B.O.B\style.css (contains theme variables)
 */

/**
 * ThemeManager Class
 * Handles all theme switching and accessibility preferences
 */
class ThemeManager {
    constructor() {
        // Default settings
        this.settings = {
            theme: 'light',
            contrast: 'normal',
            fontSize: 'medium',
            reduceMotion: false,
            colorBlindMode: 'none',
            fontFamily: 'default'
        };
        
        // Load saved settings if available
        this.loadSettings();
        
        // Apply initial settings
        this.applySettings();
        
        // Wait for DOM to be fully loaded before initializing event listeners
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing theme event listeners');
            this.initEventListeners();
        });
    }
    
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('bob-accessibility-settings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
                console.log('Loaded settings from storage:', this.settings);
            } else {
                // If no saved settings, check for system preferences
                this.detectSystemPreferences();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            // Fallback to detecting system preferences if localStorage fails
            this.detectSystemPreferences();
        }
    }
    
    /**
     * Detect system preferences for initial settings
     */
    detectSystemPreferences() {
        // Check for dark mode preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.settings.theme = 'dark';
            console.log('System prefers dark mode, setting theme to dark');
        }
        
        // Check for reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.settings.reduceMotion = true;
            console.log('System prefers reduced motion');
        }
    }
    
    /**
     * Save current settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('bob-accessibility-settings', JSON.stringify(this.settings));
            console.log('Saved settings to storage:', this.settings);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    /**
     * Apply all current settings to the document
     */
    applySettings() {
        console.log('Applying settings:', this.settings);
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        // Apply contrast setting
        document.documentElement.setAttribute('data-contrast', this.settings.contrast);
        
        // Apply font size
        document.documentElement.setAttribute('data-font-size', this.settings.fontSize);
        
        // Apply motion preference
        document.documentElement.setAttribute('data-reduce-motion', this.settings.reduceMotion.toString());
        
        // Apply color blind mode
        if (this.settings.colorBlindMode !== 'none') {
            document.documentElement.setAttribute('data-color-blind', this.settings.colorBlindMode);
        } else {
            document.documentElement.removeAttribute('data-color-blind');
        }
        
        // Apply font family
        if (this.settings.fontFamily !== 'default') {
            document.documentElement.setAttribute('data-font-family', this.settings.fontFamily);
            this.loadCustomFonts(this.settings.fontFamily);
        } else {
            document.documentElement.removeAttribute('data-font-family');
        }
        
        // Update UI controls to match current settings
        this.updateUIControls();
    }
    
    /**
     * Load custom fonts based on font family selection
     * @param {string} fontFamily - The selected font family
     */
    loadCustomFonts(fontFamily) {
        // This method will dynamically load fonts if needed
        if (fontFamily === 'dyslexic') {
            // Attempt to load dyslexic-friendly font if not already loaded
            if (!document.getElementById('dyslexic-font')) {
                const fontLink = document.createElement('link');
                fontLink.id = 'dyslexic-font';
                fontLink.rel = 'stylesheet';
                fontLink.href = './assets/fonts/dyslexic/stylesheet.css';
                document.head.appendChild(fontLink);
                console.log('Loaded dyslexic font stylesheet');
            }
        }
    }
    
    /**
     * Initialize event listeners for all settings controls
     */
    initEventListeners() {
        console.log('Initializing theme toggle event listeners');
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            // Set initial state
            themeToggle.checked = this.settings.theme === 'dark';
            
            // Add event listener with direct binding to this instance
            themeToggle.addEventListener('change', (e) => {
                console.log('Theme toggle changed:', e.target.checked);
                this.settings.theme = e.target.checked ? 'dark' : 'light';
                this.applySettings();
                this.saveSettings();
                
                // Update theme label text immediately
                const themeLabel = document.querySelector('label[for="themeToggle"]');
                if (themeLabel) {
                    themeLabel.textContent = `Theme: ${this.settings.theme.charAt(0).toUpperCase() + this.settings.theme.slice(1)}`;
                }
            });
            
            console.log('Theme toggle initialized, current state:', themeToggle.checked);
        } else {
            console.warn('Theme toggle element not found in DOM');
        }
        
        // Contrast setting
        const contrastSelect = document.getElementById('contrastSelect');
        if (contrastSelect) {
            contrastSelect.value = this.settings.contrast;
            contrastSelect.addEventListener('change', (e) => {
                console.log('Contrast changed to:', e.target.value);
                this.settings.contrast = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        }
        
        // Font size setting
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        if (fontSizeSelect) {
            fontSizeSelect.value = this.settings.fontSize;
            fontSizeSelect.addEventListener('change', (e) => {
                console.log('Font size changed to:', e.target.value);
                this.settings.fontSize = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        }
        
        // Reduce motion toggle
        const reduceMotionToggle = document.getElementById('reduceMotionToggle');
        if (reduceMotionToggle) {
            reduceMotionToggle.checked = this.settings.reduceMotion;
            reduceMotionToggle.addEventListener('change', (e) => {
                console.log('Reduce motion changed to:', e.target.checked);
                this.settings.reduceMotion = e.target.checked;
                this.applySettings();
                this.saveSettings();
                
                // Apply reduced motion immediately to all animations
                if (e.target.checked) {
                    document.querySelectorAll('.animated').forEach(el => {
                        el.classList.add('no-animation');
                    });
                } else {
                    document.querySelectorAll('.no-animation').forEach(el => {
                        el.classList.remove('no-animation');
                    });
                }
            });
        }
        
        // Color blind mode select
        const colorBlindSelect = document.getElementById('colorBlindSelect');
        if (colorBlindSelect) {
            colorBlindSelect.value = this.settings.colorBlindMode;
            colorBlindSelect.addEventListener('change', (e) => {
                console.log('Color blind mode changed to:', e.target.value);
                this.settings.colorBlindMode = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        }
        
        // Font family select
        const fontFamilySelect = document.getElementById('fontFamilySelect');
        if (fontFamilySelect) {
            fontFamilySelect.value = this.settings.fontFamily;
            fontFamilySelect.addEventListener('change', (e) => {
                console.log('Font family changed to:', e.target.value);
                this.settings.fontFamily = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        }
    }
    
    /**
     * Update UI controls to match current settings
     */
    updateUIControls() {
        // Update theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.checked = this.settings.theme === 'dark';
        }
        
        // Update theme label text
        const themeLabel = document.querySelector('label[for="themeToggle"]');
        if (themeLabel) {
            themeLabel.textContent = `Theme: ${this.settings.theme.charAt(0).toUpperCase() + this.settings.theme.slice(1)}`;
        }
        
        // Update contrast select
        const contrastSelect = document.getElementById('contrastSelect');
        if (contrastSelect) {
            contrastSelect.value = this.settings.contrast;
        }
        
        // Update font size select
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        if (fontSizeSelect) {
            fontSizeSelect.value = this.settings.fontSize;
        }
        
        // Update reduce motion toggle
        const reduceMotionToggle = document.getElementById('reduceMotionToggle');
        if (reduceMotionToggle) {
            reduceMotionToggle.checked = this.settings.reduceMotion;
        }
        
        // Update color blind mode select
        const colorBlindSelect = document.getElementById('colorBlindSelect');
        if (colorBlindSelect) {
            colorBlindSelect.value = this.settings.colorBlindMode;
        }
        
        // Update font family select
        const fontFamilySelect = document.getElementById('fontFamilySelect');
        if (fontFamilySelect) {
            fontFamilySelect.value = this.settings.fontFamily;
        }
    }
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.applySettings();
        this.saveSettings();
    }
    
    /**
     * Set a specific theme
     * @param {string} theme - The theme to set ('light' or 'dark')
     */
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.settings.theme = theme;
            this.applySettings();
            this.saveSettings();
        }
    }
    
    /**
     * Set contrast level
     * @param {string} contrast - Contrast level ('normal', 'high')
     */
    setContrast(contrast) {
        this.settings.contrast = contrast;
        this.applySettings();
        this.saveSettings();
    }
    
    /**
     * Set font size
     * @param {string} size - Font size ('medium', 'large', 'x-large')
     */
    setFontSize(size) {
        this.settings.fontSize = size;
        this.applySettings();
        this.saveSettings();
    }
    
    /**
     * Toggle reduced motion setting
     */
    toggleReducedMotion() {
        this.settings.reduceMotion = !this.settings.reduceMotion;
        this.applySettings();
        this.saveSettings();
    }
    
    /**
     * Set color blind mode
     * @param {string} mode - Color blind mode ('none', 'protanopia', 'deuteranopia', 'tritanopia')
     */
    setColorBlindMode(mode) {
        this.settings.colorBlindMode = mode;
        this.applySettings();
        this.saveSettings();
    }
    
    /**
     * Set font family
     * @param {string} family - Font family ('default', 'system', 'dyslexic')
     */
    setFontFamily(family) {
        if (['default', 'system', 'dyslexic'].includes(family)) {
            this.settings.fontFamily = family;
            this.applySettings();
            this.saveSettings();
        }
    }
}

// Create global instance of ThemeManager
window.themeManager = new ThemeManager();

// Export the ThemeManager for use in other modules
export default ThemeManager;