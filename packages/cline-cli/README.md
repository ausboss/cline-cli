# Cline CLI

A command-line interface for the Cline agent.

## Installation

```bash
# Install globally
npm install -g @cline/cli

# Or run directly with npx
npx @cline/cli
```

## Usage

```bash
# Start Cline with default settings
cline

# Connect to a specific MCP server
cline --server http://localhost:8080

# Enable debug mode
cline --debug

# Use a specific AI provider
cline --provider openai
cline --provider anthropic

# Use a specific model
cline --model gpt-4o

# Load API keys from a .env file
cline --env /path/to/.env
```

## API Keys

You can provide API keys in three ways:

1. **Environment variables**:
   ```
   OPENAI_API_KEY=your-key-here cline --provider openai
   ```

2. **Secure system keychain**:
   ```
   cline config set-key openai
   ```

3. **.env file** - Create a .env file with your API keys:
   ```
   # .env or ~/.cline/.env
   OPENAI_API_KEY=your-openai-key
   ANTHROPIC_API_KEY=your-anthropic-key
   ```

## Features

- Chat with Cline agent in terminal
- Connect to MCP servers for tool access
- Reuses code from the Cline VS Code extension
- Works on Windows, macOS, and Linux

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Start in development mode
npm start

# Package as a standalone executable
npm run package
```

## Configuration

The CLI looks for configuration in:
- `~/.cline/config.json` - General configuration for providers and models
- `~/.cline/mcpSettings.json` - MCP server configuration
- `~/.cline/.env` - Environment variables (alternative to system environment)
- `./.env` - Local environment variables in current directory
- Custom .env file specified with `--env` flag

You can override the configuration directory with the `CLINE_SETTINGS` environment variable.

### Sample .env File

```
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## License

Same as the main Cline project