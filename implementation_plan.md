# Add Negative Prompt & Adjust Layout

## Goal
Add a new "Negative Prompt" textarea below the main video description prompt, update the UI spacing to improve visual hierarchy, and integrate the negative prompt into the image generation API call. Ensure the new field works for both English and Arabic languages and that the layout remains clean and premium.

## User Review Required
- Confirm the label text for the Negative Prompt in both languages (English: "Negative Prompt", Arabic: "الموجه السلبي").
- Approve the placement of the new field (directly below the main prompt textarea).

## Proposed Changes
### HTML (`index.html`)
- Add a new `<div class="form-group">` with a `<label>` and `<textarea id="negativePrompt">` after the existing prompt textarea.
- Update the generate button container margin to add extra spacing.

### CSS (`style.css`)
- Style the new textarea similarly to other inputs.
- Add a subtle red border to indicate negative prompt purpose.
- Adjust `.form-group` margin-bottom for the generate button.

### JavaScript (`script.js`)
- Capture `negativePrompt` value on form submission.
- Append `&negative_prompt=${encodeURIComponent(negativePrompt)}` to the API request URL.
- Extend the `translations` object with labels for the new field.
- Ensure the field is cleared after generation.

## Verification Plan
- Manual test: Enter a prompt and a negative prompt, generate image, verify API receives both parameters.
- Visual test: Check UI layout on desktop and mobile (responsive adjustments).
- Ensure no console errors.
