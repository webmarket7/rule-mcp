import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const DESIGN_GUIDE = `# Email Theme Design Guide

You generate production-ready email themes from vague user intent.

Your job is to infer a coherent visual direction, choose accessible colors and typography, and produce a theme that feels intentionally designed for real email communication.

Do not merely translate adjectives into colors.
Do not produce generic “nice-looking” palettes.
Design the theme around brand personality, email purpose, readability, CTA effectiveness, and email-client reliability.

The theme supports:
- Four semantic color slots
- One shared font family for all text styles
- Text, heading, and button label colors
- Optional social links
- Optional logo image

Do not invent URLs.
Only include logoUrl or socialLinks when the user provided actual URLs.

---

## 1. Design Mission

A good email theme must be:

### Readable
The email must be easy to read in real inboxes. Body text readability is more important than visual novelty.

### Action-oriented
The primary color is primarily a CTA button color. It must attract attention and maintain strong contrast with button text.

### Brand-coherent
The colors should feel like a unified brand system. Avoid unrelated decorative color choices.

### Email-safe
Emails render in inconsistent clients. Prefer robust color contrast, conservative typography, and system fonts unless a web font is clearly justified.

### Restrained
Most strong email themes use:
- one clear action color
- one calm reading surface
- one outer framing color
- one soft supporting tint

Avoid noisy multi-accent palettes.

### Purpose-aware
A theme for a transactional email should usually feel calmer and more trustworthy than a theme for a promotional campaign, even for the same brand.

---

## 2. Supported Theme Model

### Color Slots

| Slot | Parameter | Meaning |
|---|---|---|
| body | bodyColor | Main content/section background; the reading surface |
| primary | primaryColor | CTA button fill and strongest action color |
| secondary | secondaryColor | Soft accent or highlighted section background |
| background | backgroundColor | Outer email canvas around the body |

### Typography Parameters

| Parameter | Meaning |
|---|---|
| fontFamily | One font used for all text slots |
| fontFamilyUrl | Required only for web fonts |
| fallbackFontFamily | Generic CSS fallback |
| textColor | Paragraph/body copy color |
| headingColor | H1-H4 color |
| buttonTextColor | CTA label color |

Important limitation:
The tool applies one font family to all text slots. Therefore, choose a versatile font that works for body text, headings, and buttons.

Do not design font pairings like “Playfair headings + Inter body” unless the tool supports separate fonts in the future.

---

## 3. Interpret the User Request

Before choosing colors, infer the following.

### Brand Personality

Who does the sender feel like?

Examples:
- trustworthy
- premium
- friendly
- technical
- playful
- calm
- bold
- editorial
- institutional
- natural
- energetic
- minimalist

### Email Purpose

What kind of email is this likely for?

Examples:
- transactional
- newsletter
- promotional campaign
- onboarding
- abandoned cart
- booking confirmation
- product update
- event invitation
- receipt/invoice
- educational content
- announcement

If the user does not specify purpose, assume a general-purpose marketing/transactional theme and avoid extreme styling.

### Audience

Who will read this?

Examples:
- shoppers
- executives
- developers
- patients
- students
- creators
- community members
- enterprise customers

### Risk Level

Estimate how expressive the theme should be:

- Low risk: finance, legal, healthcare, enterprise, transactional
- Medium risk: SaaS, education, nonprofit, hospitality
- High expression allowed: fashion, entertainment, creators, ecommerce campaigns, events

The higher the risk sensitivity, the more restrained the palette should be.

---

## 4. Decision Workflow

Follow this sequence exactly.

### Step 1 — Choose a design direction

Use the archetypes below as reference patterns, not as a fixed list.

Choose either:
- one dominant archetype,
- one dominant archetype with one secondary influence,
- or a custom direction if the user's request does not fit the recipes.

The purpose of the archetype is to guide taste, risk level, palette relationships, and typography — not to restrict creativity.

Avoid blending too many unrelated moods. Most strong themes have one clear dominant direction.

### Step 2 — Choose the reading surface

Pick bodyColor first.

The bodyColor determines the reading experience:
- light body = safest and most versatile
- warm off-white body = more human/premium
- dark body = dramatic but riskier
- colored body = only when very subtle

### Step 3 — Choose the frame

Pick backgroundColor second.

The background should support the body, not compete with it:
- for light themes, background is usually slightly darker or more tinted than body
- for dark themes, background is usually darker than body
- for premium themes, background may be warmer and softer
- for technical themes, background may be cooler

### Step 4 — Choose the action color

Pick primaryColor third.

The primary color is the CTA color. It must:
- stand out from bodyColor and secondaryColor
- fit the brand personality
- work with buttonTextColor at accessible contrast
- not be too pale unless button text is dark

### Step 5 — Choose the supporting tint

Pick secondaryColor fourth.

The secondary color is a supporting section background, not another CTA.

It should usually be:
- a light tint of primaryColor
- a warm/cool neutral related to the palette
- a low-saturation brand wash

It should not fight for attention with primaryColor.

### Step 6 — Choose text colors

Pick:
- textColor for comfortable long-form reading
- headingColor for stronger hierarchy
- buttonTextColor for CTA contrast

For light themes:
- textColor should usually be near-black, not pure black
- headingColor can be darker than textColor

For dark themes:
- textColor should be near-white or light gray
- headingColor can be white
- avoid muted gray text that looks elegant but reads poorly

### Step 7 — Choose typography

Pick a single versatile font.

Default to system fonts unless:
- the user explicitly requests a custom/web font
- the brand clearly benefits from a more distinctive web font
- a valid font CSS URL can be confidently provided

Because one font is used everywhere, prefer readable, multi-purpose fonts.

---

## 5. Accessibility Rules

### Required Contrast

- textColor on bodyColor must be at least WCAG AA and should preferably be around 7:1.
- headingColor on bodyColor must be at least 4.5:1.
- buttonTextColor on primaryColor must be at least 4.5:1.

### Practical Contrast Rules

White button text usually fails on:
- yellow
- lime
- pale cyan
- pale orange
- light pink
- pastel green
- very light blue

If primaryColor is light, use:
- buttonTextColor: #111827

If primaryColor is dark or saturated, use:
- buttonTextColor: #FFFFFF

Avoid:
- light gray body text on white
- muted gray text on dark backgrounds
- saturated backgrounds behind long body text
- relying on subtle color differences for hierarchy

### Safe Text Colors

On light body:
- #111827
- #1F2937
- #243041
- #2B2B2B

On dark body:
- #F8FAFC
- #F1F5F9
- #E5E7EB
- #CBD5E1 only if contrast is sufficient

Safe button text:
- #FFFFFF
- #111827

---

## 6. Email-Specific Design Rules

Email is not a website.

Design for:
- inconsistent rendering across email clients
- possible font fallback
- reduced support for advanced visual styling
- users scanning quickly
- CTA visibility
- readability under imperfect display conditions

Therefore:
- prefer clear contrast over subtle elegance
- avoid fragile pastel-on-pastel combinations
- avoid overly delicate color hierarchies
- avoid using very thin visual distinctions
- do not rely on web fonts for the theme to make sense
- make the CTA color obvious even if fonts or images fail

Dark themes:
Use dark themes only when clearly requested or strongly implied. Dark email themes can look premium, but they are less universally safe than light themes.

---

## 7. Handling Brand Colors

If the user provides one color:
- Treat it as primaryColor only if it works as a CTA.
- If it is too light, use it as secondaryColor or background influence instead.
- If it is too saturated or harsh, derive a more mature shade for primaryColor.
- If it is black, decide whether it means luxury/minimal or simply text/brand identity.
- If it is red, be careful: red can signal error, urgency, danger, sale, or passion depending on context.

If the user provides multiple colors:
- Choose the most CTA-suitable color as primaryColor.
- Use the softer/lighter color as secondaryColor.
- Use neutrals for body/background.
- Do not use all brand colors equally.

If the user says “use my brand colors” but provides no actual colors:
- Do not invent brand-specific colors.
- Generate a reasonable theme from the style description if available.
- If no style description exists, use a safe professional default.

---

## 8. Typography Rules

### Default System Font Strategy

Use system fonts by default.

Recommended defaults:
- Helvetica for modern professional themes
- Arial for maximum compatibility
- Verdana for accessibility/readability
- Georgia for editorial, premium, thoughtful, or classic brands
- TrebuchetMS for friendly informal brands
- Tahoma for compact professional themes

Use rarely:
- TimesNewRoman: only for formal, academic, legal, or intentionally traditional style
- CourierNew: only for technical, developer, code, or retro style
- BrushScriptMT: almost never; only if explicitly requested

### Web Font Strategy

Use web fonts only when justified.

Good choices:
- Inter: modern SaaS, product, startup
- Lato: warm professional, readable
- Open Sans: safe, accessible, neutral
- Source Sans 3: clean and readable
- DM Sans: modern and slightly soft
- Montserrat: bold, campaign-like
- Poppins: friendly consumer brand
- Merriweather: readable editorial serif

Be careful:
- Playfair Display can be elegant, but because the tool uses one font everywhere, it may be too decorative for body text and buttons.
- Very decorative fonts should not be used globally.

If using a web font:
- provide fontFamily
- provide fontFamilyUrl
- provide fallbackFontFamily
- ensure fontFamilyUrl returns CSS with @font-face declarations
- ensure the @font-face font-family exactly matches fontFamily
- prefer the Google Fonts CSS endpoint format: https://fonts.googleapis.com/css?family=<Font+Name>
- if the font name contains spaces, encode spaces as +, for example: https://fonts.googleapis.com/css?family=Open+Sans
- if this cannot be guaranteed, do not use a web font

### Web Font URL Requirements

If you decide to use a custom/web font, fontFamilyUrl must be a direct CSS URL that returns CSS containing @font-face definitions.

Preferred Google Fonts URL format:

https://fonts.googleapis.com/css?family=Lato

The URL must return CSS similar to:

@font-face {
  font-family: 'Lato';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/lato/...) format('woff2');
}

Critical requirements:
- The URL must return a CSS file, not an HTML page.
- The CSS must contain one or more @font-face declarations.
- The font-family value inside the returned CSS must exactly match the fontFamily parameter.
- If fontFamily is "Lato", the returned CSS must contain font-family: 'Lato';.
- Do not provide Google Fonts browsing/specimen URLs such as https://fonts.google.com/specimen/Lato.
- Do not provide arbitrary font website URLs.
- Do not provide a URL unless you are confident it returns valid CSS with matching @font-face declarations.
- If you are not confident, use a system font instead.

Correct:

{
  "fontFamily": "Lato",
  "fontFamilyUrl": "https://fonts.googleapis.com/css?family=Lato",
  "fallbackFontFamily": "sans-serif"
}

Correct for a font with spaces:

{
  "fontFamily": "Open Sans",
  "fontFamilyUrl": "https://fonts.googleapis.com/css?family=Open+Sans",
  "fallbackFontFamily": "sans-serif"
}

Incorrect:

{
  "fontFamily": "Lato",
  "fontFamilyUrl": "https://fonts.google.com/specimen/Lato",
  "fallbackFontFamily": "sans-serif"
}

Incorrect:

{
  "fontFamily": "Lato",
  "fontFamilyUrl": "https://fonts.googleapis.com/css?family=Open+Sans",
  "fallbackFontFamily": "sans-serif"
}

The second incorrect example breaks because the requested CSS defines font-family: 'Open Sans';, but the theme says fontFamily: "Lato".

---

## 9. Archetype Recipes

These archetypes are starting points, not a fixed catalog.

Use them to anchor design reasoning, but do not limit yourself to these exact palettes or categories. If the user's request suggests a more specific or hybrid direction, create a custom theme using the same principles:
- readable body
- clear CTA
- coherent background hierarchy
- accessible contrast
- appropriate typography
- email-safe rendering

Do not blindly copy recipe colors.

Adapt recipes to:
- the user's brand color
- the industry
- the email purpose
- the desired mood
- accessibility requirements

When using an archetype, treat it as a reference model:
- color relationships are more important than exact hex values
- mood and contrast are more important than matching the recipe literally
- the final theme should feel custom to the user's request

### Corporate Trust

Use for:
B2B, finance, legal, operations, consulting, enterprise, serious SaaS.

Design goal:
Reliable, clear, stable, not flashy.

Palette:
- bodyColor: #FFFFFF
- backgroundColor: #F3F4F6 or #EEF2F7
- primaryColor: #1D4ED8, #174EA6, #0F4C81, or a mature brand blue
- secondaryColor: #EAF1FB or #EEF2F7
- textColor: #1F2937
- headingColor: #111827
- buttonTextColor: #FFFFFF

Font:
Helvetica, Arial, Verdana, Inter.

Avoid:
- neon colors
- playful orange/pink
- overly dark cinematic styling

---

### Modern SaaS

Use for:
Product companies, onboarding, product updates, dashboards, software tools.

Design goal:
Crisp, modern, focused.

Palette:
- bodyColor: #FFFFFF
- backgroundColor: #F5F7FB
- primaryColor: #4F46E5, #2563EB, #5B5CE2, or #635BFF
- secondaryColor: #EEF2FF or #E8ECFF
- textColor: #1F2937
- headingColor: #111827
- buttonTextColor: #FFFFFF

Font:
Helvetica, Inter, DM Sans, Arial.

Avoid:
- defaulting to purple for every modern request
- cold sterile palettes with no brand personality

---

### Calm Healthcare

Use for:
Healthcare, wellness, clinics, patient communication, therapy, medical services.

Design goal:
Safe, calm, clean, reassuring.

Palette:
- bodyColor: #FFFFFF
- backgroundColor: #F0F7FF or #F4FAF8
- primaryColor: #087EA4, #0077B6, #0F766E, or #2563EB
- secondaryColor: #E6F4F1 or #E6F2FF
- textColor: #243041
- headingColor: #102A43
- buttonTextColor: #FFFFFF

Font:
Verdana, Arial, Helvetica, Open Sans.

Avoid:
- aggressive red
- black luxury styling
- playful colors
- low-contrast pale blue text

---

### Editorial Luxury

Use for:
Premium retail, fashion, boutique hotels, fine dining, luxury services.

Design goal:
Refined, quiet, confident.

Palette:
- bodyColor: #FAF8F5 or #FFFCF7
- backgroundColor: #EFEAE3 or #F2EDE7
- primaryColor: #2C1810, #1F2937, #4A1D1F, or #5C4033
- secondaryColor: #EDE6DC or #EFE8DD
- textColor: #2B211D
- headingColor: #1A120F
- buttonTextColor: #FFFFFF

Font:
Georgia, Garamond, Helvetica.

Avoid:
- bright gold as large backgrounds
- fake luxury using pure black plus gold everywhere
- decorative scripts

---

### Warm Boutique

Use for:
Handmade goods, coffee, hospitality, lifestyle, local brands.

Design goal:
Human, warm, crafted.

Palette:
- bodyColor: #FFF9F1 or #FDF8F2
- backgroundColor: #F4EBDD or #F5EFE6
- primaryColor: #B45309, #C0522A, #A54E2B, or #9A3412
- secondaryColor: #F0E2CE or #F6E7D2
- textColor: #3B2F2A
- headingColor: #241A16
- buttonTextColor: #FFFFFF

Font:
TrebuchetMS, Georgia, Helvetica, Lato.

Avoid:
- muddy low-contrast browns
- too much beige with no CTA strength

---

### Playful Ecommerce

Use for:
Consumer campaigns, lifestyle products, seasonal promos, youth brands.

Design goal:
Energetic, friendly, conversion-oriented.

Palette:
- bodyColor: #FFFBF0 or #FFFFFF
- backgroundColor: #FFF1E6 or #FDF2F8
- primaryColor: #E85D04, #DB2777, #7C3AED, or #F97316
- secondaryColor: #FFE4CC, #FCE7F3, or #EDE9FE
- textColor: #2B2B2B
- headingColor: #111827
- buttonTextColor: #FFFFFF

Font:
TrebuchetMS, Poppins, Montserrat, Arial.

Avoid:
- childish palettes unless explicitly requested
- multiple saturated colors competing with the CTA
- inaccessible pastel CTAs

---

### Dark Premium

Use for:
Premium tech, gaming, nightlife, cinematic brands, luxury events.

Design goal:
Dramatic, high-contrast, polished.

Palette:
- bodyColor: #171923, #111827, or #16161D
- backgroundColor: #0B0F19 or #0F0F1A
- primaryColor: #8B5CF6, #00A3FF, #22C55E, #F59E0B, or #E11D48
- secondaryColor: #242838 or #1F2937
- textColor: #E5E7EB
- headingColor: #FFFFFF
- buttonTextColor: #FFFFFF or #111827 depending on primaryColor

Font:
Helvetica, Inter, Montserrat, Arial.

Avoid:
- pure black body unless requested
- gray-on-black low contrast
- too many neon accents

---

### Minimal Neutral

Use for:
Simple transactional emails, professional newsletters, clean brands.

Design goal:
Quiet, precise, timeless.

Palette:
- bodyColor: #FFFFFF
- backgroundColor: #F4F4F5
- primaryColor: #18181B or #2563EB
- secondaryColor: #F1F1F2
- textColor: #27272A
- headingColor: #09090B
- buttonTextColor: #FFFFFF

Font:
Helvetica, Arial, Inter.

Avoid:
- making the theme so neutral that the CTA disappears
- overly cold gray palettes

---

### Developer / Technical

Use for:
API tools, dev platforms, engineering newsletters, infrastructure, technical products.

Design goal:
Structured, credible, sharp.

Palette:
- bodyColor: #FFFFFF or #0F172A
- backgroundColor: #F1F5F9 or #020617
- primaryColor: #2563EB, #7C3AED, #0891B2, or #16A34A
- secondaryColor: #E2E8F0 or #1E293B
- textColor: #1E293B or #CBD5E1
- headingColor: #0F172A or #F8FAFC
- buttonTextColor: #FFFFFF

Font:
Helvetica, Arial, CourierNew only when explicitly code-like or retro.

Avoid:
- using monospace for everything unless intentionally technical/retro
- Matrix-green clichés unless requested

---

### Eco / Natural

Use for:
Sustainability, organic products, outdoor, wellness, ethical brands.

Design goal:
Grounded, calm, natural.

Palette:
- bodyColor: #FBFAF3 or #F8F7EF
- backgroundColor: #ECE8DA or #EEF1E6
- primaryColor: #2F6B3F, #3F6212, #52734D, or #166534
- secondaryColor: #E4E8D8 or #DDE7D2
- textColor: #2F3529
- headingColor: #1F2A1D
- buttonTextColor: #FFFFFF

Font:
Georgia, TrebuchetMS, Helvetica, Lato.

Avoid:
- neon green
- weak low-contrast sage CTAs
- fake eco styling that feels generic

---

### Event / Festival

Use for:
Concerts, conferences, launches, webinars, festivals, community events.

Design goal:
Memorable, energetic, clear.

Palette:
- bodyColor: #FFFFFF, #FFFBF0, or #111827
- backgroundColor: #F3F4F6, #FFF1E6, or #070A13
- primaryColor: #D97706, #7C3AED, #DC2626, #2563EB, or #E11D48
- secondaryColor: #FEF3C7, #EDE9FE, #FEE2E2, or #DBEAFE
- textColor: #1F2937 or #E5E7EB
- headingColor: #111827 or #FFFFFF
- buttonTextColor: #FFFFFF

Font:
Montserrat, Helvetica, Arial, Poppins.

Avoid:
- sacrificing readability for excitement
- too many bright colors at once

---

### Creator / Personal Brand

Use for:
Influencers, educators, coaches, writers, independent creators.

Design goal:
Personal, approachable, memorable.

Palette:
- bodyColor: #FFFFFF or #FFFCF7
- backgroundColor: #F7F2EA, #F3F4F6, or #FFF1E6
- primaryColor: #7C3AED, #DB2777, #C2410C, #2563EB, or a personal brand color
- secondaryColor: #F3E8FF, #FCE7F3, #FFEDD5, or #DBEAFE
- textColor: #2B2B2B
- headingColor: #111827
- buttonTextColor: #FFFFFF

Font:
TrebuchetMS, Georgia, Helvetica, Poppins, Lato.

Avoid:
- making it look like generic SaaS
- overusing playful colors when the creator is educational/professional

---

## 10. Handling Vague Inputs

If user says “professional”:
Choose Corporate Trust or Minimal Neutral.

If user says “modern”:
Choose Modern SaaS unless industry suggests otherwise.

If user says “premium”:
Choose Editorial Luxury for light elegance or Dark Premium for dramatic elegance.

If user says “friendly”:
Choose Warm Boutique or Creator / Personal Brand.

If user says “fun” or “playful”:
Choose Playful Ecommerce, but keep CTA contrast strong.

If user says “clean”:
Choose Minimal Neutral.

If user says “bold”:
Use a stronger primaryColor, but keep body/background restrained.

If user says “dark”:
Choose Dark Premium and check contrast carefully.

If user gives only a color:
Build a complete palette around that color.

If user gives conflicting words:
Resolve conflict based on industry risk.

Examples:
- “playful banking” → Corporate Trust with a softer friendly accent
- “luxury healthcare” → Calm Healthcare with refined neutral warmth
- “corporate but bold” → Corporate Trust with stronger primaryColor
- “minimal but fun” → Minimal Neutral with one warm expressive CTA

---

## 11. Anti-Patterns

Avoid these common bad outcomes.

### Generic SaaS Purple
Do not use violet/indigo for every modern request. It becomes generic quickly.

### Cheap Luxury
Do not rely on black + gold everywhere. Use warm neutrals, restrained dark tones, and subtle contrast.

### Childish Playful
Playful does not mean random bright colors. Keep one main CTA color and one soft tint.

### Inaccessible Pastel
Pastel CTAs with white text are usually bad. Use pastel as secondaryColor, not primaryColor.

### Dead Corporate
Corporate does not mean gray and lifeless. Use a confident primaryColor and clear hierarchy.

### Over-Dark Premium
Dark themes need strong readability. Do not use low-contrast gray text for elegance.

### Fake Eco
Eco themes should use grounded natural greens and warm neutrals, not neon green.

### Decorative Font Trap
Do not choose a font that works only for headings when the tool applies it everywhere.

### Invalid Web Font URL
Do not provide a fontFamilyUrl that returns an HTML page, a font specimen page, or CSS for a different font family.

---

## 12. Quality Gates

Before calling generate-email-theme, verify:

1. Is bodyColor a comfortable reading surface?
2. Is backgroundColor clearly a frame, not a competing surface?
3. Does primaryColor work as a CTA button?
4. Does buttonTextColor contrast with primaryColor?
5. Does textColor contrast with bodyColor?
6. Does headingColor create hierarchy without hurting readability?
7. Is secondaryColor soft and supportive?
8. Does the font work for paragraphs, headings, and buttons?
9. If using a web font, does fontFamilyUrl return CSS with @font-face declarations?
10. If using a web font, does the CSS @font-face font-family exactly match fontFamily?
11. Is the palette coherent rather than decorative?
12. Is the theme appropriate for the inferred industry and email purpose?
13. Did you avoid unsupported font pairing?
14. Did you avoid inventing URLs?
15. Would this look credible in a real customer email?

If any answer is no, revise before calling the tool.

---

## 13. Output Behavior

When calling generate-email-theme:
- Provide all four color parameters when inferring a complete design.
- Provide textColor, headingColor, and buttonTextColor.
- Provide fontFamily and fallbackFontFamily.
- Provide fontFamilyUrl only for real web fonts.
- Include logoUrl only if provided.
- Include socialLinks only if provided.

Prefer complete, deliberate themes over minimal patches.

When responding to the user after generation, briefly explain the design rationale:
- chosen design direction
- color hierarchy
- typography choice
- accessibility/readability consideration

Keep the explanation concise and practical.
`;

export function registerEmailThemeDesignGuideResource(server: McpServer): void {
  server.registerResource(
    'email-theme-design-guide',
    'email-theme://design-guide',
    {
      mimeType: 'text/markdown',
      description: 'Detailed design guidance for email theme generation: color semantics, typography, font choices, style recipes, and WCAG contrast rules',
    },
    async () => ({
      contents: [{
        uri: 'email-theme://design-guide',
        mimeType: 'text/markdown',
        text: DESIGN_GUIDE,
      }],
    })
  );
}
