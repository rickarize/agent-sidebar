# Message Types & Guidelines

## Types

### Agent text (`type: "agent"`)
White/light text. The agent's voice — what it would say to the user in conversation. Use for:
- Announcing what it's about to do ("Uploading dataset to Phoenix.")
- Reporting outcomes ("All done. The playground is running.")
- Explanations, analysis, answers to questions

### Agent rich (`type: "agent-rich"`)
Same voice as agent text, but with embedded components (entity chips, data previews, inline code). Use when the agent's response includes structured content that benefits from interactive rendering rather than plain text.

### Meta — settled (`type: "meta"`)
Grey, smaller text. System-level narration of actions the agent took. The log, not the voice. Use for:
- Completed actions: "Read src/playground/config.ts", "Ran generate_dataset.py"
- Completed thinking: "Thought for 12 seconds" (with expandable chain-of-thought detail)
- State transitions: "User selected: 500 examples, open-ended + factual"

### Meta — pending (`type: "meta", pending: true`)
Same as settled meta, but with animated dots indicating the action is still in flight. Use for:
- In-progress thinking: "Thinking"
- In-progress operations: "Uploading dataset"

A pending meta becomes a settled meta in the next step (e.g., "Thinking" → "Thought for 12 seconds").

### Agent streaming (`type: "agent-streaming"`)
Agent text with a blinking cursor, indicating the response is still being generated. This is always the last message in a step — it represents the agent mid-sentence.

### User (`type: "user"`)
Right-aligned bubble with muted background. The user's prompt.

## When to use both agent text and meta

Some actions warrant both an announcement (agent text) and a log entry (meta). The pattern is:

1. Agent text announces the intent: "Uploading dataset to Phoenix."
2. Meta shows the action in flight: "Uploading dataset" (pending)
3. Next step: meta settles: "Uploaded dataset to Phoenix"

This happens when the action is significant enough that the user should see it called out in the conversation *and* tracked in the action log. Minor actions (reading a file, running a quick script) only need meta.

## Granularity guidelines

**Use meta for:**
- Individual tool calls (read file, run command, write file)
- Thinking steps
- Brief state changes

**Use agent text for:**
- Summarizing a batch of actions ("I've looked at the playground setup...")
- Announcing significant next steps ("Generating now.", "Uploading dataset to Phoenix.")
- Reporting final outcomes
- Anything that requires explanation or context

**Don't duplicate:** If the agent says "I read config.ts and loader.ts" in agent text, the individual "Read config.ts" / "Read loader.ts" meta lines still appear — they're complementary, not redundant. The meta is the log; the agent text is the interpretation.

## Pending vs settled

A meta line is **pending** when:
- The action hasn't completed yet (thinking, uploading, running a long command)
- It's the last or near-last item in the current step

A meta line is **settled** when:
- The action completed and we know the outcome
- It may include a duration ("Thought for 12 seconds") or result summary

Pending lines should be brief — just the verb phrase. Settled lines can include duration, file counts, or other metadata.
