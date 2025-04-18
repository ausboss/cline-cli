import chalk from 'chalk';
import { UIHost } from '@cline/core';

/**
 * Create a standard terminal UI implementation
 * Provides colored output for different message types
 */
export const createStdUI = (): UIHost => ({
  info: (msg: string) => console.log(chalk.cyanBright(msg)),
  warn: (msg: string) => console.log(chalk.yellowBright(msg)),
  error: (msg: string) => console.error(chalk.redBright(msg)),
});