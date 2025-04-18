import { ApiConfiguration, ApiHandler } from '../shared/api.js';
import { OpenAiHandler } from './providers/openai.js';
import { AnthropicHandler } from './providers/anthropic.js';

/**
 * Build the appropriate API handler based on the provided configuration
 * @param config API configuration
 * @returns An API handler instance
 */
export function buildApiHandler(config: ApiConfiguration): ApiHandler {
  switch (config.apiProvider.toLowerCase()) {
    case 'openai':
      return new OpenAiHandler(config);
    case 'anthropic':
      return new AnthropicHandler(config);
    default:
      throw new Error(`Unsupported API provider: ${config.apiProvider}`);
  }
}

// Re-export interfaces for convenience
export * from '../shared/api.js';