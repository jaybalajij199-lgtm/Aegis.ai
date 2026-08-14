/**
 * AEGIS AI Architecture & Autonomous Agent System
 * Root entry point for all AI Agent, Prompt, Tool, Allocation, and Validation modules.
 */

// Agent
export * from './agent/aegisAgent';

// Prompts
export * from './prompts/systemPrompt';

// Tools
export * from './tools/emergencyTools';
export * from './tools/resourceTools';
export * from './tools/hospitalTools';
export * from './tools/shelterTools';

// Allocation Engine
export * from './allocation/allocationEngine';

// Validation
export * from './validation/allocationValidator';
