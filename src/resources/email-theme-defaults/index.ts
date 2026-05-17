import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  createEmailTheme,
  EmailThemeColorType,
  EmailThemeFontStyleType,
  EmailThemeImageType,
} from '@rulecom/sdk';

const SOCIAL_LINK_TYPES = ['facebook', 'instagram', 'linkedin', 'tiktok', 'x', 'website'] as const;

const SYSTEM_FONTS = [
  'Arial', 'Verdana', 'Helvetica', 'Tahoma', 'TrebuchetMS',
  'TimesNewRoman', 'Georgia', 'Garamond', 'CourierNew', 'BrushScriptMT',
];

export function registerEmailThemeDefaultsResource(server: McpServer): void {
  server.registerResource(
    'email-theme-defaults',
    'email-theme://defaults',
    {
      mimeType: 'application/json',
      description: 'Default EmailTheme values and all available type enums for theme generation',
    },
    async () => ({
      contents: [{
        uri: 'email-theme://defaults',
        mimeType: 'application/json',
        text: JSON.stringify({
          defaultTheme: createEmailTheme(),
          availableColorTypes: Object.values(EmailThemeColorType),
          availableFontStyleTypes: Object.values(EmailThemeFontStyleType),
          availableSocialLinkTypes: [...SOCIAL_LINK_TYPES],
          availableImageTypes: Object.values(EmailThemeImageType),
          systemFonts: SYSTEM_FONTS,
          notes: {
            colors: 'body=section background, primary=button fill, secondary=accent section background, background=outer canvas',
            fontStyles: 'p=paragraph, h1-h4=headings, label=button label text',
            images: 'Currently only "logo" is supported',
          },
        }, null, 2),
      }],
    })
  );
}
