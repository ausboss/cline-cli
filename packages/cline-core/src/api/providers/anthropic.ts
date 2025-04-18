import Anthropic from '@anthropic-ai/sdk';
import { ApiConfiguration, ApiHandler, ApiStreamChunk, ApiStreamMessage } from '../../shared/api.js';

export class AnthropicHandler implements ApiHandler {
  private client: Anthropic;
  private modelId: string;
  private temperature: number;
  private maxTokens?: number;
  
  constructor(config: ApiConfiguration) {
    if (!config.anthropicApiKey) {
      throw new Error('Anthropic API key is required');
    }
    
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey,
    });
    
    this.modelId = config.anthropicModelId || 'claude-3-haiku-20240307';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 4096;
  }
  
  async *createMessage(systemPrompt: string, messages: ApiStreamMessage[]): AsyncGenerator<ApiStreamChunk, void, unknown> {
    // Convert messages to Anthropic format
    let anthropicMessages = [];
    
    for (const msg of messages) {
      anthropicMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      });
    }
    
    const stream = await this.client.messages.create({
      model: this.modelId,
      system: systemPrompt,
      messages: anthropicMessages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream: true
    });
    
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text') {
        const content = chunk.delta.text;
        if (content) {
          yield { content };
        }
      }
    }
    
    yield { done: true };
  }
}