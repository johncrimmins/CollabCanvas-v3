# PRD: AI Create Styleguide

## Introduction/Overview

Enable the AI agent to create a styleguide object that provides visual guidelines for a LookBook. A styleguide is a composite object consisting of a rectangle container with three text elements inside: Theme (Header text), Guidelines (Subheading text), and Description (Paragraph text). This helps creative teams stay aligned on the aesthetic direction for their photoshoot by providing clear, visible creative constraints.

## Goals

1. Support "create styleguide" command with explicit parameters
2. Generate composite object (1 rectangle + 3 text objects)
3. Position styleguide above canvas area for easy reference
4. Use text formatting from Phase 2 (Header, Subheading, Paragraph)
5. Accept user-provided content or use intelligent defaults
6. Create grouped visual structure with professional styling
7. Maintain client-side execution pattern with multiple create actions

## User Stories

1. **As a creative director**, I want to tell the AI "create a styleguide with theme 'Minimalist Elegance'" so that my team has clear visual direction for the shoot.

2. **As a photographer**, I want to say "make a styleguide for our urban fashion shoot" so that everyone knows we're going for gritty, street-style aesthetics.

3. **As a stylist**, I want to create a styleguide with specific guidelines so that the model and photographer understand the color palette and mood I'm aiming for.

4. **As a model**, I want a styleguide visible at the top of the LookBook so that I can reference the creative direction while working on different Looks.

## Functional Requirements

### FR1: Explicit Command Pattern
AI recognizes explicit styleguide creation commands (no semantic reconciliation):
- **Supported Commands:**
  - "Create a styleguide"
  - "Make a styleguide with theme 'Modern Minimal'"
  - "Create styleguide with theme 'Vintage', guidelines 'Warm tones, soft lighting', and description 'Think 1970s fashion editorial'"
  
- **Command Format:**
  - Simple: "Create styleguide" → Uses defaults
  - With theme: "Create styleguide with theme '[text]'"
  - Full specification: "Create styleguide with theme '[text]', guidelines '[text]', and description '[text]'"

