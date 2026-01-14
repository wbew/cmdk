# TODO

## Code Smells to Revisit

### Focus Management
- Current fix uses `requestAnimationFrame` to ensure DOM is ready before focusing
- Look into better approaches:
  - React's `useLayoutEffect` for synchronous DOM updates
  - `focus()` with `{ preventScroll: true }` options
  - Custom focus trap libraries designed for Shadow DOM
  - MutationObserver to detect when element is actually rendered

### Escape Key Handler
- Current fix adds document-level Escape listener
- This could override keyboard shortcuts on the host page
- Look into better approaches:
  - Only listen when panel is visible (current plan does this)
  - Use capture phase with conditional propagation
  - Check if focus is within the Shadow DOM before handling
  - Consider a focus trap that naturally handles Escape
