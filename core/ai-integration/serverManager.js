// serverManager.js
// Add this to your main.js file or create as a separate module

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const process = require('process');

class AIServerManager {
    constructor() {
        this.serverProcess = null;
        this.serverPath = path.join(__dirname, 'ai-server', 'index.js');
        this.pidFilePath = path.join(__dirname, 'ai-server', '.server.pid');
    }

    /**
     * Start the AI server as a child process
     */
    startServer() {
        // Check if server is already running
        if (this.isServerRunning()) {
            console.log('AI server is already running');
            return;
        }

        console.log('Starting AI server...');
        
        // Spawn the server process
        this.serverProcess = spawn('node', [this.serverPath], {
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        // Save the PID to a file for recovery purposes
        fs.writeFileSync(this.pidFilePath, this.serverProcess.pid.toString());

        // Handle server output for logging
        this.serverProcess.stdout.on('data', (data) => {
            console.log(`AI Server: ${data}`);
        });

        this.serverProcess.stderr.on('data', (data) => {
            console.error(`AI Server Error: ${data}`);
        });

        // Handle server exit
        this.serverProcess.on('exit', (code, signal) => {
            console.log(`AI server exited with code ${code} and signal ${signal}`);
            this.serverProcess = null;
            
            // Remove PID file if it exists
            if (fs.existsSync(this.pidFilePath)) {
                fs.unlinkSync(this.pidFilePath);
            }
        });
        
        // Log successful start
        console.log(`AI server started with PID: ${this.serverProcess.pid}`);
    }

    /**
     * Stop the AI server gracefully
     */
    stopServer() {
        if (this.serverProcess) {
            console.log('Stopping AI server...');
            
            // Try graceful shutdown first
            this.serverProcess.kill('SIGTERM');
            
            // Remove PID file
            if (fs.existsSync(this.pidFilePath)) {
                fs.unlinkSync(this.pidFilePath);
            }
            
            this.serverProcess = null;
        } else {
            // Check if there's a leftover server process
            this.stopOrphanedServer();
        }
    }

    /**
     * Forcefully stop the server if it doesn't respond to graceful shutdown
     */
    forceStopServer() {
        if (this.serverProcess) {
            console.log('Force stopping AI server...');
            this.serverProcess.kill('SIGKILL');
            this.serverProcess = null;
        }
        
        // Check for orphaned process as well
        this.stopOrphanedServer();
    }
    
    /**
     * Check if server is already running based on PID file
     */
    isServerRunning() {
        if (this.serverProcess) {
            return true;
        }
        
        // Check if PID file exists
        if (fs.existsSync(this.pidFilePath)) {
            try {
                const pid = parseInt(fs.readFileSync(this.pidFilePath, 'utf8'));
                
                // Check if process with this PID exists
                // This is platform-specific
                try {
                    // For Windows
                    if (process.platform === 'win32') {
                        const { execSync } = require('child_process');
                        execSync(`tasklist /FI "PID eq ${pid}" /NH`);
                        // If we get here, the process exists
                        return true;
                    } 
                    // For Unix-like systems
                    else {
                        process.kill(pid, 0);
                        // If we get here, the process exists
                        return true;
                    }
                } catch (e) {
                    // Process doesn't exist, remove stale PID file
                    fs.unlinkSync(this.pidFilePath);
                    return false;
                }
            } catch (e) {
                // Invalid PID file
                fs.unlinkSync(this.pidFilePath);
                return false;
            }
        }
        
        return false;
    }
    
    /**
     * Stop an orphaned server process
     */
    stopOrphanedServer() {
        if (fs.existsSync(this.pidFilePath)) {
            try {
                const pid = parseInt(fs.readFileSync(this.pidFilePath, 'utf8'));
                
                // Try to kill the process
                console.log(`Stopping orphaned AI server process (PID: ${pid})...`);
                
                try {
                    // For Windows
                    if (process.platform === 'win32') {
                        const { execSync } = require('child_process');
                        execSync(`taskkill /PID ${pid} /F`);
                    } 
                    // For Unix-like systems
                    else {
                        process.kill(pid, 'SIGKILL');
                    }
                    console.log('Orphaned AI server stopped successfully');
                } catch (e) {
                    console.error('Failed to stop orphaned AI server:', e.message);
                }
                
                // Remove the PID file regardless
                fs.unlinkSync(this.pidFilePath);
            } catch (e) {
                // Invalid PID file
                fs.unlinkSync(this.pidFilePath);
            }
        }
    }
    
    /**
     * Setup shutdown handlers
     */
    setupShutdownHandlers() {
        // Handle normal app termination
        process.on('exit', () => {
            this.stopServer();
        });
        
        // Handle Ctrl+C
        process.on('SIGINT', () => {
            this.stopServer();
            process.exit(0);
        });
        
        // Handle kill signals
        process.on('SIGTERM', () => {
            this.stopServer();
            process.exit(0);
        });
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('Uncaught exception:', err);
            this.stopServer();
            process.exit(1);
        });
    }
}

module.exports = new AIServerManager();
