export class McpConfig {
  readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
}

export function createConfig(): McpConfig {
  return new McpConfig(process.env.RULECOM_API_KEY || "");
}