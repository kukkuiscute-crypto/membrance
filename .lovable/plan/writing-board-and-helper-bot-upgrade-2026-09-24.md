# Writing Board and Helper Bot Upgrade

## What will change
- Repair the AI response flow so Writing Board answers stream reliably, errors are shown clearly, and retries do not duplicate work.
- Remove the separate chalkboard robot and use the existing floating Helper Bot as the board assistant.
- Give the Helper Bot a dedicated board mode: it flies beside the active equation, points with a chalk hand, reacts while thinking/writing, and returns to normal roaming afterward.
- Refresh the Writing Board layout and controls with cleaner states for ready, thinking, writing, completed, and failed requests.
- Modernize the shared AI call used by the board, Study Helper, and chat so all three understand the current response stream and stop using the outdated model path.
- Polish bot movement, expressions, thruster effects, touch dragging, screen-edge bounds, and reduced-motion behavior without adding frame-heavy effects.

## Error handling and access
- Keep AI restricted to a real signed-in account.
- Preserve the user’s question when a request fails and display the safe service error instead of a generic message.
- Handle empty responses and interrupted streams without leaving the board stuck in a loading state.

## Verification
- Check the preview for build and runtime errors.
- Test a signed-in Writing Board request from submission through the final displayed answer.
- Verify the single Helper Bot appears on the board, points during the explanation, remains draggable, and works on desktop and mobile sizes.
- Confirm Study Helper and AI chat still receive streamed answers after the shared update.
