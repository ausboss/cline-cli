/**
 * Platform UI Host Interface
 * Provides abstraction for UI interactions that were previously handled by VS Code.
 */
export interface UIHost {
  /**
   * Display an informational message
   * @param msg The message to display
   */
  info(msg: string): void;
  
  /**
   * Display a warning message
   * @param msg The message to display
   */
  warn(msg: string): void;
  
  /**
   * Display an error message
   * @param msg The message to display
   */
  error(msg: string): void;
}
