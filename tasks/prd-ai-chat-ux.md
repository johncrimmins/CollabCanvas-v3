# PRD: AI Chat UX Improvements

## Introduction/Overview

Improve the AI chat interface user experience by fixing the condensed chat input area and enhancing overall usability. The primary issue is that the text input area is too small (single line), making it difficult for users to compose longer commands or see what they're typing. This PRD focuses on expanding the input area to 2 lines by default with auto-expansion for longer inputs, plus additional UX improvements for better interaction flow.

## Goals

1. Expand chat input area from 1 line to 2 lines by default
2. Implement auto-expansion when user types more than 2 lines
3. Add visual feedback for input states (typing, processing, error)
4. Improve keyboard shortcuts and accessibility
5. Add clear button to reset conversation
6. Enhance message display with better spacing and readability
7. Maintain existing functionality while improving UX

## User Stories

1. **As a photographer**, I want to type longer AI commands without the text being cut off so that I can see my full command before sending.

2. **As a stylist**, I want the input box to grow when I type multiple lines so that I can compose detailed instructions comfortably.

3. **As a creative director**, I want clear visual feedback when the AI is processing so that I know my command was received and is being handled.

4. **As a model**, I want keyboard shortcuts like Enter to send and Shift+Enter for new line so that I can work efficiently without using the mouse.

## Functional Requirements

### FR1: Expanded Input Area
Change input from single-line to multi-line textarea:
- **Default Height:** 2 lines (approximately 60px)
- **Min Height:** 2 lines (60px minimum)
- **Max Height:** 8 lines (approximately 200px)
- **Auto-Expansion:** Grows as user types beyond 2 lines
- **Scrollable:** If content exceeds 8 lines, textarea becomes scrollable

### FR2: Auto-Expansion Behavior
Textarea expands/contracts dynamically:
```typescript
// Pseudo-code for auto-expansion
onInput = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto'; // Reset height
  const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 200);
  textarea.style.height = `${newHeight}px`;
}
```

