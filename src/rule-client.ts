import { RuleClient } from '@rulecom/sdk';
import { McpConfig } from './config.js';


export const createRuleClient = (config: McpConfig): RuleClient => {
  return new RuleClient({ apiKey: config.apiKey });
}