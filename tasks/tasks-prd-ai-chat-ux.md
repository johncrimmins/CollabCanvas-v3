# Task List: AI Chat UX Improvements

## Relevant Files

- `src/features/ai-agent/components/AIChat.tsx` - Main chat component, replace input with textarea, add state handling
- `src/features/ai-agent/components/AIMessageBubble.tsx` - Message display improvements, spacing, copy button
- `src/features/ai-agent/components/AICommandInput.tsx` - CREATE: New component for auto-expanding textarea
- `src/features/ai-agent/components/TypingIndicator.tsx` - CREATE: Animated dots for processing state
- `src/features/ai-agent/components/ErrorMessage.tsx` - CREATE: Error display with retry button
- `src/features/ai-agent/lib/aiAgentStore.ts` - Add clearMessages action
- `src/features/ai-agent/hooks/useAIAgent.ts` - Ensure error states are exposed

### Notes

- Focus on UX improvements, no AI logic changes
- Primarily React component updates and styling
- Add keyboard shortcuts and accessibility features
- Test with screen readers for WCAG compliance

## Tasks

- [ ] 1.0 Replace Input with Auto-Expanding Textarea
  - [ ] 1.1 Open `src/features/ai-agent/components/AIChat.tsx`
  - [ ] 1.2 Replace `<input type="text">` with `<textarea>`
  - [ ] 1.3 Set default `rows={2}` for 2-line height
  - [ ] 1.4 Add `useRef` for textarea element
  - [ ] 1.5 Remove manual resize with CSS: `resize: none`
  - [ ] 1.6 Set min-height: 60px, max-height: 200px in Tailwind classes

- [ ] 2.0 Implement Auto-Resize Logic
  - [ ] 2.1 Create `useEffect` that runs when input value changes
  - [ ] 2.2 Reset textarea height to 'auto'
  - [ ] 2.3 Calculate new height: `Math.min(Math.max(scrollHeight, 60), 200)`
  - [ ] 2.4 Apply calculated height to textarea
  - [ ] 2.5 Test auto-expansion with varying content lengths
  - [ ] 2.6 Verify scrollable behavior when content exceeds 8 lines

