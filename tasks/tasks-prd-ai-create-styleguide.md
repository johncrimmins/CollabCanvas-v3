# Task List: AI Create Styleguide

## Relevant Files

- `src/features/ai-agent/services/simpleAgentService.ts` - Update system prompt with styleguide creation pattern, content extraction, positioning formulas

### Notes

- Depends on Phase 2 text formatting feature (Header, Subheading, Paragraph)
- No new tools or code logic needed - purely system prompt engineering
- Uses existing create action with 4 sequential calls
- Client-side execution unchanged

## Tasks

- [ ] 1.0 Update System Prompt with Styleguide Creation Pattern
  - [ ] 1.1 Open `src/features/ai-agent/services/simpleAgentService.ts`
  - [ ] 1.2 Add "CREATE STYLEGUIDE" section to system prompt
  - [ ] 1.3 Define command formats: simple, with theme, fully custom
  - [ ] 1.4 Add command examples: "create styleguide", "create styleguide with theme 'Modern'"
  - [ ] 1.5 Document 4-object structure: container + theme + guidelines + description

- [ ] 2.0 Add Content Extraction Logic to System Prompt
  - [ ] 2.1 Add pattern for extracting quoted text after "theme", "guidelines", "description"
  - [ ] 2.2 Add example: "theme 'Urban Edge'" → theme = "Urban Edge"
  - [ ] 2.3 Add content validation: theme max 50 chars, guidelines max 100 chars, description max 300 chars
  - [ ] 2.4 Define default content if user doesn't provide specific text
  - [ ] 2.5 Add truncation logic for content that exceeds limits

- [ ] 3.0 Add Positioning Formulas to System Prompt
  - [ ] 3.1 Define container position: default (100, 50), user-configurable
  - [ ] 3.2 Define theme text position: containerX + 20, containerY + 20
  - [ ] 3.3 Define guidelines text position: containerX + 20, containerY + 80
  - [ ] 3.4 Define description text position: containerX + 20, containerY + 140
  - [ ] 3.5 Document dimensions: container 600x300, text width 560px
  - [ ] 3.6 Document spacing: 60px between text elements

- [ ] 4.0 Add Multi-Action Generation Instructions
  - [ ] 4.1 Document workflow: agent generates 4 create actions in sequence
  - [ ] 4.2 Action 1: Rectangle container (light grey #f3f4f6)
  - [ ] 4.3 Action 2: Theme text (Header format, 48px, black)
  - [ ] 4.4 Action 3: Guidelines text (Subheading format, 32px, dark grey)
  - [ ] 4.5 Action 4: Description text (Paragraph format, 16px, medium grey)
  - [ ] 4.6 Specify all 4 actions returned in single AI response

- [ ] 5.0 Add Default Content Templates
  - [ ] 5.1 Define default theme: "LookBook Creative Direction"
  - [ ] 5.2 Define default guidelines: "Define your visual aesthetic and mood"
  - [ ] 5.3 Define default description: "Add specific guidelines for color, lighting, composition, and styling."
  - [ ] 5.4 Add guidance for context-aware defaults (optional intelligence)

- [ ] 6.0 Testing and Validation
  - [ ] 6.1 Test: "Create styleguide" → Uses all defaults, positioned at (100, 50)
  - [ ] 6.2 Test: "Create styleguide with theme 'Urban Edge'" → Custom theme, defaults for rest
  - [ ] 6.3 Test: Full custom: "Create styleguide with theme 'Minimalist', guidelines 'Clean lines', and description 'Focus on simplicity'" → All custom
  - [ ] 6.4 Test: "Create styleguide at 300, 200" → Custom position
  - [ ] 6.5 Verify Header format (48px bold) for theme text
  - [ ] 6.6 Verify Subheading format (32px semibold) for guidelines text
  - [ ] 6.7 Verify Paragraph format (16px normal) for description text
  - [ ] 6.8 Verify container dimensions (600x300px)
  - [ ] 6.9 Verify all 4 objects created and synced to all users
  - [ ] 6.10 Test content extraction handles quotes correctly
  - [ ] 6.11 Test very long content triggers truncation
  - [ ] 6.12 Verify styleguide doesn't overlap Look areas

