# Scroll Behavior: Messages + Tongue

## The problem

The agent messaging lane has two variable-height regions stacked vertically:

1. **Messages** — grows as conversation continues, scrollable
2. **Tongue** (plan checklist, elicitation, prompt input) — grows and shrinks as the agent works

When the tongue expands (e.g. a plan appears), the messages area must shrink. When it collapses, the messages area grows back. Naive implementations cause the scroll position to jump — the user loses sight of the latest messages, or content visibly lurches.

## How other apps handle this

Every major AI chat UI (ChatGPT, Cursor, Copilot Chat, Claude web) uses the same core layout: a flex column where the messages area has `flex: 1` and the input area has its natural height. The messages area shrinks when the input grows. None use an overlay approach.

The scroll-jump problem is solved with a **stick-to-bottom** pattern:

- Track whether the user is scrolled to the bottom (within a small threshold)
- When the container resizes, if the user *was* at the bottom, snap back to bottom
- If the user had scrolled up to read history, leave their position alone

VS Code's Copilot Chat had multiple bugs from doing this asynchronously — the fix was making the height recalculation and scroll adjustment happen in the same frame.

## Our implementation

### Layout (`App.tsx`)

```
┌─────────────────────────┐
│  Messages               │  flex: 1; min-height: 0; overflow-y: auto
│  (scrollable)           │
│                         │
├─────────────────────────┤
│  Tongue + Prompt        │  flex-shrink: 0; max-height: 50vh
│  (natural height)       │
└─────────────────────────┘
```

Both live inside a single bordered container so they read as one unified panel.

### Stick-to-bottom (`useStickToBottom.ts`)

A small hook that:

1. Listens to `scroll` events on the messages container to track `isAtBottom`
2. Uses `ResizeObserver` on both the container (which shrinks when tongue grows) and its children (which grow when messages are added)
3. On any resize, if `isAtBottom` was true, scrolls to the bottom

This means:
- When the tongue expands, messages shrink but the latest message stays visible
- When the tongue collapses, messages grow and the bottom stays in view
- If the user scrolled up to read history, none of this interferes

### Max-height cap on tongue

The tongue area is capped at `50vh` with its own `overflow-y: auto`. This prevents a large plan or elicitation from consuming the entire lane and leaving no room for messages. If the tongue content exceeds the cap, it scrolls internally.

## Why not overlay?

An overlay approach (tongue floats over messages) would avoid the resize problem entirely, but creates worse UX:

- Messages behind the overlay are unreadable
- The user can't see how much content is hidden
- It breaks the spatial metaphor of a conversation flowing downward into an input

The shrink + stick-to-bottom approach preserves the conversation flow while keeping the latest context visible.
