#!/usr/bin/env node

/**
 * B.O.B. AI Setup Script
 * This script checks for required components and installs them if necessary.
 * It sets up Ollama, downloads the Llama3 model, and configures the necessary
 * libraries for document processing and vector storage.
 */

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const https = require('https');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const config = {
  // Basic paths
  rootDir: path.join(__dirname),
  dataDir: path.join(__dirname, 'data'),
  modelsDir: path.join(__dirname, 'data', 'models'),
  tempDir: path.join(__dirname, 'temp'),
  
  // Ollama config
  ollama: {
    installDir: os.platform() === 'win32' ? 'C:\\Program Files\\Ollama' : '/usr/local/bin',
    modelName: 'llama3',
    modelTag: '8b-q4_0',
    downloadUrl: {
      win32: 'https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.zip',
      darwin: 'https://github.com/ollama/ollama/releases/latest/download/ollama-darwin-amd64',
      linux: 'https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64'
    }
  },
  
  // Library dependencies
  dependencies: {
    node: [
      'express', 'axios', 'cors', 'body-parser', 'dotenv', 'chromadb',
      'mammoth', 'exceljs', 'pdf-parse', 'onnxruntime-node', '@xenova/transformers',
      'sqlite3', 'docker-compose'
    ],
    python: [
      'chromadb', 'sentence-transformers', 'onnxruntime', 'numpy',
      'docx2txt', 'openpyxl', 'pdfminer.six', 'pyarrow'
    ]
  }
};

// Logger with timestamps
const logger = {
  info: (message) => console.log(`[${new Date().toISOString()}] [INFO] ${message}`),
  error: (message) => console.error(`[${new Date().toISOString()}] [ERROR] ${message}`),
  success: (message) => console.log(`[${new Date().toISOString()}] [SUCCESS] ${message}`),
  warning: (message) => console.warn(`[${new Date().toISOString()}] [WARNING] ${message}`)
};

// Main function
async function main() {
  try {
    logger.info('Starting B.O.B. AI setup...');
    
    // Create necessary directories
    createDirectories();
    
    // Check system requirements
    await checkSystemRequirements();
    
    // Check and install dependencies
    await checkNodeDependencies();
    
    // Check and install Ollama
    await checkAndInstallOllama();
    
    // Check and download Llama model
    await checkAndDownloadModel();
    
    // Check and setup ChromaDB
    await setupChromaDB();
    
    // Generate Docker configuration
    generateDockerConfig();
    
    // Create basic configuration file
    createConfigFile();
    
    logger.success('Setup completed successfully!');
    logger.info('You can now start developing the B.O.B. AI components.');
    
    rl.close();
  } catch (error) {
    logger.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Create necessary directories
function createDirectories() {
  logger.info('Setting up directory structure...');
  
  const directories = [
    config.dataDir,
    config.modelsDir,
    config.tempDir,
    path.join(config.dataDir, 'vector_db'),
    path.join(config.dataDir, 'documents')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  });
}

// Check system requirements
async function checkSystemRequirements() {
  logger.info('Checking system requirements...');
  
  // Check for Node.js
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    logger.info(`Node.js version: ${nodeVersion}`);
    
    // Verify Node.js version is at least 14
    const versionMatch = nodeVersion.match(/v(\d+)\./);
    if (versionMatch && parseInt(versionMatch[1]) < 14) {
      throw new Error('Node.js version 14 or higher is required');
    }
  } catch (error) {
    throw new Error('Node.js is not installed or not in PATH');
  }
  
  // Check for NPM
  try {
    const npmVersion = execSync('npm --version').toString().trim();
    logger.info(`NPM version: ${npmVersion}`);
  } catch (error) {
    throw new Error('NPM is not installed or not in PATH');
  }
  
  // Check for Docker if needed
  try {
    const dockerVersion = execSync('docker --version').toString().trim();
    logger.info(`Docker version: ${dockerVersion}`);
  } catch (error) {
    logger.warning('Docker is not installed or not in PATH. Some features may not work properly.');
  }
  
  // Check for Python
  try {
    const pythonCommand = os.platform() === 'win32' ? 'python --version' : 'python3 --version';
    const pythonVersion = execSync(pythonCommand).toString().trim();
    logger.info(`Python version: ${pythonVersion}`);
  } catch (error) {
    logger.warning('Python is not installed or not in PATH. Some features may not work properly.');
  }

  // Check RAM
  const totalMemory = Math.round(os.totalmem() / (1024 * 1024 * 1024));
  logger.info(`System RAM: ${totalMemory} GB`);
  
  if (totalMemory < 8) {
    logger.warning('Less than 8GB of RAM detected. Performance may be limited.');
  }
  
  // Check CPU
  const cpuInfo = os.cpus();
  logger.info(`CPU: ${cpuInfo[0].model} (${cpuInfo.length} cores)`);
  
  if (cpuInfo.length < 4) {
    logger.warning('Less than 4 CPU cores detected. Performance may be limited.');
  }
}