- [ ] 3.0 Implement Keyboard Shortcuts
  - [ ] 3.1 Add `handleKeyDown` function to textarea
  - [ ] 3.2 Detect Enter key (without Shift) → Call handleSend()
  - [ ] 3.3 Detect Shift+Enter → Allow default (new line)
  - [ ] 3.4 Detect Escape key → Clear input
  - [ ] 3.5 Prevent default on Enter (don't add newline when sending)
  - [ ] 3.6 Test all keyboard shortcuts work correctly

- [ ] 4.0 Add Visual State Indicators
  - [ ] 4.1 Create CSS classes for idle, typing, processing, error, success states
  - [ ] 4.2 Idle: Light grey border (#e5e7eb)
  - [ ] 4.3 Typing/Focus: Blue border (#3b82f6) with ring
  - [ ] 4.4 Processing: Grey border with pulsing animation
  - [ ] 4.5 Error: Red border (#ef4444)
  - [ ] 4.6 Success: Brief green flash (#10b981) on send
  - [ ] 4.7 Apply state classes dynamically using `cn()` utility

- [ ] 5.0 Improve Message Display
  - [ ] 5.1 Open `src/features/ai-agent/components/AIMessageBubble.tsx`
  - [ ] 5.2 Increase gap between messages to 16px (was 8px)
  - [ ] 5.3 Add background colors: user messages light blue (#dbeafe), AI messages light grey (#f3f4f6)
  - [ ] 5.4 Increase padding: 12px 16px (better readability)
  - [ ] 5.5 Add border-radius: 8px for rounded corners
  - [ ] 5.6 Add timestamp display (relative time: "2 min ago") on hover
  - [ ] 5.7 Add copy button for AI messages (icon + onClick handler)

- [ ] 6.0 Create TypingIndicator Component
  - [ ] 6.1 Create `src/features/ai-agent/components/TypingIndicator.tsx`
  - [ ] 6.2 Implement three animated dots with staggered delays
  - [ ] 6.3 Use Tailwind `animate-bounce` with custom delays
  - [ ] 6.4 Style: Light grey background, rounded container
  - [ ] 6.5 Add to message list when isProcessing === true

- [ ] 7.0 Create ErrorMessage Component
  - [ ] 7.1 Create `src/features/ai-agent/components/ErrorMessage.tsx`
  - [ ] 7.2 Accept props: error object, onRetry callback
  - [ ] 7.3 Display user-friendly error message
  - [ ] 7.4 Add Retry button that calls onRetry
  - [ ] 7.5 Style with red theme, clear action button
  - [ ] 7.6 Integrate into AIChat component

- [ ] 8.0 Add Clear Conversation Button
  - [ ] 8.1 Add header section to AIChat component
  - [ ] 8.2 Add "Clear" button with trash icon in top-right
  - [ ] 8.3 Implement `clearMessages` action in aiAgentStore
  - [ ] 8.4 Add confirmation dialog: "Are you sure? This will clear your chat history."
  - [ ] 8.5 Connect button to clearMessages action
  - [ ] 8.6 Test clearing messages resets to empty state

- [ ] 9.0 Implement Auto-Scroll to Latest Message
  - [ ] 9.1 Create ref for messages container end: `messagesEndRef`
  - [ ] 9.2 Add `useEffect` that runs when messages array changes
  - [ ] 9.3 Call `scrollIntoView({ behavior: 'smooth' })` on messagesEndRef
  - [ ] 9.4 Add scroll anchor div at end of messages list
  - [ ] 9.5 Test auto-scroll works when new messages arrive

- [ ] 10.0 Add Accessibility Features
  - [ ] 10.1 Add `role="log"` and `aria-live="polite"` to messages container
  - [ ] 10.2 Add `aria-label="AI command input"` to textarea
  - [ ] 10.3 Add `aria-describedby="input-hint"` to textarea
  - [ ] 10.4 Add hidden hint div with keyboard shortcut instructions
  - [ ] 10.5 Add `aria-invalid={!!error}` to textarea when error state
  - [ ] 10.6 Ensure focus returns to textarea after sending message
  - [ ] 10.7 Test keyboard navigation throughout entire chat

- [ ] 11.0 Enhance Loading and Processing States
  - [ ] 11.1 Add "AI is thinking..." text when isProcessing
  - [ ] 11.2 Replace Send button with spinner during processing
  - [ ] 11.3 Disable textarea during processing
  - [ ] 11.4 Add hint text: "Press Enter to send, Shift+Enter for new line"
  - [ ] 11.5 Update hint when processing: "AI is thinking..."

- [ ] 12.0 Testing and Validation
  - [ ] 12.1 Test: Default height is 2 lines (60px)
  - [ ] 12.2 Test: Expands when typing beyond 2 lines
  - [ ] 12.3 Test: Max height 8 lines, then scrollable
  - [ ] 12.4 Test: Enter sends, Shift+Enter adds line
  - [ ] 12.5 Test: Esc clears input
  - [ ] 12.6 Test: All visual states render correctly
  - [ ] 12.7 Test: Message spacing is 16px
  - [ ] 12.8 Test: User/AI message backgrounds correct
  - [ ] 12.9 Test: Copy button works on AI messages
  - [ ] 12.10 Test: Clear button removes all messages
  - [ ] 12.11 Test: Auto-scroll to latest message
  - [ ] 12.12 Test: Keyboard navigation (tab through all elements)
  - [ ] 12.13 Test: Screen reader announces new messages
  - [ ] 12.14 Test: Color contrast meets WCAG AA standards
  - [ ] 12.15 Test: Works on different screen sizes (desktop, laptop)

