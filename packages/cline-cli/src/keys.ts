import keytar from 'keytar';
import os from 'os';

const SERVICE = 'cline';

/**
 * Get API key for a provider, checking environment variables first
 * @param provider Provider name (e.g., 'openai', 'anthropic')
 * @returns API key if found, undefined otherwise
 */
export async function getKey(provider: string): Promise<string | undefined> {
  const env = process.env[keyEnvVar(provider)];
  if (env) return env;
  
  try {
    const result = await keytar.getPassword(SERVICE, `${provider}:${os.userInfo().username}`);
    return result || undefined;
  } catch (error) {
    console.error(`Error retrieving key for ${provider}:`, error);
    return undefined;
  }
}

/**
 * Store API key for a provider in the system keychain
 * @param provider Provider name
 * @param value API key value
 */
export async function setKey(provider: string, value: string): Promise<void> {
  try {
    await keytar.setPassword(SERVICE, `${provider}:${os.userInfo().username}`, value);
  } catch (error) {
    console.error(`Error storing key for ${provider}:`, error);
    throw error;
  }
}

/**
 * Generate environment variable name for a provider
 * @param provider Provider name
 * @returns Environment variable name (e.g., 'OPENAI_API_KEY')
 */
function keyEnvVar(provider: string): string {
  return `${provider.toUpperCase()}_API_KEY`;
}