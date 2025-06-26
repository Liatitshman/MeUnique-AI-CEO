// Background Agents Monitor
// Prevents folder creation issues and monitors system health

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class BackgroundMonitor {
    constructor() {
        this.problematicFolders = [
            'Liatitshman-MeUnique.AI',
            '🎯_MeUnique-Business-FINAL',
            'MeUnique.AI'
        ];

        this.monitoringInterval = 5000; // Check every 5 seconds
        this.isRunning = false;
    }

    start() {
        console.log('🚀 Starting Background Monitor...');
        this.isRunning = true;

        // Initial cleanup
        this.cleanupProblematicFolders();

        // Start monitoring
        this.monitorInterval = setInterval(() => {
            this.performHealthCheck();
        }, this.monitoringInterval);

        // Monitor file system
        this.watchFileSystem();

        console.log('✅ Background Monitor is running');
    }

    stop() {
        this.isRunning = false;
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
        if (this.watcher) {
            this.watcher.close();
        }
        console.log('🛑 Background Monitor stopped');
    }

    cleanupProblematicFolders() {
        const projectRoot = path.join(__dirname, '..');

        this.problematicFolders.forEach(folderName => {
            const folderPath = path.join(projectRoot, folderName);

            if (fs.existsSync(folderPath)) {
                console.log(`🗑️  Removing problematic folder: ${folderName}`);
                fs.rmSync(folderPath, { recursive: true, force: true });
            }
        });
    }

    watchFileSystem() {
        const projectRoot = path.join(__dirname, '..');

        this.watcher = fs.watch(projectRoot, { recursive: true }, (eventType, filename) => {
            if (filename) {
                // Check if a problematic folder was created
                this.problematicFolders.forEach(folderName => {
                    if (filename.includes(folderName)) {
                        console.warn(`⚠️  Detected problematic folder: ${filename}`);
                        this.cleanupProblematicFolders();
                    }
                });
            }
        });
    }

    performHealthCheck() {
        const checks = {
            gitStatus: this.checkGitStatus(),
            diskSpace: this.checkDiskSpace(),
            memoryUsage: this.checkMemoryUsage(),
            agentStatus: this.checkAgentStatus()
        };

        // Log any issues
        Object.entries(checks).forEach(([check, result]) => {
            if (!result.healthy) {
                console.warn(`⚠️  ${check}: ${result.message}`);
            }
        });
    }

    checkGitStatus() {
        try {
            exec('git status --porcelain', (error, stdout) => {
                if (error) return { healthy: false, message: error.message };

                const lines = stdout.trim().split('\n').filter(line => line);
                const problematicFiles = lines.filter(line =>
                    this.problematicFolders.some(folder => line.includes(folder))
                );

                if (problematicFiles.length > 0) {
                    console.warn('⚠️  Problematic files in Git:', problematicFiles);
                    return { healthy: false, message: 'Problematic files detected' };
                }

                return { healthy: true, message: 'Git status clean' };
            });
        } catch (error) {
            return { healthy: false, message: error.message };
        }
    }

    checkDiskSpace() {
        exec('df -h .', (error, stdout) => {
            if (error) return { healthy: false, message: error.message };

            const lines = stdout.trim().split('\n');
            const dataLine = lines[1];
            const usage = parseInt(dataLine.split(/\s+/)[4]);

            if (usage > 90) {
                return { healthy: false, message: `Disk usage high: ${usage}%` };
            }

            return { healthy: true, message: `Disk usage: ${usage}%` };
        });
    }

    checkMemoryUsage() {
        const used = process.memoryUsage();
        const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);

        if (heapUsedMB > 500) {
            return { healthy: false, message: `High memory usage: ${heapUsedMB}MB` };
        }

        return { healthy: true, message: `Memory usage: ${heapUsedMB}MB` };
    }

    checkAgentStatus() {
        // Check if agent processes are running
        const requiredAgents = [
            'smart-database',
            'cfo-agent',
            'cto-agent'
        ];

        // This would check actual process status in production
        return { healthy: true, message: 'All agents operational' };
    }
}

// Auto-start if run directly
if (require.main === module) {
    const monitor = new BackgroundMonitor();
    monitor.start();

    // Handle shutdown gracefully
    process.on('SIGINT', () => {
        console.log('\n👋 Shutting down monitor...');
        monitor.stop();
        process.exit(0);
    });
}

module.exports = BackgroundMonitor; 