// Check and install Node dependencies
async function checkNodeDependencies() {
  logger.info('Checking Node.js dependencies...');
  
  // Read existing package.json
  let packageJson = {};
  const packageJsonPath = path.join(config.rootDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
      logger.warning(`Could not parse package.json: ${error.message}`);
      packageJson = { dependencies: {} };
    }
  } else {
    logger.info('No package.json found, creating one...');
    packageJson = {
      name: 'bob-ai',
      version: '0.1.0',
      description: 'B.O.B. (Business Organizational Brain) AI component',
      main: 'index.js',
      dependencies: {},
      scripts: {
        start: 'node index.js'
      }
    };
  }
  
  // Ensure dependencies object exists
  packageJson.dependencies = packageJson.dependencies || {};
  
  // Check for missing dependencies
  const missingDeps = [];
  for (const dep of config.dependencies.node) {
    if (!packageJson.dependencies[dep]) {
      missingDeps.push(dep);
    }
  }
  
  // Install missing dependencies
  if (missingDeps.length > 0) {
    logger.info(`Installing missing Node.js dependencies: ${missingDeps.join(', ')}`);
    try {
      await execPromise(`npm install --save ${missingDeps.join(' ')}`);
      logger.success('Node.js dependencies installed successfully');
    } catch (error) {
      throw new Error(`Failed to install Node.js dependencies: ${error.message}`);
    }
  } else {
    logger.info('All Node.js dependencies are already installed');
  }
  
  // Update package.json if needed
  if (!fs.existsSync(packageJsonPath)) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    logger.info('Created package.json file');
  }
}

