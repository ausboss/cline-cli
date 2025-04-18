import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { UIHost } from './platformUI.js';

// Import API types and functions
import { buildApiHandler, ApiHandler, ApiConfiguration, ApiStreamMessage } from './api/index.js';

// Export API types for use by CLI
export * from './api/index.js';

// Import types later from extracted services
export interface McpServer {
  name: string;
  status: 'connecting' | 'connected' | 'disconnected';
  // Add other properties as needed
}

/**
 * Core Agent for Cline that works without VS Code dependencies
 */
export class ClineAgent {
  private uiHost: UIHost;
  private mcpServerUrl: string;
  private settingsDir: string;
  private debug: boolean;
  private apiHandler?: ApiHandler;
  
  /**
   * Bootstrap a new Cline Agent instance
   * @param options Configuration options
   * @returns A new ClineAgent instance
   */
  static async bootstrap(options: {
    mcpServer: string;
    uiHost: UIHost;
    settingsDir?: string;
    debug?: boolean;
    apiHandler?: ApiHandler;
  }): Promise<ClineAgent> {
    const agent = new ClineAgent(
      options.mcpServer,
      options.uiHost,
      options.settingsDir || path.join(os.homedir(), '.cline'),
      options.debug || false
    );
    
    if (options.apiHandler) {
      agent.apiHandler = options.apiHandler;
    }
    
    await agent.initialize();
    return agent;
  }
  
  private constructor(
    mcpServerUrl: string, 
    uiHost: UIHost, 
    settingsDir: string,
    debug: boolean
  ) {
    this.mcpServerUrl = mcpServerUrl;
    this.uiHost = uiHost;
    this.settingsDir = settingsDir;
    this.debug = debug;
  }
  
  /**
   * Initialize the agent and set up services
   */
  private async initialize(): Promise<void> {
    // Ensure settings directory exists
    await fs.ensureDir(this.settingsDir);
    
    // Initialize MCP client would go here
    if (this.debug) {
      this.uiHost.info(`Initialized with MCP server: ${this.mcpServerUrl}`);
      this.uiHost.info(`Settings directory: ${this.settingsDir}`);
    }
  }
  
  /**
   * Send a chat message to the agent
   * @param input User input message
   * @returns Agent response
   */
  async chat(input: string): Promise<{ content: string }> {
    if (!this.apiHandler) {
      if (this.debug) {
        this.uiHost.info(`No API handler available, using placeholder response`);
      }
      
      // Fall back to placeholder if no API handler is available
      return {
        content: `Cline CLI received: "${input}"\n\nThis is a placeholder response. API integration is not configured.`
      };
    }
    
    if (this.debug) {
      this.uiHost.info(`Processing input: ${input}`);
    }
    
    // With API handler, we'd normally process through the LLM here
    // This implementation is simplified compared to the full Cline extension
    try {
      // Here, we would handle the full conversation context, history, etc.
      const systemPrompt = "You are Cline, a helpful coding assistant.";
      const messages: ApiStreamMessage[] = [
        { role: 'user', content: input }
      ];
      
      let responseContent = '';
      const stream = this.apiHandler.createMessage(systemPrompt, messages);
      
      for await (const chunk of stream) {
        if (chunk.content) {
          responseContent += chunk.content;
        }
      }
      
      return { content: responseContent };
    } catch (error) {
      this.uiHost.error(`Error processing chat: ${error instanceof Error ? error.message : String(error)}`);
      return {
        content: `Error processing your request: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Set the API handler for this agent
   * @param handler The API handler to use for LLM requests
   */
  setApiHandler(handler: ApiHandler): void {
    this.apiHandler = handler;
  }
  
  /**
   * Handle updates from MCP servers
   * @param servers The updated server list
   */
  onMcpServersUpdated(servers: McpServer[]): void {
    if (this.debug) {
      this.uiHost.info(`MCP servers updated: ${servers.length} servers`);
      for (const server of servers) {
        this.uiHost.info(`- ${server.name}: ${server.status}`);
      }
    }
  }
}

// Export other important elements from the core
export { UIHost } from './platformUI.js';