### FR2: Styleguide Structure
Generate 4 objects as a visual unit:
1. **Container Rectangle:**
   - Width: 600px
   - Height: 300px
   - Fill: Light grey (#f3f4f6)
   - Border: 2px solid dark grey (#374151)
   - Position: Top of canvas area (y = 50)

2. **Theme Text (Header):**
   - Format: Header (48px, bold) from Phase 2
   - Position: 20px from container top-left
   - Content: User-provided or "LookBook Theme"
   - Color: Black (#000000)

3. **Guidelines Text (Subheading):**
   - Format: Subheading (32px, semibold) from Phase 2
   - Position: 80px from container top
   - Content: User-provided or "Creative Guidelines"
   - Color: Dark grey (#374151)

4. **Description Text (Paragraph):**
   - Format: Paragraph (16px, normal) from Phase 2
   - Position: 140px from container top
   - Content: User-provided or "Describe the visual aesthetic and mood for this LookBook..."
   - Color: Medium grey (#6b7280)

### FR3: Content Extraction
Agent extracts content from user command:
```typescript
// Parse command: "Create styleguide with theme 'Modern Minimal', guidelines 'Clean lines, neutral palette', and description 'Focus on simplicity and negative space'"

{
  theme: "Modern Minimal",
  guidelines: "Clean lines, neutral palette",
  description: "Focus on simplicity and negative space"
}

// If not provided, use intelligent defaults based on context
```

### FR4: Positioning
Position styleguide above main canvas area:
- Default X: 100 (left-aligned with some margin)
- Default Y: 50 (above typical Look positions)
- User can specify custom position: "Create styleguide at position 200, 100"
- Ensure styleguide doesn't overlap with Look areas (positioned above)

### FR5: Multiple Create Actions
Agent generates 4 sequential create actions:
```typescript
{
  message: "I've created a styleguide with your theme and guidelines!",
  actions: [
    { 
      tool: 'canvasAction', 
      params: { 
        action: 'create', 
        shape: { 
          type: 'rectangle', 
          position: { x: 100, y: 50 },
          dimensions: { width: 600, height: 300 },
          style: { fill: '#f3f4f6' }
        }
      }
    },
    { 
      tool: 'canvasAction', 
      params: { 
        action: 'create', 
        shape: { 
          type: 'text', 
          position: { x: 120, y: 70 },
          dimensions: { width: 560, height: 60 },
          style: { 
            fill: '#000000', 
            text: 'Modern Minimal',
            fontSize: 48,  // Header format
            format: 'header'  // Phase 2 text formatting
          }
        }
      }
    },
    { 
      tool: 'canvasAction', 
      params: { 
        action: 'create', 
        shape: { 
          type: 'text', 
          position: { x: 120, y: 130 },
          dimensions: { width: 560, height: 50 },
          style: { 
            fill: '#374151', 
            text: 'Clean lines, neutral palette',
            fontSize: 32,  // Subheading format
            format: 'subheading'
          }
        }
      }
    },
    { 
      tool: 'canvasAction', 
      params: { 
        action: 'create', 
        shape: { 
          type: 'text', 
          position: { x: 120, y: 190 },
          dimensions: { width: 560, height: 100 },
          style: { 
            fill: '#6b7280', 
            text: 'Focus on simplicity and negative space. Use white space intentionally.',
            fontSize: 16,  // Paragraph format
            format: 'paragraph'
          }
        }
      }
    }
  ]
}
```

### FR6: Default Content Generation
If user doesn't provide specific content, agent generates contextual defaults:
- **Theme:** "LookBook Creative Direction"
- **Guidelines:** "Define your visual aesthetic and mood"
- **Description:** "Add specific guidelines for color, lighting, composition, and styling to keep the team aligned."

### FR7: Content Validation
Validate content length to ensure it fits:
- **Theme:** Max 50 characters
- **Guidelines:** Max 100 characters
- **Description:** Max 300 characters
- If content too long, truncate with "..." or suggest shortening

### FR8: System Prompt Enhancement
Update AI agent system prompt:
```
CREATE STYLEGUIDE:
When user says "create styleguide", generate a visual guidelines panel for their LookBook.

COMMAND FORMAT:
- "Create styleguide" → Uses defaults
- "Create styleguide with theme '[text]'" → Custom theme
- "Create styleguide with theme '[text]', guidelines '[text]', and description '[text]'" → Fully custom

STRUCTURE:
Generate 4 create actions in sequence:
1. Rectangle container (600x300, light grey #f3f4f6, at x=100, y=50)
2. Theme text (Header format, 48px, bold, content: theme or default)
3. Guidelines text (Subheading format, 32px, semibold, content: guidelines or default)
4. Description text (Paragraph format, 16px, normal, content: description or default)

POSITIONING:
- Container: x=100, y=50 (above main canvas area)
- Theme text: 20px from container top-left
- Guidelines text: 60px below theme
- Description text: 60px below guidelines

DEFAULTS:
- Theme: "LookBook Creative Direction"
- Guidelines: "Define your visual aesthetic and mood"
- Description: "Add specific guidelines for color, lighting, composition, and styling."

CONTENT EXTRACTION:
Look for quoted text after "theme", "guidelines", "description" keywords.
Example: "create styleguide with theme 'Urban Edge'" → theme = "Urban Edge"
```

## Non-Goals (Out of Scope)

- Editable styleguide (users can edit individual text objects after creation)
- Grouping styleguide objects (Phase 4 - object grouping feature)
- Styleguide templates or presets (future enhancement)
- Multiple styleguides per LookBook (users can create multiple manually)
- Styleguide persistence as a special object type (it's just 4 regular objects)
- Rich text formatting within styleguide (use separate text objects for complex layouts)

## Design Considerations

### UI/UX
- **Visual Hierarchy:** Clear distinction between Theme, Guidelines, Description
- **Professional Styling:** Neutral colors, clean typography
- **Above Canvas:** Positioned above main work area for easy reference
- **Non-Intrusive:** Doesn't overlap with Look areas (y < 400)
- **Editable:** Users can click individual text elements to edit content

### Workflow
1. User says "create styleguide with theme 'Minimalist'"
2. AI extracts theme from command (or uses default)
3. AI generates 4 create actions
4. Client executes actions sequentially
5. Styleguide appears above canvas
6. Team members see styleguide on all devices

### Visual Layout
```
┌────────────────────────────────────────────────────┐
│  Modern Minimal (Header, 48px, black)              │
│                                                     │
│  Clean lines, neutral palette (Subheading, 32px)   │
│                                                     │
│  Focus on simplicity and negative space. Use       │
│  white space intentionally. (Paragraph, 16px)      │
│                                                     │
└────────────────────────────────────────────────────┘
 600px width, 300px height, light grey background
```

## Technical Considerations

### Integration with Text Formatting (Phase 2 Dependency)

**Prerequisites:**
- Text formatting feature complete (Header, Subheading, Paragraph)
- `format` property supported in text objects
- Font sizes: Header (48px), Subheading (32px), Paragraph (16px)

**Text Object Creation:**
```typescript
// Use format property from Phase 2
{
  type: 'text',
  position: { x, y },
  style: {
    text: 'Content',
    fontSize: 48,  // Corresponds to Header format
    format: 'header',  // Phase 2 text formatting
    fill: '#000000'
  }
}
```

### LangChain/LangGraph Integration

**Current Architecture (Maintained):**
- ReAct agent with GPT-4o-mini
- `canvasAction` tool with `create` action
- Client-side execution

**Changes Required:**

1. **System Prompt Update** in `simpleAgentService.ts`:
   - Add styleguide creation pattern
   - Include positioning calculations
   - Specify default content
   - Add content extraction examples

2. **Content Parsing Logic** (in system prompt, not code):
```
CONTENT EXTRACTION PATTERN:
User: "Create styleguide with theme 'Urban Edge', guidelines 'Gritty street style', and description 'Dark tones, dramatic lighting'"

Extract:
- theme: "Urban Edge"
- guidelines: "Gritty street style"
- description: "Dark tones, dramatic lighting"

Pattern:
- Look for text between single or double quotes after keywords
- Keywords: theme, guidelines, description
- If keyword not found, use default for that field
```

3. **Multi-Action Generation:**
```typescript
// Agent generates array of 4 create actions
// System prompt teaches this pattern:

STYLEGUIDE CREATION WORKFLOW:
1. Calculate positions based on container position (default: 100, 50)
   - Container: (x, y)
   - Theme text: (x + 20, y + 20)
   - Guidelines text: (x + 20, y + 80)
   - Description text: (x + 20, y + 140)

2. Generate 4 create actions in sequence:
   - Action 1: Rectangle container
   - Action 2: Theme text (Header format)
   - Action 3: Guidelines text (Subheading format)
   - Action 4: Description text (Paragraph format)

3. Return all 4 actions in single response
```

### Client-Side Execution

**No changes needed** - existing create execution handles multiple actions:
```typescript
// In useAIAgent.ts (already implemented)
for (const action of data.actions || []) {
  if (action.tool === 'canvasAction' && action.params.action === 'create') {
    // Executes 4 create actions sequentially
    // Objects appear in order: container → theme → guidelines → description
  }
}
```

### Default Content Intelligence

**Context-Aware Defaults (in system prompt):**
```
Generate intelligent defaults based on user's previous LookBook activity:
- If user mentioned colors previously: Include color guidelines in description
- If user created many shapes: Suggest "Composition guidelines"
- General fallback: Generic creative direction text

Example defaults:
- Theme: "LookBook Creative Direction"
- Guidelines: "Visual Aesthetic & Mood"
- Description: "Define color palette, lighting style, composition principles, and overall mood for this photoshoot."
```

### Positioning Calculations

**Helper Logic (taught in system prompt):**
```
POSITIONING FORMULA:
containerX = 100 (default, user can override)
containerY = 50 (default, user can override)

themeX = containerX + 20
themeY = containerY + 20

guidelinesX = containerX + 20
guidelinesY = containerY + 80

descriptionX = containerX + 20
descriptionY = containerY + 140

All text objects have same X (left-aligned within container)
Y positions calculated for visual hierarchy with spacing
```

### AI Agent Patterns (LangChain Best Practices)

**1. Multi-Step Planning:**
- Agent plans 4-step creation sequence
- Each step is atomic (single create action)
- All steps returned in single response

**2. Content Extraction:**
- Parse quoted strings from command
- Map to structured fields (theme, guidelines, description)
- Fall back to defaults if extraction fails

**3. Template-Based Generation:**
- Styleguide has fixed structure
- Only content varies
- Positions calculated from formulas

**4. Prompt Engineering:**
- Clear examples of full and partial specifications
- Default content templates
- Position calculation formulas
- Multi-action response pattern

## Success Metrics

1. **Functionality**: Agent creates 4-object styleguide correctly
2. **Content Extraction**: Correctly parses theme, guidelines, description from command
3. **Visual Quality**: Professional appearance, clear hierarchy
4. **Positioning**: Styleguide appears above canvas, doesn't overlap Looks
5. **Consistency**: Same structure every time, only content varies

## Open Questions

None - design aligns with existing architecture and text formatting from Phase 2.

## Implementation Notes

### Implementation Order
1. Update system prompt in `simpleAgentService.ts` with styleguide pattern
2. Add content extraction examples (quoted string parsing)
3. Add positioning calculation formulas
4. Add default content templates
5. Test with default content: "create styleguide"
6. Test with theme only: "create styleguide with theme 'Modern'"
7. Test with full specification: "create styleguide with theme 'X', guidelines 'Y', description 'Z'"
8. Test positioning variations: "create styleguide at 200, 100"
9. Verify text formatting uses Phase 2 formats
10. Verify real-time sync to all users

### Files to Modify
- `src/features/ai-agent/services/simpleAgentService.ts` - Update system prompt only

### Testing Checklist
- "Create styleguide" → Uses all defaults, positioned at (100, 50)
- "Create styleguide with theme 'Urban Edge'" → Custom theme, default guidelines/description
- "Create styleguide with theme 'Minimalist', guidelines 'Clean lines', and description 'Focus on simplicity'" → All custom content
- "Create styleguide at 300, 200" → Custom position
- Verify Header format (48px bold) for theme
- Verify Subheading format (32px semibold) for guidelines
- Verify Paragraph format (16px normal) for description
- Verify container rectangle dimensions (600x300)
- Verify all 4 objects created and synced
- Verify content extraction handles quotes correctly
- Test with very long content (triggers truncation)
- Verify styleguide doesn't overlap with Look areas
- Changes sync to all users in real-time

