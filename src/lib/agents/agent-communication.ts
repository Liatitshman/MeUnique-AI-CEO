// Agent Communication System - The Smart Loop Infrastructure

import { EventEmitter } from 'events';

// Types
interface AgentMessage {
  from: string;
  to: string | string[];
  type: 'request' | 'response' | 'notification' | 'error';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  data: any;
  context: {
    jobId?: string;
    candidateId?: string;
    stage?: 'sourcing' | 'screening' | 'outreach' | 'interview' | 'offer';
    costTracking?: {
      apiCalls?: number;
      tokensUsed?: number;
      estimatedCost?: number;
    };
  };
}

interface AgentCapability {
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  cost: 'free' | 'low' | 'medium' | 'high';
  processingTime: 'instant' | 'fast' | 'moderate' | 'slow';
}

// Agent Registry
const AGENT_REGISTRY = {
  'smart-database': {
    id: 'smart-database',
    name: 'Smart Database',
    capabilities: ['resource-mapping', 'tagging', 'keyword-analysis'],
    dependencies: [],
    cost: 'free'
  },
  'auto-recruiter': {
    id: 'auto-recruiter',
    name: 'Auto Recruiter',
    capabilities: ['source-expansion', 'web-scraping', 'cost-monitoring'],
    dependencies: ['smart-database', 'cfo'],
    cost: 'medium'
  },
  'culture-matcher': {
    id: 'culture-matcher',
    name: 'Culture Matcher',
    capabilities: ['culture-analysis', 'personality-assessment', 'cross-reference'],
    dependencies: ['smart-database'],
    cost: 'low'
  },
  'ideal-profiler': {
    id: 'ideal-profiler',
    name: 'Ideal Profiler',
    capabilities: ['profile-building', 'requirement-synthesis', 'validation'],
    dependencies: ['smart-database', 'culture-matcher', 'auto-recruiter'],
    cost: 'low'
  },
  'profile-analyzer': {
    id: 'profile-analyzer',
    name: 'Profile Analyzer',
    capabilities: ['comparison', 'scoring', 'gap-analysis', 'recommendation'],
    dependencies: ['ideal-profiler'],
    cost: 'medium'
  },
  'message-crafter': {
    id: 'message-crafter',
    name: 'Message Crafter',
    capabilities: ['personalization', 'a-b-testing', 'tone-adjustment', 'translation'],
    dependencies: ['profile-analyzer', 'culture-matcher'],
    cost: 'low'
  },
  'talent-sourcer': {
    id: 'talent-sourcer',
    name: 'Talent Sourcer',
    capabilities: ['linkedin-search', 'github-search', 'multi-platform-search'],
    dependencies: ['smart-database', 'auto-recruiter'],
    cost: 'high'
  },
  // Management agents
  'ceo': {
    id: 'ceo',
    name: 'CEO Agent',
    capabilities: ['orchestration', 'decision-making', 'conflict-resolution'],
    dependencies: ['*'], // Can communicate with all
    cost: 'free'
  },
  'cfo': {
    id: 'cfo',
    name: 'CFO Agent',
    capabilities: ['cost-tracking', 'budget-management', 'roi-analysis'],
    dependencies: ['*'],
    cost: 'free'
  },
  'cto': {
    id: 'cto',
    name: 'CTO Agent',
    capabilities: ['tech-validation', 'integration-management', 'performance-monitoring'],
    dependencies: ['*'],
    cost: 'free'
  },
  'cmo': {
    id: 'cmo',
    name: 'CMO Agent',
    capabilities: ['branding', 'content-strategy', 'market-analysis'],
    dependencies: ['*'],
    cost: 'free'
  }
};

