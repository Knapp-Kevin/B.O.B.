/**
 * B.O.B. Font Downloader
 * This script downloads and prepares the required fonts for the application.
 * 
 * Location: root of the project (e.g., G:\B.O.B\download-fonts.js)
 * Run with: node download-fonts.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

// Define fonts to download
const FONTS = {
  montserrat: {
    url: 'https://fonts.google.com/download?family=Montserrat',
    weights: [300, 400, 700, 800],
    styles: ['normal'],
    format: 'ttf' // Google Fonts provides TTF format
  },
  // Note: Gilroy is a commercial font and should be purchased
  // This is just a placeholder for the script structure
  gilroy: {
    path: './commercial-fonts/gilroy/', // Local path where purchased font should be placed
    weights: [300, 800],
    styles: ['normal'],
    format: 'otf' // Gilroy is typically distributed as OTF
  }
};

// Create directory structure
const createDirectories = () => {
  const dirs = [
    './assets',
    './assets/fonts',
    './assets/fonts/montserrat',
    './assets/fonts/gilroy',
    './commercial-fonts',
    './commercial-fonts/gilroy'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Download a file from URL
const downloadFile = (url, destination) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', err => {
      fs.unlink(destination, () => {}); // Delete the file on error
      reject(err);
    });
  });
};

// Extract zip file
const extractZip = (zipPath, destination) => {
  return new Promise((resolve, reject) => {
    // Check if unzip is available
    exec('which unzip', (error) => {
      if (error) {
        console.warn('Warning: unzip command not found. Please extract the file manually.');
        resolve();
        return;
      }
      
      // Execute unzip command
      exec(`unzip -o "${zipPath}" -d "${destination}"`, (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`Failed to extract zip: ${stderr}`));
          return;
        }
        
        console.log(`Extracted ${zipPath} to ${destination}`);
        resolve();
      });
    });
  });
};

// Process fonts
const processFonts = async () => {
  try {
    createDirectories();
    
    // Process Google Fonts
    const googleFonts = Object.entries(FONTS).filter(([_, config]) => config.url);
    
    for (const [fontName, config] of googleFonts) {
      const zipPath = `./assets/fonts/${fontName}.zip`;
      
      console.log(`Downloading ${fontName} font...`);
      await downloadFile(config.url, zipPath);
      
      console.log(`Extracting ${fontName} font...`);
      await extractZip(zipPath, `./assets/fonts/${fontName}_temp`);
      
      // Move only the required font files
      const sourceDir = `./assets/fonts/${fontName}_temp/static`;
      const targetDir = `./assets/fonts/${fontName}`;
      
      if (fs.existsSync(sourceDir)) {
        // Process each weight and style
        config.weights.forEach(weight => {
          config.styles.forEach(style => {
            const suffix = style === 'normal' ? '' : style.charAt(0).toUpperCase() + style.slice(1);
            const fontFile = `${fontName.charAt(0).toUpperCase() + fontName.slice(1)}-${getWeightName(weight)}${suffix}.${config.format}`;
            
            const sourcePath = path.join(sourceDir, fontFile);
            const targetPath = path.join(targetDir, fontFile);
            
            if (fs.existsSync(sourcePath)) {
              fs.copyFileSync(sourcePath, targetPath);
              console.log(`Copied ${fontFile} to ${targetDir}`);
            } else {
              console.warn(`Warning: Font file not found: ${sourcePath}`);
            }
          });
        });
      } else {
        console.warn(`Warning: Expected directory not found: ${sourceDir}`);
      }
      
      // Clean up
      fs.unlinkSync(zipPath);
      fs.rmSync(`./assets/fonts/${fontName}_temp`, { recursive: true, force: true });
    }
    
    // Process commercial fonts
    const commercialFonts = Object.entries(FONTS).filter(([_, config]) => config.path);
    
    for (const [fontName, config] of commercialFonts) {
      if (!fs.existsSync(config.path)) {
        console.warn(`Warning: Commercial font directory not found: ${config.path}`);
        console.warn(`Please purchase and place ${fontName} font files in ${config.path}`);
        continue;
      }
      
      // Copy required commercial font files
      config.weights.forEach(weight => {
        config.styles.forEach(style => {
          const suffix = style === 'normal' ? '' : style.charAt(0).toUpperCase() + style.slice(1);
          const fontFile = `${fontName.charAt(0).toUpperCase() + fontName.slice(1)}-${getWeightName(weight)}${suffix}.${config.format}`;
          
          const sourcePath = path.join(config.path, fontFile);
          const targetPath = path.join(`./assets/fonts/${fontName}`, fontFile);
          
          if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`Copied ${fontFile} to assets/fonts/${fontName}/`);
          } else {
            console.warn(`Warning: Required commercial font file not found: ${sourcePath}`);
            console.warn(`Expected file: ${fontFile}`);
            console.warn(`If your files use a different naming convention, rename them or modify this script.`);
          }
        });
      });
    }
    
    // Convert fonts to WOFF2 (if fonttools is installed)
    convertToWoff2();
    
    console.log('\nFont preparation completed!');
    console.log('--------------------------------------------------------------------------------');
    console.log('IMPORTANT: For commercial fonts like Gilroy, ensure you have purchased a license');
    console.log('           that allows embedding in applications before distributing your app.');
    console.log('--------------------------------------------------------------------------------');
    
  } catch (error) {
    console.error('Error processing fonts:', error);
  }
};

// Convert fonts to WOFF2 format
const convertToWoff2 = () => {
  // Check if fonttools is installed
  exec('which fonttools', (error) => {
    if (error) {
      console.warn('\nWarning: fonttools not found. Fonts will not be converted to WOFF2.');
      console.warn('To convert fonts to WOFF2 (recommended for web), install fonttools:');
      console.warn('pip install fonttools brotli');
      return;
    }
    
    // Find all font files (both TTF and OTF)
    let fontPaths = [];
    
    for (const [fontName, config] of Object.entries(FONTS)) {
      const fontDir = `./assets/fonts/${fontName}`;
      if (fs.existsSync(fontDir)) {
        const files = fs.readdirSync(fontDir).filter(file => 
          file.endsWith(`.${config.format}`)
        );
        fontPaths = fontPaths.concat(files.map(file => path.join(fontDir, file)));
      }
    }
    
    if (fontPaths.length === 0) {
      console.warn('No font files found to convert.');
      return;
    }
    
    console.log('\nConverting fonts to WOFF2 format...');
    
    // Convert each font
    fontPaths.forEach(fontPath => {
      const fileExt = path.extname(fontPath);
      const outputPath = fontPath.replace(fileExt, '.woff2');
      
      exec(`fonttools ttLib.woff2 compress "${fontPath}" -o "${outputPath}"`, (err, stdout, stderr) => {
        if (err) {
          console.warn(`Warning: Failed to convert ${fontPath} to WOFF2: ${stderr}`);
          return;
        }
        
        console.log(`Converted ${path.basename(fontPath)} to WOFF2 format`);
        
        // Remove the original font file to save space
        fs.unlinkSync(fontPath);
      });
    });
  });
};

// Convert font weight number to name
const getWeightName = (weight) => {
  const weightMap = {
    100: 'Thin',
    200: 'ExtraLight',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
    800: 'ExtraBold',
    900: 'Black'
  };
  
  return weightMap[weight] || 'Regular';
};

// Run the script
processFonts();