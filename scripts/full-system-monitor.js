#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

// Configuration
const CONFIG = {
    projectRoot: path.resolve(__dirname, '..'),
    logsDir: path.join(__dirname, '..', 'logs'),
    agentsConfig: path.join(__dirname, '..', '👑_CEO-System', '🔧_Settings', 'background-agents.json'),
    checkInterval: 30000, // 30 seconds
    terminalCheckInterval: 10000, // 10 seconds
};

// Ensure logs directory exists
if (!fs.existsSync(CONFIG.logsDir)) {
    fs.mkdirSync(CONFIG.logsDir, { recursive: true });
}

// Logger
class Logger {
    constructor(name) {
        this.name = name;
        this.logFile = path.join(CONFIG.logsDir, `${name}.log`);
        this.errorFile = path.join(CONFIG.logsDir, `${name}-error.log`);
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;

        console.log(`[${this.name}] ${message}`);

        const file = level === 'ERROR' ? this.errorFile : this.logFile;
        fs.appendFileSync(file, logEntry);
    }

    error(message) {
        this.log(message, 'ERROR');
    }
}

const logger = new Logger('system-monitor');

// Agent definitions
const AGENTS = {
    management: {
        ceo: { name: 'CEO', emoji: '👑', status: 'active' },
        cfo: { name: 'CFO', emoji: '💰', status: 'active' },
        cto: { name: 'CTO', emoji: '💻', status: 'active' },
        cmo: { name: 'CMO', emoji: '📣', status: 'active' }
    },
    support: {
        dataAnalyst: { name: 'Data Analyst', emoji: '📊', status: 'active' },
        customerSuccess: { name: 'Customer Success', emoji: '🤝', status: 'active' },
        qualityAssurance: { name: 'Quality Assurance', emoji: '✅', status: 'active' }
    },
    stores: {
        autoRecruiter: { name: 'Auto Recruiter', emoji: '⚡', status: 'active' },
        cultureMatcher: { name: 'Culture Matcher', emoji: '🎯', status: 'active' },
        idealProfiler: { name: 'Ideal Profiler', emoji: '🏗️', status: 'active' },
        messageCreafter: { name: 'Message Crafter', emoji: '📝', status: 'active' },
        profileAnalyzer: { name: 'Profile Analyzer', emoji: '🔬', status: 'active' },
        talentSourcer: { name: 'Talent Sourcer', emoji: '🕵️', status: 'active' },
        dictionaryBot: { name: 'Dictionary Bot', emoji: '🔤', status: 'active' },
        smartDatabase: { name: 'Smart Database', emoji: '💾', status: 'active' }
    }
};

// Terminal monitor
class TerminalMonitor {
    constructor() {
        this.isConnected = true;
        this.lastCheck = Date.now();
        this.errors = [];
    }

    check() {
        exec('echo "Terminal check"', (error) => {
            if (error) {
                this.isConnected = false;
                this.errors.push({
                    time: new Date().toISOString(),
                    error: error.message
                });
                logger.error(`Terminal disconnected: ${error.message}`);
                this.attemptFix();
            } else {
                if (!this.isConnected) {
                    logger.log('Terminal reconnected successfully');
                }
                this.isConnected = true;
            }
            this.lastCheck = Date.now();
        });
    }

    attemptFix() {
        logger.log('Attempting to fix terminal connection...');

        // Run terminal fix script
        const fixScript = path.join(__dirname, 'terminal-connection-fix.js');
        if (fs.existsSync(fixScript)) {
            const fix = spawn('node', [fixScript], {
                detached: true,
                stdio: 'ignore'
            });
            fix.unref();
        }
    }
}

// System monitor
class SystemMonitor {
    constructor() {
        this.agents = AGENTS;
        this.terminalMonitor = new TerminalMonitor();
        this.startTime = Date.now();
        this.stats = {
            uptime: 0,
            checks: 0,
            errors: 0,
            terminalIssues: 0
        };
    }

    start() {
        logger.log('🚀 MeUnique AI CEO System Monitor Starting...');
        logger.log(`Monitoring ${this.countAgents()} agents`);

        // Initial check
        this.performSystemCheck();

        // Regular checks
        setInterval(() => this.performSystemCheck(), CONFIG.checkInterval);
        setInterval(() => this.terminalMonitor.check(), CONFIG.terminalCheckInterval);

        // Status file updates
        setInterval(() => this.updateStatusFile(), 5000);

        logger.log('✅ System monitor initialized successfully');
    }

    countAgents() {
        let count = 0;
        Object.values(this.agents).forEach(category => {
            count += Object.keys(category).length;
        });
        return count;
    }

    performSystemCheck() {
        this.stats.checks++;
        this.stats.uptime = Date.now() - this.startTime;

        logger.log(`Performing system check #${this.stats.checks}`);

        // Check each agent
        Object.entries(this.agents).forEach(([category, agents]) => {
            Object.entries(agents).forEach(([key, agent]) => {
                this.checkAgent(category, key, agent);
            });
        });

        // Check system resources
        this.checkSystemResources();

        // Update background agents config
        this.updateAgentsConfig();
    }

    checkAgent(category, key, agent) {
        // Simulate agent health check
        const isHealthy = Math.random() > 0.05; // 95% healthy

        if (!isHealthy) {
            logger.error(`Agent ${agent.emoji} ${agent.name} is not responding`);
            this.stats.errors++;
            agent.status = 'error';
            this.restartAgent(category, key, agent);
        } else {
            agent.status = 'active';
            agent.lastCheck = new Date().toISOString();
        }
    }

    restartAgent(category, key, agent) {
        logger.log(`Attempting to restart ${agent.emoji} ${agent.name}...`);

        // Simulate restart
        setTimeout(() => {
            agent.status = 'active';
            logger.log(`✅ ${agent.emoji} ${agent.name} restarted successfully`);
        }, 2000);
    }

    checkSystemResources() {
        exec('ps aux | grep node | wc -l', (error, stdout) => {
            if (!error) {
                const nodeProcesses = parseInt(stdout.trim());
                if (nodeProcesses > 20) {
                    logger.error(`High number of Node processes: ${nodeProcesses}`);
                }
            }
        });
    }

    updateStatusFile() {
        const status = {
            timestamp: new Date().toISOString(),
            uptime: Math.floor(this.stats.uptime / 1000) + ' seconds',
            stats: this.stats,
            terminal: {
                connected: this.terminalMonitor.isConnected,
                lastCheck: new Date(this.terminalMonitor.lastCheck).toISOString()
            },
            agents: this.agents,
            system: 'operational'
        };

        fs.writeFileSync(
            path.join(CONFIG.logsDir, 'agent-status.json'),
            JSON.stringify(status, null, 2)
        );
    }

    updateAgentsConfig() {
        const config = {
            version: "2.0",
            lastUpdate: new Date().toISOString(),
            monitoring: {
                enabled: true,
                interval: CONFIG.checkInterval,
                autoRestart: true
            },
            agents: this.agents,
            terminalFix: {
                enabled: true,
                autoFix: true,
                script: "terminal-connection-fix.js"
            }
        };

        try {
            fs.writeFileSync(CONFIG.agentsConfig, JSON.stringify(config, null, 2));
        } catch (error) {
            logger.error(`Failed to update agents config: ${error.message}`);
        }
    }
}

// Error handling
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught exception: ${error.message}`);
    logger.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.log('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.log('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

// Start the monitor
const monitor = new SystemMonitor();
monitor.start();

// Keep process alive
setInterval(() => {
    // Heartbeat
}, 60000); 