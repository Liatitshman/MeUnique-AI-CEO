#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class TerminalConnectionFix {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.agentProcesses = new Map();
        this.terminalConfig = {
            shell: process.env.SHELL || '/bin/zsh',
            cwd: this.projectRoot,
            env: { ...process.env }
        };
    }

    async initialize() {
        console.log('🔧 Initializing Terminal Connection Fix...');

        // 1. Verify we're in the correct directory
        await this.verifyProjectDirectory();

        // 2. Clean up any problematic processes
        await this.cleanupZombieProcesses();

        // 3. Test terminal connection
        await this.testTerminalConnection();

        // 4. Setup agent connections
        await this.setupAgentConnections();

        console.log('✅ Terminal connection initialized successfully');
    }

    async verifyProjectDirectory() {
        const gitDir = path.join(this.projectRoot, '.git');
        if (!fs.existsSync(gitDir)) {
            throw new Error('Not in a git repository. Please run from project root.');
        }

        console.log(`📁 Project root verified: ${this.projectRoot}`);
    }

    async cleanupZombieProcesses() {
        return new Promise((resolve) => {
            // Kill any hanging node processes
            exec('pkill -f "node.*background-agents-monitor" || true', (error) => {
                if (!error) {
                    console.log('🧹 Cleaned up zombie processes');
                }
                resolve();
            });
        });
    }

    async testTerminalConnection() {
        return new Promise((resolve, reject) => {
            const testCommand = spawn('echo', ['Terminal connection test'], this.terminalConfig);

            testCommand.stdout.on('data', (data) => {
                console.log(`✅ Terminal test output: ${data.toString().trim()}`);
            });

            testCommand.on('error', (error) => {
                console.error('❌ Terminal connection error:', error);
                reject(error);
            });

            testCommand.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Terminal connection successful');
                    resolve();
                } else {
                    reject(new Error(`Terminal test failed with code ${code}`));
                }
            });
        });
    }

    async setupAgentConnections() {
        const agents = [
            { name: 'monitor', script: 'background-agents-monitor.js' },
            { name: 'cost-tracker', script: 'cost_monitor.py' }
        ];

        for (const agent of agents) {
            await this.startAgent(agent);
        }
    }

    async startAgent(agent) {
        const scriptPath = path.join(__dirname, agent.script);

        if (!fs.existsSync(scriptPath)) {
            console.warn(`⚠️  Agent script not found: ${agent.script}`);
            return;
        }

        const isNode = agent.script.endsWith('.js');
        const command = isNode ? 'node' : 'python3';

        const agentProcess = spawn(command, [scriptPath], {
            ...this.terminalConfig,
            detached: false,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        agentProcess.stdout.on('data', (data) => {
            console.log(`[${agent.name}] ${data.toString().trim()}`);
        });

        agentProcess.stderr.on('data', (data) => {
            console.error(`[${agent.name}] ERROR: ${data.toString().trim()}`);
        });

        agentProcess.on('error', (error) => {
            console.error(`[${agent.name}] Failed to start:`, error.message);
            // Try to restart with fallback options
            this.restartWithFallback(agent);
        });

        agentProcess.on('close', (code) => {
            if (code !== 0) {
                console.warn(`[${agent.name}] Exited with code ${code}`);
            }
            this.agentProcesses.delete(agent.name);
        });

        this.agentProcesses.set(agent.name, agentProcess);
        console.log(`🚀 Started agent: ${agent.name}`);
    }

    async restartWithFallback(agent) {
        console.log(`🔄 Attempting restart with fallback for ${agent.name}...`);

        // Try with explicit shell
        const fallbackProcess = spawn(this.terminalConfig.shell, ['-c', `${agent.script}`], {
            cwd: this.projectRoot,
            stdio: 'inherit'
        });

        fallbackProcess.on('error', (error) => {
            console.error(`❌ Fallback also failed for ${agent.name}:`, error.message);
        });
    }

    async runHealthCheck() {
        console.log('\n🏥 Running health check...');

        // Check Git status
        await this.checkGitStatus();

        // Check agent processes
        this.checkAgentProcesses();

        // Check for problematic folders
        await this.checkForProblematicFolders();
    }

    async checkGitStatus() {
        return new Promise((resolve) => {
            exec('git status --porcelain', { cwd: this.projectRoot }, (error, stdout) => {
                if (error) {
                    console.error('❌ Git status check failed:', error.message);
                } else {
                    const changes = stdout.trim().split('\n').filter(line => line);
                    console.log(`📊 Git status: ${changes.length} changes`);
                }
                resolve();
            });
        });
    }

    checkAgentProcesses() {
        console.log(`🤖 Active agents: ${this.agentProcesses.size}`);
        this.agentProcesses.forEach((process, name) => {
            console.log(`  - ${name}: PID ${process.pid}`);
        });
    }

    async checkForProblematicFolders() {
        const problematicFolders = [
            'Liatitshman-MeUnique.AI',
            '🎯_MeUnique-Business-FINAL',
            'MeUnique-AI-CEO/MeUnique-AI-CEO'
        ];

        for (const folder of problematicFolders) {
            const fullPath = path.join(this.projectRoot, folder);
            if (fs.existsSync(fullPath)) {
                console.warn(`⚠️  Found problematic folder: ${folder}`);
                console.log(`🗑️  Removing ${folder}...`);
                fs.rmSync(fullPath, { recursive: true, force: true });
            }
        }
    }

    shutdown() {
        console.log('\n👋 Shutting down...');
        this.agentProcesses.forEach((process, name) => {
            console.log(`Stopping ${name}...`);
            process.kill('SIGTERM');
        });
        this.agentProcesses.clear();
    }
}

// Main execution
if (require.main === module) {
    const fix = new TerminalConnectionFix();

    fix.initialize()
        .then(() => fix.runHealthCheck())
        .then(() => {
            console.log('\n✅ All systems operational!');
            console.log('Press Ctrl+C to stop monitoring...\n');

            // Run health check every 30 seconds
            setInterval(() => fix.runHealthCheck(), 30000);
        })
        .catch((error) => {
            console.error('❌ Fatal error:', error.message);
            process.exit(1);
        });

    // Handle shutdown
    process.on('SIGINT', () => {
        fix.shutdown();
        process.exit(0);
    });
}

module.exports = TerminalConnectionFix; 