// Main Communication Bus
export class AgentCommunicationBus extends EventEmitter {
  private messageQueue: AgentMessage[] = [];
  private costTracker: Map<string, number> = new Map();
  private performanceMetrics: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeAgents();
  }

  private initializeAgents() {
    // Set up listeners for each agent
    Object.keys(AGENT_REGISTRY).forEach(agentId => {
      this.on(`${agentId}:request`, (message: AgentMessage) => {
        this.handleAgentRequest(message);
      });
    });

    // Special listener for help requests
    this.on('agent:help', (message: AgentMessage) => {
      this.handleAgentHelp(message);
    });
  }

  // Send message between agents
  async sendMessage(message: AgentMessage): Promise<void> {
    // Validate message
    if (!this.validateMessage(message)) {
      throw new Error('Invalid message format');
    }

    // Track costs
    this.trackCost(message);

    // Add to queue if needed
    if (message.priority === 'low') {
      this.messageQueue.push(message);
    } else {
      await this.processMessage(message);
    }
  }

  private async processMessage(message: AgentMessage): Promise<void> {
    // Log for debugging
    console.log(`[${message.from} → ${message.to}] ${message.type}:`, message.data);

    // Route message
    if (Array.isArray(message.to)) {
      // Broadcast to multiple agents
      message.to.forEach(agentId => {
        this.emit(`${agentId}:${message.type}`, message);
      });
    } else {
      // Send to single agent
      this.emit(`${message.to}:${message.type}`, message);
    }

    // Track performance
    this.trackPerformance(message);
  }

  // Smart routing based on task
  getOptimalRoute(task: string): string[] {
    const routes = {
      'new-job-posting': [
        'smart-database',
        'auto-recruiter',
        'culture-matcher',
        'ideal-profiler'
      ],
      'candidate-found': [
        'profile-analyzer',
        'culture-matcher',
        'message-crafter'
      ],
      'cost-optimization': [
        'cfo',
        'smart-database',
        'auto-recruiter'
      ],
      'technical-validation': [
        'cto',
        'profile-analyzer',
        'ideal-profiler'
      ],
      'outreach-campaign': [
        'cmo',
        'message-crafter',
        'talent-sourcer'
      ]
    };

    return routes[task] || ['ceo']; // Default to CEO for unknown tasks
  }

  // Cost tracking
  private trackCost(message: AgentMessage): void {
    const agent = AGENT_REGISTRY[message.from];
    if (!agent) return;

    const costMap = {
      'free': 0,
      'low': 0.01,
      'medium': 0.10,
      'high': 1.00
    };

    const cost = costMap[agent.cost] || 0;
    const currentCost = this.costTracker.get(message.from) || 0;
    this.costTracker.set(message.from, currentCost + cost);

    // Alert CFO if costs exceed threshold
    if (currentCost + cost > 10) {
      this.sendMessage({
        from: 'system',
        to: 'cfo',
        type: 'notification',
        priority: 'high',
        timestamp: new Date(),
        data: {
          alert: 'Cost threshold exceeded',
          agent: message.from,
          totalCost: currentCost + cost
        },
        context: {}
      });
    }
  }

  // Performance tracking
  private trackPerformance(message: AgentMessage): void {
    const metrics = this.performanceMetrics.get(message.from) || {
      messagesSent: 0,
      averageResponseTime: 0,
      errorRate: 0
    };

    metrics.messagesSent++;
    this.performanceMetrics.set(message.from, metrics);
  }

  // Agent help system
  private async handleAgentHelp(message: AgentMessage): Promise<void> {
    console.log(`🆘 Agent ${message.from} needs help:`, message.data);

    // Analyze the problem
    const problem = message.data.problem;
    const suggestions = this.generateSuggestions(problem);

    // Send help response
    await this.sendMessage({
      from: 'agent-help-system',
      to: message.from,
      type: 'response',
      priority: 'high',
      timestamp: new Date(),
      data: {
        suggestions,
        alternativeAgents: this.findAlternativeAgents(message.from),
        documentation: this.getRelevantDocs(problem)
      },
      context: message.context
    });
  }

  // Generate smart suggestions
  private generateSuggestions(problem: string): string[] {
    const suggestions = [];

    if (problem.includes('no results')) {
      suggestions.push('Try broadening search criteria');
      suggestions.push('Check if data sources are accessible');
      suggestions.push('Consider alternative search platforms');
    }

    if (problem.includes('timeout')) {
      suggestions.push('Break down the task into smaller chunks');
      suggestions.push('Check API rate limits');
      suggestions.push('Consider caching results');
    }

    if (problem.includes('cost')) {
      suggestions.push('Use free tier APIs first');
      suggestions.push('Batch requests to reduce API calls');
      suggestions.push('Check with CFO for budget approval');
    }

    return suggestions;
  }

  // Find alternative agents
  private findAlternativeAgents(agentId: string): string[] {
    const agent = AGENT_REGISTRY[agentId];
    if (!agent) return [];

    // Find agents with similar capabilities
    return Object.entries(AGENT_REGISTRY)
      .filter(([id, a]) => 
        id !== agentId && 
        a.capabilities.some(cap => agent.capabilities.includes(cap))
      )
      .map(([id]) => id);
  }

  // Get relevant documentation
  private getRelevantDocs(problem: string): string {
    // This would connect to actual documentation
    return 'See: https://docs.meunique.ai/troubleshooting';
  }

  // Validate message format
  private validateMessage(message: AgentMessage): boolean {
    return !!(
      message.from &&
      message.to &&
      message.type &&
      message.priority &&
      message.timestamp &&
      message.data
    );
  }

  // Process queued messages
  async processQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.processMessage(message);
      }
    }
  }

  // Get system stats
  getSystemStats() {
    return {
      totalCost: Array.from(this.costTracker.values()).reduce((a, b) => a + b, 0),
      costByAgent: Object.fromEntries(this.costTracker),
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      queueLength: this.messageQueue.length,
      activeAgents: Object.keys(AGENT_REGISTRY).length
    };
  }
}

// Export singleton instance
export const agentBus = new AgentCommunicationBus();

// Helper functions for common communication patterns
export const agentHelpers = {
  // Request help from the system
  requestHelp: (fromAgent: string, problem: string) => {
    agentBus.emit('agent:help', {
      from: fromAgent,
      to: 'system',
      type: 'request',
      priority: 'high',
      timestamp: new Date(),
      data: { problem },
      context: {}
    });
  },

  // Broadcast to all management agents
  notifyManagement: (fromAgent: string, notification: any) => {
    agentBus.sendMessage({
      from: fromAgent,
      to: ['ceo', 'cfo', 'cto', 'cmo'],
      type: 'notification',
      priority: 'medium',
      timestamp: new Date(),
      data: notification,
      context: {}
    });
  },

  // Cost-optimized routing
  routeWithCostOptimization: async (task: string, data: any) => {
    const route = agentBus.getOptimalRoute(task);
    
    // Check with CFO first
    await agentBus.sendMessage({
      from: 'system',
      to: 'cfo',
      type: 'request',
      priority: 'high',
      timestamp: new Date(),
      data: {
        task,
        estimatedCost: route.length * 0.10,
        route
      },
      context: {}
    });

    // Then execute the route
    for (const agentId of route) {
      await agentBus.sendMessage({
        from: 'system',
        to: agentId,
        type: 'request',
        priority: 'medium',
        timestamp: new Date(),
        data,
        context: { stage: 'sourcing' }
      });
    }
  }
}; 