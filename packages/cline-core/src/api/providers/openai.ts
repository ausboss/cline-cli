import OpenAI from 'openai';
import { ApiConfiguration, ApiHandler, ApiStreamChunk, ApiStreamMessage } from '../../shared/api.js';

export class OpenAiHandler implements ApiHandler {
  private client: OpenAI;
  private modelId: string;
  private temperature: number;
  private maxTokens?: number;
  
  constructor(config: ApiConfiguration) {
    if (!config.openAiApiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.client = new OpenAI({
      apiKey: config.openAiApiKey,
      baseURL: config.openAiBaseUrl
    });
    
    this.modelId = config.openAiModelId || 'gpt-4o-mini';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens;
  }
  
  async *createMessage(systemPrompt: string, messages: ApiStreamMessage[]): AsyncGenerator<ApiStreamChunk, void, unknown> {
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];
    
    const stream = await this.client.chat.completions.create({
      model: this.modelId,
      messages: formattedMessages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream: true
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield { content };
      }
    }
    
    yield { done: true };
  }
}