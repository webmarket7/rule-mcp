import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const GENERATION_GUIDE = `# Email RCML Generation Guide

You generate RcmlDocument JSON objects for Rule.io's email editor.

Your job is to produce structurally valid, well-laid-out email templates from a description,
then pass them through the \`generate-email-rcml-doc\` tool which applies the theme and
validates the result. Iterate on validation errors until the document is clean, then call
\`create-email-template\` to publish it.

Do NOT add color or font-family attributes to elements. Leave all theme styling to the tool
— \`applyTheme\` sets body background, section colors, text/heading/button typography, and
social link colors automatically. Only add explicit style overrides when a specific element
genuinely needs to deviate from the theme (e.g. a hero section background image).

Do NOT invent URLs. Only add \`src\` / \`href\` attributes when the user provides actual URLs.

---

## 1. RcmlDocument JSON Format

Every document is a plain JSON object. The top-level shape:

\`\`\`json
{
  "tagName": "rcml",
  "children": [
    { "tagName": "rc-head", "children": [] },
    {
      "tagName": "rc-body",
      "children": [ ...sections... ]
    }
  ]
}
\`\`\`

The optional \`id\` field on any node can be omitted — the editor assigns IDs.

---

## 2. Document Structure (Hierarchy)

\`\`\`
rcml
├── rc-head              (metadata — children: rc-preview, rc-plain-text, rc-brand-style, rc-class, rc-attributes)
└── rc-body
    ├── rc-section       (row — contains 1–20 rc-column children)
    ├── rc-wrapper       (shared background around sections)
    ├── rc-loop          (iterates sections over a data source)
    └── rc-switch        (conditional sections)
        └── rc-case
            └── rc-section

rc-section
└── rc-column (1–20 columns)
    ├── rc-text
    ├── rc-heading
    ├── rc-button
    ├── rc-image
    ├── rc-logo
    ├── rc-video
    ├── rc-spacer
    ├── rc-divider
    ├── rc-social
    │   └── rc-social-element (one per network)
    ├── rc-group
    │   └── rc-column
    └── rc-raw
\`\`\`

**Rules:**
- \`rcml\` must have exactly 2 children: \`rc-head\` then \`rc-body\` (in that order).
- \`rc-body\` children must be \`rc-section\`, \`rc-wrapper\`, \`rc-loop\`, or \`rc-switch\`.
- \`rc-section\` children must all be \`rc-column\`. Maximum 20 columns.
- \`rc-column\` holds content elements. It cannot contain another \`rc-section\`.
- \`rc-switch\` children must all be \`rc-case\`. Each \`rc-case\` holds exactly one \`rc-section\`.
- \`rc-loop\` children must all be \`rc-section\`.
- \`rc-social\` children must all be \`rc-social-element\`.

---

## 3. Element Reference

### rc-head
Container for document metadata. Always include even if empty (\`"children": []\`).

### rc-preview
Preheader text shown next to the subject line in inbox lists.

### rc-plain-text
Plain-text fallback body for mail clients that don't render HTML.

### rc-body
The email content root. Attributes applied by \`applyTheme\` — omit \`attributes\` unless
you need to explicitly override the body background or width.

Key attributes (all optional):
| Attribute          | Format  | Default  | Notes                       |
|--------------------|---------|----------|-----------------------------|
| \`background-color\` | color   | —        | Outer canvas background     |
| \`width\`            | px      | \`600px\`  | Email max-width             |

### rc-section
A row container. Must contain at least one \`rc-column\`.

Key attributes (all optional):
| Attribute          | Format              | Default      | Notes                        |
|--------------------|---------------------|--------------|------------------------------|
| \`background-color\` | color               | —            | Section background           |
| \`background-url\`   | url                 | —            | Background image             |
| \`background-repeat\`| \`repeat\`/\`no-repeat\`| \`repeat\`     |                              |
| \`background-size\`  | e.g. \`cover\`        | \`auto\`       |                              |
| \`padding\`          | padding (CSS 4-val) | \`20px 0\`     | Section outer spacing        |
| \`text-align\`       | left/center/right/justify | \`center\` |                           |
| \`full-width\`       | \`full-width\`/\`false\` | —           | Stretch to viewport width    |
| \`hide\`             | \`desktop\`/\`mobile\` | —            | Responsive visibility        |
| \`border\`           | border shorthand    | \`none\`       |                              |
| \`border-radius\`    | radius              | —            |                              |
| \`direction\`        | \`ltr\`/\`rtl\`         | \`ltr\`        |                              |

### rc-wrapper
Groups sections under a shared background/padding. Use to visually frame a block of sections.

Accepts same attributes as \`rc-section\` except \`text-align\`, \`hide\`, \`direction\`.
Children must be \`rc-section\` or \`rc-switch\`.

### rc-column
A horizontal unit inside a section. Stacks its children vertically.

Key attributes (all optional):
| Attribute           | Format          | Default | Notes                       |
|---------------------|-----------------|---------|------------------------------|
| \`width\`             | px or %         | —       | Column width (auto if omitted) |
| \`padding\`           | padding         | —       | Inner spacing                |
| \`vertical-align\`    | top/middle/bottom | \`top\`| Column vertical alignment    |
| \`background-color\`  | color           | —       | Column background            |
| \`border\`            | border shorthand| —       |                              |
| \`border-radius\`     | radius          | —       |                              |
| \`inner-background-color\` | color      | —       | Inner cell background        |

### rc-text
Body text with ProseMirror content (see section 4).

Key attributes (all optional):
| Attribute         | Format      | Default      | Notes                        |
|-------------------|-------------|--------------|------------------------------|
| \`align\`           | left/center/right/justify | \`left\` |                    |
| \`color\`           | color       | —            | Text color (theme sets this) |
| \`font-family\`     | font string | —            | Font (theme sets this)       |
| \`font-size\`       | px          | —            |                              |
| \`font-weight\`     | 100–900     | —            |                              |
| \`font-style\`      | normal/italic/oblique | —  |                              |
| \`line-height\`     | px or %     | —            |                              |
| \`padding\`         | padding     | \`0 0 20px 0\` |                              |
| \`text-decoration\` | none/underline/overline/line-through | — | |
| \`text-transform\`  | capitalize/uppercase/lowercase | — |     |
| \`rc-class\`        | string      | —            | Reference a named rc-class   |

### rc-heading
Heading text with ProseMirror content. Same attributes as \`rc-text\` plus \`background-color\`.

### rc-button
Clickable button with ProseMirror label content.

Key attributes (all optional):
| Attribute            | Format      | Default      | Notes                         |
|----------------------|-------------|--------------|-------------------------------|
| \`href\`               | url         | —            | Click destination             |
| \`background-color\`   | color       | —            | Button fill (theme sets this) |
| \`color\`              | color       | —            | Label color (theme sets this) |
| \`align\`              | left/center/right | \`center\` |                             |
| \`border-radius\`      | radius      | \`8px\`        |                               |
| \`inner-padding\`      | padding     | \`10px 16px\`  | Space inside button           |
| \`padding\`            | padding     | \`0 0 20px 0\` | Space outside button          |
| \`font-size\`          | px          | —            |                               |
| \`font-weight\`        | 100–900     | —            |                               |
| \`width\`              | px or %     | —            |                               |
| \`target\`             | _blank/_self | —           |                               |

### rc-image
Responsive image. Provide \`src\` only if the user gave a URL.

Key attributes:
| Attribute      | Format   | Default   | Notes                      |
|----------------|----------|-----------|----------------------------|
| \`src\`          | url      | —         | Image URL (required for rendering) |
| \`alt\`          | string   | \`""\`      | Accessibility text         |
| \`width\`        | px       | —         | Image display width        |
| \`align\`        | left/center/right | \`center\` |                 |
| \`href\`         | url      | —         | Click-through link         |
| \`padding\`      | padding  | \`0 0 20px\`|                            |
| \`fluid-on-mobile\` | true/false | —     | Full-width on mobile       |
| \`border-radius\`| radius   | —         |                            |

### rc-logo
Brand logo image. If a brand style is set up, the logo URL comes from the brand.
Omit \`src\` to inherit from brand style; provide it only when the user gives a URL.

Same attributes as \`rc-image\` plus \`rc-class\`.

### rc-video
Video thumbnail with a play-button overlay.

Key attributes:
| Attribute    | Format | Notes                              |
|--------------|--------|------------------------------------|
| \`src\`        | url    | Thumbnail image URL                |
| \`button-url\` | url    | Link when play button is clicked   |
| \`alt\`        | string | Alt text                           |
| \`width\`      | px     | Display width                      |

### rc-spacer
Vertical whitespace between elements.
\`\`\`json
{ "tagName": "rc-spacer", "attributes": { "height": "32px" } }
\`\`\`

Key attributes: \`height\` (px, default \`32px\`), \`padding\`.

### rc-divider
Horizontal rule.
\`\`\`json
{ "tagName": "rc-divider", "attributes": { "border-color": "#e0e0e0", "border-width": "1px" } }
\`\`\`

Key attributes: \`border-color\` (color, default \`#000000\`), \`border-style\` (default \`solid\`),
\`border-width\` (px, default \`1px\`), \`width\` (px or %, default \`100%\`).

### rc-social
Social icon link row. Contains \`rc-social-element\` children.

Key attributes: \`mode\` (\`horizontal\`/\`vertical\`, default \`horizontal\`), \`align\` (default \`center\`),
\`icon-size\` (px or %, default \`20px\`).

### rc-social-element
A single social-network icon link. Place inside \`rc-social\`.

Key attributes:
| Attribute    | Notes                                              |
|--------------|----------------------------------------------------|
| \`name\`       | Network identifier: \`email\`, \`facebook\`, \`groupme\`, \`instagram\`, \`itunes\`, \`kik\`, \`linkedin\`, \`messenger\`, \`periscope\`, \`pinterest\`, \`reddit\`, \`skype\`, \`snapchat\`, \`tiktok\`, \`web\`, \`whatsapp\`, \`x\`, \`youtube\` |
| \`href\`       | Link URL (only if user provided)                   |
| \`icon-color\` | \`brand\`/\`black\`/\`white\` (default \`brand\`)           |
| \`icon-shape\` | \`original\`/\`circle\`/\`square\` (default \`original\`)   |
| \`icon-size\`  | px or %                                            |

### rc-loop
Iterates template sections over a data source.

Required attributes: \`loop-type\` (\`news-feed\`/\`remote-content\`/\`custom-field\`/\`xml-doc\`),
\`loop-value\` (source identifier). Optional: \`loop-max-iterations\`.

### rc-switch / rc-case
Renders the first matching conditional branch.

\`rc-switch\` has no attributes. \`rc-case\` attributes:
- \`case-type\`: \`default\`, \`segment\`, \`tag\`, \`custom-field\`
- \`case-property\`: numeric ID (for segment/tag/custom-field types)
- \`case-condition\`: \`eq\` or \`ne\`
- \`case-value\`: string or number to match against

---

## 4. ProseMirror Content Format

\`rc-text\`, \`rc-heading\`, and \`rc-button\` carry a \`content\` field with ProseMirror JSON.

### Minimal structure
\`\`\`json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Your text here" }
      ]
    }
  ]
}
\`\`\`

### Block node types
| Type           | Notes                                        |
|----------------|----------------------------------------------|
| \`paragraph\`    | Standard paragraph block                     |
| \`bullet-list\`  | Unordered list; children are \`list-item\`. Requires \`attrs: { spread: false }\`. Only valid in \`rc-text\` / \`rc-heading\` (not \`rc-button\`). |
| \`ordered-list\` | Ordered list; children are \`list-item\`. Requires \`attrs: { order: 1, spread: false }\`. Only valid in \`rc-text\` / \`rc-heading\`. |
| \`list-item\`    | List entry. Requires \`attrs: { label: "", "list-type": "bullet", spread: "false" }\`. Child is a \`paragraph\`. |

### Inline node types
| Type           | Notes                                                         |
|----------------|---------------------------------------------------------------|
| \`text\`         | Plain text run — requires \`"text"\` field                     |
| \`hardBreak\`    | Line break (no fields needed)                                 |
| \`placeholder\`  | Merge field — requires \`attrs\` (see below)                   |

### Inline marks (applied to text nodes via \`"marks"\` array)
| Mark type | Attrs                                                    |
|-----------|----------------------------------------------------------|
| \`font\`   | \`font-weight\` (100–900), \`font-style\` (italic), \`text-decoration\`, \`color\` (hex), \`font-size\` (px), \`font-family\` |
| \`link\`   | \`href\` (url), \`target\` (\_blank/\_self), \`rel\`           |

### Example: bold text with a link
\`\`\`json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Shop now",
          "marks": [
            { "type": "font", "attrs": { "font-weight": "700" } },
            { "type": "link", "attrs": { "href": "https://example.com", "target": "_blank" } }
          ]
        }
      ]
    }
  ]
}
\`\`\`

### Example: unordered list
\`\`\`json
{
  "type": "doc",
  "content": [
    {
      "type": "bullet-list",
      "attrs": { "spread": false },
      "content": [
        {
          "type": "list-item",
          "attrs": { "label": "", "list-type": "bullet", "spread": "false" },
          "content": [
            { "type": "paragraph", "content": [{ "type": "text", "text": "First item" }] }
          ]
        },
        {
          "type": "list-item",
          "attrs": { "label": "", "list-type": "bullet", "spread": "false" },
          "content": [
            { "type": "paragraph", "content": [{ "type": "text", "text": "Second item" }] }
          ]
        }
      ]
    }
  ]
}
\`\`\`

### Placeholder (merge field)
\`\`\`json
{
  "type": "placeholder",
  "attrs": {
    "fieldName": "Subscriber.FirstName",
    "fieldId": 169233,
    "type": "Subscriber",
    "maxLength": null,
    "original": "[Subscriber:169233]"
  }
}
\`\`\`

Placeholder \`type\` values: \`CustomField\`, \`Subscriber\`, \`User\`, \`RemoteContent\`, \`Date\`.

### Rules
- \`content\` must be a \`{ "type": "doc", ... }\` object — never a plain string.
- Every \`text\` node must have a non-empty \`"text"\` field.
- Do not include empty \`"marks": []\` — omit the field instead.
- A \`doc\` with no content blocks is invalid; include at least one \`paragraph\`.
- Lists (\`rc-text\`/\`rc-heading\` only — not \`rc-button\`) use kebab-case types with required \`attrs\`.
  Each \`list-item\` must contain a \`paragraph\`.

---

## 5. Attribute Value Formats

| Format name     | Examples                                       |
|-----------------|------------------------------------------------|
| **color**       | \`#ffffff\`, \`#1D4ED8\`, \`#000\` (3-digit ok)    |
| **px**          | \`14px\`, \`600px\`, \`32px\`                       |
| **px or %**     | \`50%\`, \`300px\`                                 |
| **padding**     | \`20px\` (all sides), \`20px 0\` (v h), \`10px 16px 10px 16px\` |
| **border**      | \`none\`, \`1px solid #cccccc\`                    |
| **border-radius**| \`8px\`, \`4px 4px 0 0\`                          |
| **url**         | Full HTTPS URL string                          |
| **font-weight** | Quoted string: \`"400"\`, \`"700"\`, \`"900"\`       |
| **font-style**  | \`"normal"\`, \`"italic"\`, \`"oblique"\`            |
| **align**       | \`"left"\`, \`"center"\`, \`"right"\`                |
| **text-align**  | \`"left"\`, \`"center"\`, \`"right"\`, \`"justify"\`  |

---

## 6. Common Layout Patterns

### Minimal valid document
\`\`\`json
{
  "tagName": "rcml",
  "children": [
    { "tagName": "rc-head", "children": [] },
    {
      "tagName": "rc-body",
      "children": [
        {
          "tagName": "rc-section",
          "children": [
            {
              "tagName": "rc-column",
              "children": [
                {
                  "tagName": "rc-text",
                  "content": {
                    "type": "doc",
                    "content": [
                      { "type": "paragraph", "content": [{ "type": "text", "text": "Hello!" }] }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

### Header with logo (1 column)
\`\`\`json
{
  "tagName": "rc-section",
  "attributes": { "padding": "20px 0" },
  "children": [
    {
      "tagName": "rc-column",
      "children": [
        { "tagName": "rc-logo" }
      ]
    }
  ]
}
\`\`\`

### Hero: heading + text + CTA button (1 column, centered)
\`\`\`json
{
  "tagName": "rc-section",
  "attributes": { "padding": "40px 0", "text-align": "center" },
  "children": [
    {
      "tagName": "rc-column",
      "children": [
        {
          "tagName": "rc-heading",
          "attributes": { "align": "center" },
          "content": {
            "type": "doc",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "Big headline here" }] }
            ]
          }
        },
        {
          "tagName": "rc-text",
          "attributes": { "align": "center" },
          "content": {
            "type": "doc",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "Supporting description text." }] }
            ]
          }
        },
        {
          "tagName": "rc-button",
          "attributes": { "align": "center", "href": "https://example.com" },
          "content": {
            "type": "doc",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "Shop now" }] }
            ]
          }
        }
      ]
    }
  ]
}
\`\`\`

### Two-column layout (image left, text right)
\`\`\`json
{
  "tagName": "rc-section",
  "children": [
    {
      "tagName": "rc-column",
      "attributes": { "width": "50%" },
      "children": [
        { "tagName": "rc-image", "attributes": { "src": "https://example.com/img.png", "alt": "Product photo", "width": "280px" } }
      ]
    },
    {
      "tagName": "rc-column",
      "attributes": { "width": "50%", "padding": "20px", "vertical-align": "middle" },
      "children": [
        {
          "tagName": "rc-heading",
          "content": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Product name" }] }] }
        },
        {
          "tagName": "rc-text",
          "content": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Short product description." }] }] }
        }
      ]
    }
  ]
}
\`\`\`

### Footer with social icons and plain text
\`\`\`json
{
  "tagName": "rc-section",
  "attributes": { "padding": "20px 0" },
  "children": [
    {
      "tagName": "rc-column",
      "children": [
        {
          "tagName": "rc-social",
          "attributes": { "align": "center", "mode": "horizontal" },
          "children": [
            { "tagName": "rc-social-element", "attributes": { "name": "facebook", "href": "https://facebook.com/example" } },
            { "tagName": "rc-social-element", "attributes": { "name": "instagram", "href": "https://instagram.com/example" } }
          ]
        },
        {
          "tagName": "rc-text",
          "attributes": { "align": "center", "font-size": "12px" },
          "content": {
            "type": "doc",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "© 2025 Company Name · Unsubscribe" }] }
            ]
          }
        }
      ]
    }
  ]
}
\`\`\`

### rc-head
\`\`\`json
{ "tagName": "rc-head", "children": [] }
\`\`\`

---

## 7. Generation Rules

1. Always include both \`rc-head\` and \`rc-body\` as the only two children of \`rcml\`.
2. Always output valid JSON — all string values must be quoted, no trailing commas.
3. Do not add color or font-family attributes. \`applyTheme\` sets them.
4. Leave \`src\` and \`href\` attributes empty or omit them when no URL is available.
5. Every \`rc-text\`, \`rc-heading\`, and \`rc-button\` must have a \`content\` field with a valid ProseMirror doc.
6. A ProseMirror \`text\` node must have a non-empty \`"text"\` field.
7. \`rc-section\` must contain at least one \`rc-column\`.
8. Multi-column layouts use \`width\` percentages that sum to 100% (e.g. 50%/50%, 33%/33%/34%).
9. Use \`rc-logo\` (without \`src\`) for the brand logo so the theme can supply it.
10. Use \`rc-spacer\` between sections for vertical breathing room.
11. \`rc-head\` children are optional. Add \`rc-preview\` with a text \`content\` for preheader text when requested.
12. After generating, pass the JSON to \`generate-email-rcml-doc\` with \`{}\` as the theme value.
    Do NOT pass the output of \`generate-email-theme\` or \`brand-style-to-email-theme\` — the
    nested EmailTheme format causes mass validation failures. Fix any validation errors returned
    and call again until the document is valid.
`;

export function registerEmailRcmlGenerationGuideResource(server: McpServer): void {
  server.registerResource(
    'email-rcml-generation-guide',
    'email-rcml://generation-guide',
    {
      mimeType: 'text/markdown',
      description: 'Comprehensive RCML element reference, ProseMirror content format, attribute value formats, and common layout patterns for generating email RCML documents',
    },
    async () => ({
      contents: [{
        uri: 'email-rcml://generation-guide',
        mimeType: 'text/markdown',
        text: GENERATION_GUIDE,
      }],
    })
  );
}
