// cleanup.js
// Run this script at application startup to clean up any orphaned server processes

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const pidFilePath = path.join(__dirname, 'ai-server', '.server.pid');

/**
 * Clean up orphaned AI server processes
 */
function cleanupOrphanedServer() {
  console.log('Checking for orphaned AI server processes...');
  
  // Check if PID file exists
  if (fs.existsSync(pidFilePath)) {
    try {
      const pid = parseInt(fs.readFileSync(pidFilePath, 'utf8'));
      
      console.log(`Found server PID file with PID: ${pid}`);
      
      // Check and kill process based on platform
      if (process.platform === 'win32') {
        // Windows
        exec(`taskkill /PID ${pid} /F`, (error, stdout, stderr) => {
          if (error) {
            console.log(`Process with PID ${pid} not found or already terminated`);
          } else {
            console.log(`Successfully terminated orphaned server with PID ${pid}`);
          }
        });
      } else {
        // Unix-like systems
        try {
          process.kill(pid, 'SIGKILL');
          console.log(`Successfully terminated orphaned server with PID ${pid}`);
        } catch (e) {
          console.log(`Process with PID ${pid} not found or already terminated`);
        }
      }
      
      // Remove PID file regardless
      fs.unlinkSync(pidFilePath);
      console.log('Removed stale PID file');
      
    } catch (e) {
      console.error('Error parsing or handling PID file:', e.message);
      
      // Clean up invalid PID file
      try {
        fs.unlinkSync(pidFilePath);
        console.log('Removed invalid PID file');
      } catch (unlinkErr) {
        console.error('Failed to remove PID file:', unlinkErr.message);
      }
    }
  } else {
    console.log('No orphaned AI server processes found');
  }
}

// Run cleanup
cleanupOrphanedServer();

// Check for Node.js processes that might be AI servers
console.log('Checking for potential orphaned Node.js processes...');

// This approach is platform-specific
if (process.platform === 'win32') {
  // Windows: Look for node processes related to our AI server
  exec('wmic process where "name=\'node.exe\'" get commandline,processid', (error, stdout, stderr) => {
    if (error) {
      console.error('Error checking for Node processes:', error);
      return;
    }
    
    // Parse the output to find our AI server
    const lines = stdout.split('\n');
    const aiServerProcesses = lines.filter(line => line.includes('ai-server') && line.includes('index.js'));
    
    if (aiServerProcesses.length > 0) {
      console.log('Found potential orphaned AI server processes:');
      aiServerProcesses.forEach(process => {
        console.log(process);
        
        // Extract PID and kill process
        const pidMatch = process.match(/\s(\d+)\s*$/);
        if (pidMatch && pidMatch[1]) {
          const pid = pidMatch[1];
          exec(`taskkill /PID ${pid} /F`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Failed to kill process ${pid}:`, error);
            } else {
              console.log(`Successfully terminated process ${pid}`);
            }
          });
        }
      });
    } else {
      console.log('No orphaned AI server processes found');
    }
  });
} else {
  // Unix-like systems
  exec('ps aux | grep "node.*ai-server.*index.js" | grep -v grep', (error, stdout, stderr) => {
    // Ignore errors because grep will return non-zero if no matches found
    if (stdout) {
      console.log('Found potential orphaned AI server processes:');
      const lines = stdout.split('\n').filter(line => line.trim() !== '');
      
      lines.forEach(process => {
        console.log(process);
        
        // Extract PID and kill process
        const parts = process.trim().split(/\s+/);
        if (parts.length > 1) {
          const pid = parts[1];
          try {
            exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
              if (error) {
                console.error(`Failed to kill process ${pid}:`, error);
              } else {
                console.log(`Successfully terminated process ${pid}`);
              }
            });
          } catch (e) {
            console.error(`Failed to kill process ${pid}:`, e.message);
          }
        }
      });
    } else {
      console.log('No orphaned AI server processes found');
    }
  });
}
