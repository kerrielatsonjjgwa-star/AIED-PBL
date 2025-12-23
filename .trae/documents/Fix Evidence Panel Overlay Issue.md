I will modify the `EvidencePanel` component to display the evidence details in a floating overlay that sits on top of the City News Feed, rather than trying to fit it inside the small panel.

**Plan:**
1.  **Modify `src/components/EvidencePanel.tsx`**:
    *   Add `relative` positioning to the main container.
    *   Update the evidence detail view (the part that shows when a file is clicked) to use `absolute` positioning.
    *   Position it to appear directly below the Evidence Panel list, effectively covering the City News Feed area (`top-full`, `z-50`).
    *   Add a "Close" (X) button to the detail view so users can easily dismiss it.
    *   Style the overlay with a white background, shadow, and appropriate dimensions to maximize readability.

This ensures that when you view an evidence file, it pops out and uses the space currently occupied by the News Feed, preventing the "blocking" issue and giving you more space to read the content.