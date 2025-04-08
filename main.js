const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const serverManager = require('./serverManager');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
	useContentSize: true,  // Makes the window fit the web content
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets/images/icon.ico'), // Path to your icon
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  
  // Load the index.html of the app
  mainWindow.loadFile('index.html');
  
  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows
app.whenReady().then(() => {
  // Start the AI server first
  serverManager.startServer();
  serverManager.setupShutdownHandlers();
  
  // Create the window
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    serverManager.stopServer();
    app.quit();
  }
});

app.on('before-quit', () => {
  serverManager.stopServer();
});

// Add a watchdog timer
setInterval(() => {
  // Check AI server health
  if (!serverManager.isServerRunning()) {
    console.log('AI server appears to be down, attempting to restart...');
    serverManager.startServer();
  }
}, 60000); // Check every minute

// IPC handlers for communication between renderer and main processes
ipcMain.on('task-created', (event, task) => {
  // Handle task creation
  console.log('Task created:', task);
});

ipcMain.on('task-updated', (event, task) => {
  // Handle task updates
  console.log('Task updated:', task);
});