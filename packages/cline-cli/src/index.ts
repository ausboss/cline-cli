#!/usr/bin/env node
import { program } from 'commander';
import prompts from 'prompts';
import { createStdUI } from './uiStd.js';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { createApiHandler } from './runtimeConfig.js';
import { ClineAgent } from '@cline/core';
import { setKey } from './keys.js';
import ora from 'ora';
import dotenv from 'dotenv';

async function main() {
  // 1. Parse CLI flags
  program
    .option('-s, --server <url>', 'MCP server URL')
    .option('-d, --debug', 'Enable debug mode')
    .option('-p, --provider <n>', 'API provider (openai|anthropic)')
    .option('-m, --model <id>', 'Model ID override')
    .option('-e, --env <path>', 'Path to .env file')
    .parse(process.argv);
  
  const opts = program.opts();

  // If a custom .env path is provided, load it
  if (opts.env) {
    const envPath = path.resolve(opts.env);
    if (await fs.pathExists(envPath)) {
      dotenv.config({ path: envPath });
      if (opts.debug) {
        console.log(`Loaded environment variables from ${envPath}`);
      }
    } else {
      console.warn(`Warning: Specified .env file not found at ${envPath}`);
    }
  }

  // 2. Setup settings directories
  const settingsDir = process.env['CLINE_SETTINGS'] 
    ?? path.join(os.homedir(), '.cline');

  // Ensure settings directory exists
  await fs.ensureDir(settingsDir);

  // 3. Set up UI
  const ui = createStdUI();
  ui.info('🛰️ Initializing Cline CLI...');
  
  // 4. Handle the special case for setting API keys
  if (process.argv[2] === 'config' && process.argv[3] === 'set-key') {
    const provider = process.argv[4];
    
    if (!provider) {
      ui.error('Missing provider name. Usage: cline config set-key <provider>');
      process.exit(1);
    }
    
    const { apiKey } = await prompts({
      type: 'password',
      name: 'apiKey',
      message: `Enter API key for ${provider}:`,
    });
    
    if (apiKey) {
      await setKey(provider, apiKey);
      ui.info(`${provider} API key saved.`);
    } else {
      ui.warn('No key provided. Operation cancelled.');
    }
    process.exit(0);
  }
  
  try {
    // 5. Create API handler
    const api = await createApiHandler({
      provider: opts.provider,
      model: opts.model,
      debug: opts.debug
    });
    
    // 6. Set up MCP connection if needed
    const mcpServer = opts.server ?? 'http://127.0.0.1:8080';
    if (opts.debug) {
      ui.info(`Using MCP server: ${mcpServer}`);
    }
    
    // 7. Chat loop
    const systemPrompt = "You are Cline, a helpful coding assistant.";
    let history: Array<{role: string, content: string}> = [];
    
    // Welcome message
    ui.info('\nWelcome to Cline CLI! Type "quit" to exit.\n');
    
    while (true) {
      const { input } = await prompts({ 
        type: 'text', 
        name: 'input', 
        message: '🛰️ ' 
      });
      
      if (!input || input.toLowerCase() === 'quit') break;
      
      // Add to history
      history.push({ role: 'user', content: input });
      
      // Stream response
      process.stdout.write('\n🤖 ');
      const stream = api.createMessage(systemPrompt, history);
      
      let responseContent = '';
      
      for await (const chunk of stream) {
        if (chunk.content) {
          process.stdout.write(chunk.content);
          responseContent += chunk.content;
        }
      }
      
      console.log('\n'); // Add newline after response
      
      // Add assistant response to history
      history.push({ role: 'assistant', content: responseContent });
      
      // Keep history at a reasonable size
      if (history.length > 20) {
        history = history.slice(history.length - 20);
      }
    }
  } catch (error) {
    ui.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Failed to start Cline CLI:', err);
  process.exit(1);
});