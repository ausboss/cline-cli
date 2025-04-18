/**
 * API Configuration Interface
 * Common configuration options across different LLM providers
 */
export interface ApiConfiguration {
  // Common properties
  apiProvider: string;  // 'openai', 'anthropic', etc.
  
  // OpenAI specific
  openAiApiKey?: string;
  openAiModelId?: string;
  openAiBaseUrl?: string;
  
  // Anthropic specific  
  anthropicApiKey?: string;
  anthropicModelId?: string;
  
  // Common options
  temperature?: number;
  maxTokens?: number;
  
  // Additional provider-specific options can be added
}

export interface ApiStreamMessage {
  role: string;
  content: string;
}

export interface ApiStreamChunk {
  content?: string;
  done?: boolean;
}

export interface ApiHandler {
  createMessage(
    systemPrompt: string, 
    messages: ApiStreamMessage[]
  ): AsyncGenerator<ApiStreamChunk, void, unknown>;
}