// Check and install Ollama
async function checkAndInstallOllama() {
  logger.info('Checking for Ollama installation...');
  
  // Check if Ollama is already installed
  let ollamaInstalled = false;
  try {
    const ollamaVersion = execSync('ollama --version').toString().trim();
    logger.info(`Ollama is already installed (${ollamaVersion})`);
    ollamaInstalled = true;
  } catch (error) {
    logger.info('Ollama not found, proceeding with installation...');
  }
  
  if (!ollamaInstalled) {
    // Install Ollama based on platform
    const platform = os.platform();
    
    if (platform === 'win32') {
      await installOllamaWindows();
    } else if (platform === 'darwin') {
      await installOllamaMac();
    } else if (platform === 'linux') {
      await installOllamaLinux();
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }
  
  // Verify Ollama installation
  try {
    await execPromise('ollama --version');
    logger.success('Ollama installation verified');
  } catch (error) {
    throw new Error('Ollama installation failed or not in PATH');
  }
}

// Install Ollama on Windows
async function installOllamaWindows() {
  logger.info('Installing Ollama on Windows...');
  
  const downloadUrl = config.ollama.downloadUrl.win32;
  const zipPath = path.join(config.tempDir, 'ollama.zip');
  
  // Download Ollama
  await downloadFile(downloadUrl, zipPath);
  
  // Extract ZIP (requires PowerShell)
  logger.info('Extracting Ollama...');
  await execPromise(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${config.tempDir}\\ollama' -Force"`);
  
  // Create Ollama directory in Program Files if it doesn't exist
  if (!fs.existsSync(config.ollama.installDir)) {
    fs.mkdirSync(config.ollama.installDir, { recursive: true });
  }
  
  // Copy ollama.exe to install directory
  logger.info(`Copying Ollama to ${config.ollama.installDir}...`);
  fs.copyFileSync(
    path.join(config.tempDir, 'ollama', 'ollama.exe'),
    path.join(config.ollama.installDir, 'ollama.exe')
  );
  
  // Add to PATH if not already
  logger.info('Adding Ollama to PATH...');
  await execPromise(`setx PATH "%PATH%;${config.ollama.installDir}"`);
  
  logger.success('Ollama installed successfully');
  logger.info('Please restart your terminal or system for PATH changes to take effect');
}

// Install Ollama on macOS
async function installOllamaMac() {
  logger.info('Installing Ollama on macOS...');
  
  try {
    // Using the official installer command
    await execPromise('curl -fsSL https://ollama.com/install.sh | sh');
    logger.success('Ollama installed successfully');
  } catch (error) {
    throw new Error(`Failed to install Ollama: ${error.message}`);
  }
}

// Install Ollama on Linux
async function installOllamaLinux() {
  logger.info('Installing Ollama on Linux...');
  
  try {
    // Using the official installer command
    await execPromise('curl -fsSL https://ollama.com/install.sh | sh');
    logger.success('Ollama installed successfully');
  } catch (error) {
    throw new Error(`Failed to install Ollama: ${error.message}`);
  }
}

// Download a file from URL
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    logger.info(`Downloading ${url}...`);
    
    const file = fs.createWriteStream(destination);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        logger.info(`Download completed: ${destination}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(destination, () => {}); // Delete partial file
      reject(err);
    });
  });
}

// Check and download Llama model
async function checkAndDownloadModel() {
  const modelName = `${config.ollama.modelName}:${config.ollama.modelTag}`;
  logger.info(`Checking for Llama model (${modelName})...`);
  
  // Check if model is already available
  try {
    const modelsOutput = execSync('ollama list').toString();
    if (modelsOutput.includes(modelName)) {
      logger.info(`Model ${modelName} is already downloaded`);
      return;
    }
  } catch (error) {
    logger.warning(`Could not check available models: ${error.message}`);
  }
  
  // Download the model
  logger.info(`Downloading ${modelName} model (this may take a while)...`);
  try {
    // Start Ollama service if not running
    try {
      if (os.platform() === 'win32') {
        // Check if ollama service is running on Windows
        const serviceStatus = execSync('powershell -Command "Get-Process ollama -ErrorAction SilentlyContinue"').toString();
        if (!serviceStatus) {
          logger.info('Starting Ollama service...');
          exec('start /B ollama serve');
          // Wait for service to start
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } else {
        // For Linux/Mac, just try to start it
        exec('ollama serve &');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      logger.warning(`Could not verify Ollama service: ${error.message}`);
    }
    
    // Pull the model
    logger.info('Pulling Llama model (this will take some time)...');
    execSync(`ollama pull ${modelName}`, { stdio: 'inherit' });
    logger.success(`Model ${modelName} downloaded successfully`);
  } catch (error) {
    throw new Error(`Failed to download model: ${error.message}`);
  }
}

// Setup ChromaDB
async function setupChromaDB() {
  logger.info('Setting up ChromaDB...');
  
  // Create ChromaDB directory if it doesn't exist
  const chromaDbDir = path.join(config.dataDir, 'vector_db', 'chroma');
  if (!fs.existsSync(chromaDbDir)) {
    fs.mkdirSync(chromaDbDir, { recursive: true });
    logger.info(`Created ChromaDB directory: ${chromaDbDir}`);
  }
  
  // Check if Python is available for additional setup
  let pythonAvailable = false;
  try {
    const pythonCommand = os.platform() === 'win32' ? 'python --version' : 'python3 --version';
    execSync(pythonCommand);
    pythonAvailable = true;
  } catch (error) {
    logger.warning('Python not available, skipping Python-specific ChromaDB setup');
  }
  
  if (pythonAvailable) {
    // Install Python dependencies if Python is available
    logger.info('Installing Python dependencies for ChromaDB...');
    
    const pipCommand = os.platform() === 'win32' ? 'pip install' : 'pip3 install';
    try {
      await execPromise(`${pipCommand} ${config.dependencies.python.join(' ')}`);
      logger.success('Python dependencies installed successfully');
    } catch (error) {
      logger.warning(`Failed to install some Python dependencies: ${error.message}`);
      logger.warning('You may need to install them manually later');
    }
  }
  
  // Create a test connection to verify JS ChromaDB works
  logger.info('Testing ChromaDB connection...');
  const testFile = path.join(config.tempDir, 'chroma-test.js');
  
  // Write a simple test script
  fs.writeFileSync(testFile, `
  const { ChromaClient } = require('chromadb');
  
  async function testChroma() {
    try {
      const client = new ChromaClient();
      // Just testing connection
      await client.listCollections();
      console.log("ChromaDB connection successful");
    } catch (error) {
      console.error("ChromaDB connection failed:", error.message);
      process.exit(1);
    }
  }
  
  testChroma();
  `);
  
  try {
    execSync(`node ${testFile}`);
    logger.success('ChromaDB setup verified');
  } catch (error) {
    logger.warning(`ChromaDB verification failed: ${error.message}`);
    logger.warning('You may need to troubleshoot ChromaDB setup manually');
  }
}

// Generate Docker configuration
function generateDockerConfig() {
  logger.info('Generating Docker configuration...');
  
  const dockerComposePath = path.join(config.rootDir, 'docker-compose.yml');
  const dockerfileOllamaPath = path.join(config.rootDir, 'Dockerfile.ollama');
  const dockerfileAppPath = path.join(config.rootDir, 'Dockerfile.app');
  
  // Don't overwrite existing files
  if (fs.existsSync(dockerComposePath)) {
    logger.info('Docker Compose file already exists, skipping');
  } else {
    const dockerComposeContent = `version: '3'

services:
  bob-app:
    build:
      context: .
      dockerfile: Dockerfile.app
    volumes:
      - ./data:/app/data
    ports:
      - "3000:3000"
    depends_on:
      - ollama-service
    environment:
      - NODE_ENV=production
      - OLLAMA_HOST=ollama-service
      - OLLAMA_PORT=11434

  ollama-service:
    build:
      context: .
      dockerfile: Dockerfile.ollama
    volumes:
      - ./data/models:/root/.ollama
    ports:
      - "11434:11434"
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: '8g'

volumes:
  bob-data:
    driver: local`;
    
    fs.writeFileSync(dockerComposePath, dockerComposeContent);
    logger.info('Created docker-compose.yml');
  }
  
  if (fs.existsSync(dockerfileOllamaPath)) {
    logger.info('Ollama Dockerfile already exists, skipping');
  } else {
    const dockerfileOllamaContent = `FROM ollama/ollama:latest

# Pre-load the model
RUN ollama pull llama3:8b-q4_0

EXPOSE 11434
CMD ["ollama", "serve"]`;
    
    fs.writeFileSync(dockerfileOllamaPath, dockerfileOllamaContent);
    logger.info('Created Dockerfile.ollama');
  }
  
  if (fs.existsSync(dockerfileAppPath)) {
    logger.info('App Dockerfile already exists, skipping');
  } else {
    const dockerfileAppContent = `FROM node:18-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]`;
    
    fs.writeFileSync(dockerfileAppPath, dockerfileAppContent);
    logger.info('Created Dockerfile.app');
  }
}

// Create configuration file
function createConfigFile() {
  logger.info('Creating configuration file...');
  
  const configPath = path.join(config.rootDir, 'ai-config.js');
  
  if (fs.existsSync(configPath)) {
    logger.info('Configuration file already exists, skipping');
    return;
  }
  
  const configContent = `/**
 * B.O.B. AI Configuration
 */

module.exports = {
  // Core paths
  paths: {
    data: '${path.join(config.rootDir, 'data').replace(/\\/g, '\\\\')}',
    models: '${path.join(config.rootDir, 'data', 'models').replace(/\\/g, '\\\\')}',
    documents: '${path.join(config.rootDir, 'data', 'documents').replace(/\\/g, '\\\\')}',
    vectorDb: '${path.join(config.rootDir, 'data', 'vector_db').replace(/\\/g, '\\\\')}'
  },
  
  // Ollama configuration
  ollama: {
    host: process.env.OLLAMA_HOST || 'localhost',
    port: process.env.OLLAMA_PORT || 11434,
    model: 'llama3:8b-q4_0',
    options: {
      temperature: 0.7,
      top_k: 40,
      top_p: 0.9,
      num_predict: 2048,
    }
  },
  
  // Vector database configuration
  vectorDb: {
    collection: 'bob_knowledge',
    embeddingModel: 'all-MiniLM-L6-v2',
    chunkSize: 500,
    chunkOverlap: 100,
    retrievalCount: 5
  },
  
  // Task-specific configurations
  tasks: {
    prioritization: {
      temperature: 0.2,
      systemPrompt: "You are a task prioritization assistant for ADHD users..."
    },
    ideaOrganization: {
      temperature: 0.7,
      systemPrompt: "You are an idea organization assistant for ADHD users..."
    },
    conversation: {
      temperature: 0.7,
      systemPrompt: "You are a helpful assistant for ADHD users..."
    },
    documentAnalysis: {
      temperature: 0.2,
      systemPrompt: "You are a document analysis assistant for ADHD users..."
    }
  },
  
  // Resource management
  resources: {
    maxConcurrentRequests: 2,
    requestTimeout: 30000, // 30 seconds
    maxDocumentSize: 10 * 1024 * 1024 // 10MB
  }
};`;
  
  fs.writeFileSync(configPath, configContent);
  logger.info('Created ai-config.js');
}

// Create basic template files
function createTemplates() {
  logger.info('Creating template files...');
  
  // Create a basic context router
  const contextRouterDir = path.join(config.rootDir, 'src', 'contextRouter');
  if (!fs.existsSync(contextRouterDir)) {
    fs.mkdirSync(contextRouterDir, { recursive: true });
  }
  
  const contextRouterPath = path.join(contextRouterDir, 'index.js');
  if (!fs.existsSync(contextRouterPath)) {
    const contextRouterContent = `/**
 * Context Router for B.O.B.
 * Analyzes input and selects appropriate prompt templates
 */

const config = require('../../ai-config');

// Task type constants
const TASK_TYPES = {
  PRIORITIZATION: 'prioritization',
  IDEA_ORGANIZATION: 'ideaOrganization',
  CONVERSATION: 'conversation',
  DOCUMENT_ANALYSIS: 'documentAnalysis'
};

/**
 * Detect task type from input
 * @param {string} input - User input text
 * @param {Object} metadata - Additional metadata
 * @returns {string} Task type identifier
 */
function detectTaskType(input, metadata = {}) {
  // If explicitly specified in metadata
  if (metadata.taskType && TASK_TYPES[metadata.taskType.toUpperCase()]) {
    return TASK_TYPES[metadata.taskType.toUpperCase()];
  }
  
  // Check if it's document analysis
  if (metadata.isDocument || input.length > 2000) {
    return TASK_TYPES.DOCUMENT_ANALYSIS;
  }
  
  // Task-related keywords
  if (/priorit|task|todo|deadline|schedule|urgent|important|when|due|complete/i.test(input)) {
    return TASK_TYPES.PRIORITIZATION;
  }
  
  // Idea-related keywords
  if (/idea|thought|concept|creative|brainstorm|connect|pattern|imagine/i.test(input)) {
    return TASK_TYPES.IDEA_ORGANIZATION;
  }
  
  // Default to conversation
  return TASK_TYPES.CONVERSATION;
}

/**
 * Create prompt for specific task type
 * @param {string} input - User input text
 * @param {string} taskType - Type of task
 * @param {Object} userData - User-specific data
 * @returns {Object} Full prompt object
 */
function createPrompt(input, taskType, userData = {}) {
  const taskConfig = config.tasks[taskType];
  
  // Build system message
  let systemMessage = taskConfig.systemPrompt;
  
  // Add user context if available
  if (userData.preferredWorkingHours) {
    systemMessage += \`\\nUser typically works best between \${userData.preferredWorkingHours}.\`;
  }
  
  if (userData.energyLevel) {
    systemMessage += \`\\nUser's current energy level: \${userData.energyLevel}/10.\`;
  }
  
  return {
    model: config.ollama.model,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: input }
    ],
    options: {
      temperature: taskConfig.temperature || config.ollama.options.temperature,
      top_k: config.ollama.options.top_k,
      top_p: config.ollama.options.top_p,
      num_predict: config.ollama.options.num_predict
    }
  };
}

module.exports = {
  detectTaskType,
  createPrompt,
  TASK_TYPES
};`;
    
    fs.writeFileSync(contextRouterPath, contextRouterContent);
    logger.info('Created context router template');
  }
}

// Run the main function
main().catch(error => {
  logger.error(`Setup failed: ${error.message}`);
  process.exit(1);
});
