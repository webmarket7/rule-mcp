import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerEmailThemeDefaultsResource } from './email-theme-defaults/index.js';
import { registerEmailThemeDesignGuideResource } from './email-theme-design-guide/index.js';
import { registerEmailRcmlGenerationGuideResource } from './email-rcml-generation-guide/index.js';

export function registerResources(server: McpServer): void {
  registerEmailThemeDefaultsResource(server);
  registerEmailThemeDesignGuideResource(server);
  registerEmailRcmlGenerationGuideResource(server);
}
