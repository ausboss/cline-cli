import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { getKey } from './keys.js';
import { buildApiHandler, ApiHandler, ApiConfiguration } from '@cline/core';
import dotenv from 'dotenv';

interface CliFlags {
  provider?: string;
  model?: string;
  debug?: boolean;
}

interface ProviderConfig {
  model?: string;
  baseUrl?: string;
  [key: string]: any;
}

/**
 * Default configuration if no config file exists
 */
const DEFAULT_CONFIG = {
  defaultProvider: 'openai',
  providers: {
    openai: {
      model: 'gpt-4o-mini'
    },
    anthropic: {
      model: 'claude-3-haiku-20240307'
    }
  }
};

/**
 * Create an API handler based on CLI flags and configuration
 */
export async function createApiHandler(cliFlags: CliFlags): Promise<ApiHandler> {
  // Load .env file if it exists (first from current directory, then from home directory)
  const localEnvPath = path.join(process.cwd(), '.env');
  const homeEnvPath = path.join(os.homedir(), '.cline', '.env');
  
  if (await fs.pathExists(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
    if (cliFlags.debug) {
      console.log(`Loaded environment variables from ${localEnvPath}`);
    }
  } else if (await fs.pathExists(homeEnvPath)) {
    dotenv.config({ path: homeEnvPath });
    if (cliFlags.debug) {
      console.log(`Loaded environment variables from ${homeEnvPath}`);
    }
  }
  
  // Ensure config directory exists
  const configDir = path.join(os.homedir(), '.cline');
  await fs.ensureDir(configDir);
  
  // Get or create config file
  const cfgPath = path.join(configDir, 'config.json');
  let config;
  
  try {
    config = await fs.readJson(cfgPath);
  } catch (error) {
    // Create default config if it doesn't exist
    config = DEFAULT_CONFIG;
    await fs.writeJson(cfgPath, config, { spaces: 2 });
  }
  
  const provider = cliFlags.provider ?? config.defaultProvider;
  const providerConfig: ProviderConfig = config.providers[provider] ?? {};
  
  if (cliFlags.debug) {
    console.log(`Using provider: ${provider}`);
    console.log(`Provider config:`, providerConfig);
  }
  
  // Get API key
  const apiKey = await getKey(provider);
  if (!apiKey) {
    throw new Error(
      `No API key found for ${provider}. Set it via environment variable ` +
      `${provider.toUpperCase()}_API_KEY or run 'cline config set-key ${provider}'`
    );
  }
  
  // Build base configuration
  const apiConfig: ApiConfiguration = { apiProvider: provider };
  
  // Add provider-specific configuration
  switch (provider) {
    case 'openai':
      Object.assign(apiConfig, {
        openAiApiKey: apiKey,
        openAiModelId: cliFlags.model ?? providerConfig.model,
        openAiBaseUrl: providerConfig.baseUrl,
      });
      break;
      
    case 'anthropic':
      Object.assign(apiConfig, {
        anthropicApiKey: apiKey,
        anthropicModelId: cliFlags.model ?? providerConfig.model,
      });
      break;
      
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
  
  return buildApiHandler(apiConfig);
}