### FR3: Keyboard Shortcuts
Support standard keyboard interactions:
- **Enter:** Send message (if Shift not held)
- **Shift+Enter:** Insert new line (don't send)
- **Cmd/Ctrl+Enter:** Send message (alternative)
- **Esc:** Clear input (if not processing)

### FR4: Visual Feedback States
Show clear visual indicators for different states:

**Idle State (Ready for input):**
- Border: Light grey (#e5e7eb)
- Placeholder: "Ask the AI to create shapes, arrange objects, or modify your LookBook..."

**Typing State:**
- Border: Blue (#3b82f6)
- Placeholder disappears
- Send button enabled (not greyed out)

**Processing State:**
- Input disabled
- Border: Grey with pulsing animation
- Send button replaced with spinner
- Message: "AI is thinking..."

**Error State:**
- Border: Red (#ef4444)
- Error message below input
- Send button re-enabled for retry

**Success State:**
- Brief green border flash (#10b981)
- Input cleared automatically
- Focus returned to input

### FR5: Message Display Improvements
Enhance message list UI:
- **Increased Spacing:** 16px between messages (currently cramped)
- **Better Contrast:** User messages in light blue background, AI messages in light grey
- **Timestamps:** Show relative time ("2 minutes ago") on hover
- **Message Actions:** Copy button for AI responses
- **Scrolling:** Auto-scroll to latest message
- **Max Height:** Message list has max height with scroll (don't push input off screen)

### FR6: Clear Conversation Button
Add button to reset chat:
- **Location:** Top-right of chat panel
- **Icon:** Trash or refresh icon
- **Action:** Clears all messages, resets to empty state
- **Confirmation:** "Are you sure? This will clear your chat history."

### FR7: Loading Indicators
Show what AI is doing:
- **Typing Indicator:** Three animated dots when AI is processing
- **Action Indicator:** "Creating shapes..." when executing actions (brief, shapes appear instantly)

### FR8: Error Handling UI
Better error messages:
- **User-Friendly:** "Sorry, I couldn't understand that. Try being more specific."
- **Actionable:** "Please select objects first, then try again."
- **Retry Button:** Allow re-sending failed command
- **Error Types:**
  - Network error: "Connection lost. Please try again."
  - AI error: "AI service error. Please try again."
  - Validation error: "Please select at least 2 objects first."

### FR9: Accessibility Improvements
Ensure chat is accessible:
- **ARIA Labels:** Proper labels for input, button, messages
- **Keyboard Navigation:** Can navigate entire chat with keyboard only
- **Screen Reader Support:** Announces new AI messages
- **Focus Management:** Focus returns to input after sending message
- **High Contrast:** Readable text with sufficient contrast ratios

### FR10: Responsive Design
Chat works on different screen sizes:
- **Desktop:** Full chat panel (300px width, full height)
- **Tablet:** Collapsible chat panel
- **Mobile:** Full-screen modal when opened (future consideration)

## Non-Goals (Out of Scope)

- Voice input (speech-to-text) - future enhancement
- Collaborative chat (users seeing each other's chats) - separate PRD
- Chat history persistence across sessions - future enhancement
- Message editing/deletion - not needed for MVP
- File attachments in chat - future enhancement
- Chat themes/customization - not needed for MVP

## Design Considerations

### UI/UX
- **Clean & Minimal:** Don't overcrowd the interface
- **Familiar Patterns:** Use standard chat UI conventions
- **Smooth Animations:** Gentle transitions for state changes
- **Non-Intrusive:** Don't block canvas work while AI processes
- **Responsive Feedback:** Immediate visual response to user actions

### Visual Layout

**Before (Current - Condensed):**
```
┌─ AI Assistant ──────────────────┐
│ Message 1                         │
│ Message 2                         │
│ Message 3                         │
│                                   │
│ [____input___] [Send]  ← 1 line  │
└───────────────────────────────────┘
```

**After (Improved - Expanded):**
```
┌─ AI Assistant ─────────── [Clear]┐
│ ┌─ Message 1 ─────────────────┐  │
│ │ User: Create a circle        │  │
│ │ 2 min ago                    │  │
│ └──────────────────────────────┘  │
│                                   │
│ ┌─ Message 2 ─────────────────┐  │
│ │ AI: I've created a red       │  │
│ │ circle for you!              │  │
│ │ Just now              [Copy] │  │
│ └──────────────────────────────┘  │
│                                   │
│ ▼ Scroll for more                │
│                                   │
│ ┌───────────────────────────────┐│
│ │ Type your command...          ││
│ │ (2 lines default,             ││ ← Auto-expands
│ │  grows as needed)             ││
│ └───────────────────────────────┘│
│ [Send] Shift+Enter for new line  │
└───────────────────────────────────┘
```

## Technical Considerations

### Component Structure

**Current Component (AIChat.tsx):**
```typescript
// Simplified current structure
export function AIChat() {
  const { messages, isProcessing, executeCommand } = useAIAgent();
  
  return (
    <div className="ai-chat">
      <div className="messages">
        {messages.map(msg => <MessageBubble msg={msg} />)}
      </div>
      <div className="input-area">
        <input type="text" />  {/* ← Currently single-line input */}
        <button>Send</button>
      </div>
    </div>
  );
}
```

**Enhanced Component:**
```typescript
export function AIChat() {
  const { messages, isProcessing, error, executeCommand, clearMessages } = useAIAgent();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 200);
    textarea.style.height = `${newHeight}px`;
  }, [input]);
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape' && !isProcessing) {
      setInput('');
    }
  };
  
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const command = input.trim();
    setInput(''); // Clear input immediately
    
    try {
      await executeCommand(command);
      // Focus returns to textarea
      textareaRef.current?.focus();
    } catch (error) {
      // Error shown in UI
    }
  };
  
  return (
    <div className="ai-chat">
      {/* Header with clear button */}
      <div className="chat-header">
        <h3>AI Assistant</h3>
        <button onClick={clearMessages} aria-label="Clear chat">
          <TrashIcon />
        </button>
      </div>
      
      {/* Message list */}
      <div className="messages" ref={messagesRef}>
        {messages.map(msg => (
          <MessageBubble 
            key={msg.id} 
            message={msg}
            onCopy={() => copyToClipboard(msg.content)}
          />
        ))}
        {isProcessing && <TypingIndicator />}
        {error && <ErrorMessage error={error} onRetry={handleSend} />}
      </div>
      
      {/* Input area */}
      <div className={cn(
        "input-area",
        isProcessing && "processing",
        error && "error"
      )}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the AI to create shapes, arrange objects..."
          disabled={isProcessing}
          rows={2}
          className="auto-resize"
          aria-label="AI command input"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isProcessing}
          aria-label="Send command"
        >
          {isProcessing ? <Spinner /> : 'Send'}
        </button>
        <div className="hint">
          {isProcessing ? 'AI is thinking...' : 'Press Enter to send, Shift+Enter for new line'}
        </div>
      </div>
    </div>
  );
}
```

### Styling (Tailwind CSS)

**Auto-Resize Textarea:**
```css
.auto-resize {
  min-height: 60px;  /* 2 lines */
  max-height: 200px;  /* 8 lines */
  resize: none;  /* Disable manual resize */
  overflow-y: auto;  /* Scroll if > max height */
  transition: border-color 0.2s ease;
}

.auto-resize:focus {
  border-color: #3b82f6;  /* Blue border when focused */
  outline: none;
  ring: 2px solid rgba(59, 130, 246, 0.2);
}

.input-area.processing .auto-resize {
  border-color: #9ca3af;  /* Grey border when processing */
  cursor: not-allowed;
}

.input-area.error .auto-resize {
  border-color: #ef4444;  /* Red border on error */
}
```

**Message Spacing:**
```css
.messages {
  display: flex;
  flex-direction: column;
  gap: 16px;  /* Increased from 8px */
  max-height: calc(100vh - 300px);  /* Don't push input off screen */
  overflow-y: auto;
  padding: 16px;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 80%;
}

.message-bubble.user {
  background: #dbeafe;  /* Light blue */
  align-self: flex-end;
}

.message-bubble.assistant {
  background: #f3f4f6;  /* Light grey */
  align-self: flex-start;
}
```

### Auto-Scroll Implementation

**Scroll to Latest Message:**
```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // Scroll to bottom when new message arrives
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

// In JSX
<div className="messages">
  {messages.map(...)}
  <div ref={messagesEndRef} />  {/* Scroll anchor */}
</div>
```

### Loading States

**Typing Indicator Component:**
```typescript
function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <span className="dot animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="dot animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="dot animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
```

### Accessibility

**ARIA Labels & Roles:**
```tsx
<div role="log" aria-live="polite" aria-atomic="false">
  {messages.map(msg => (
    <div role="article" aria-label={`${msg.role} message`}>
      {msg.content}
    </div>
  ))}
</div>

<textarea
  aria-label="AI command input"
  aria-describedby="input-hint"
  aria-invalid={!!error}
/>

<div id="input-hint" className="sr-only">
  Press Enter to send, Shift+Enter for new line
</div>
```

### Performance Considerations

**Virtualization for Long Chats (Future):**
- If chat has 100+ messages, consider react-window for virtualization
- For MVP, 50 message limit is reasonable

**Debounce Auto-Resize:**
- Auto-resize on every keypress can be expensive
- Use requestAnimationFrame for smooth resizing

## Success Metrics

1. **Usability:** Users can compose 2+ line commands without scrolling
2. **Expansion:** Textarea correctly expands/contracts with content
3. **Keyboard Shortcuts:** Enter sends, Shift+Enter adds new line (100% reliability)
4. **Visual Feedback:** Clear indication of processing/error/success states
5. **Accessibility:** Passes WCAG 2.1 AA standards

## Testing Checklist

### Input Area
- [ ] Default height is 2 lines (60px)
- [ ] Expands when typing beyond 2 lines
- [ ] Max height is 8 lines (200px)
- [ ] Scrollable when content exceeds 8 lines
- [ ] Enter key sends message
- [ ] Shift+Enter inserts new line
- [ ] Esc key clears input
- [ ] Input clears after sending message
- [ ] Focus returns to input after sending

### Visual States
- [ ] Idle: Light grey border
- [ ] Typing: Blue border
- [ ] Processing: Grey border with disabled state
- [ ] Error: Red border with error message
- [ ] Success: Brief green flash (optional)

### Message Display
- [ ] Messages spaced 16px apart
- [ ] User messages right-aligned, light blue background
- [ ] AI messages left-aligned, light grey background
- [ ] Auto-scroll to latest message
- [ ] Copy button works on AI messages
- [ ] Timestamps show on hover

### Functionality
- [ ] Clear button removes all messages
- [ ] Typing indicator shows while AI processing
- [ ] Error messages are clear and actionable
- [ ] Retry button works after error
- [ ] Chat doesn't block canvas interaction

### Accessibility
- [ ] Can navigate entire chat with keyboard
- [ ] Screen reader announces new messages
- [ ] ARIA labels present and correct
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus visible on all interactive elements

### Responsive
- [ ] Chat works on desktop (1920x1080)
- [ ] Chat works on laptop (1366x768)
- [ ] Input area doesn't overflow on small screens

## Implementation Notes

### Implementation Order
1. Replace `<input>` with `<textarea>` in AIChat.tsx
2. Add auto-resize logic with useEffect
3. Implement keyboard shortcuts (Enter, Shift+Enter, Esc)
4. Add visual state classes (idle, typing, processing, error)
5. Improve message display styling (spacing, backgrounds, alignment)
6. Add Clear button with confirmation
7. Implement typing indicator component
8. Add error message component with retry
9. Implement auto-scroll to latest message
10. Add accessibility attributes (ARIA labels, roles)
11. Test keyboard navigation
12. Test with screen reader

### Files to Modify
- `src/features/ai-agent/components/AIChat.tsx` - Main chat component
- `src/features/ai-agent/components/AIMessageBubble.tsx` - Message display component
- `src/features/ai-agent/components/AICommandInput.tsx` - Input component (may need to create)
- `src/features/ai-agent/lib/aiAgentStore.ts` - Add clearMessages action
- `src/features/ai-agent/hooks/useAIAgent.ts` - Ensure error states exposed

### New Components to Create
- `TypingIndicator.tsx` - Animated dots for processing state
- `ErrorMessage.tsx` - Error display with retry button
- `MessageTimestamp.tsx` - Relative timestamp component

### Styling Updates
- Update Tailwind classes for spacing, colors, states
- Add animations for typing indicator, state transitions
- Ensure responsive design (mobile-friendly)

## Open Questions

None - design is straightforward UX improvement.

## Acceptance Criteria

### Critical (Must Have)
- ✅ Input area is 2 lines by default
- ✅ Auto-expands up to 8 lines
- ✅ Enter sends message, Shift+Enter adds line
- ✅ Clear visual feedback for processing state
- ✅ Error messages are clear and actionable

### Important (Should Have)
- ✅ Message spacing improved (16px between messages)
- ✅ Auto-scroll to latest message
- ✅ Clear conversation button works
- ✅ Keyboard navigation works throughout
- ✅ Accessible (WCAG AA compliant)

### Nice-to-Have (Optional)
- ✅ Copy button on AI messages
- ✅ Timestamps on messages
- ✅ Smooth animations for state transitions
- ✅ Typing indicator animation

