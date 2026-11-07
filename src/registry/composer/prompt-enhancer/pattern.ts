export const pattern = `# Prompt Enhancer

## Summary
An "Enhance" button in the composer that rewrites a short or vague prompt into a more specific one, in place. The added details are highlighted so the person can see what changed, with Undo one click away. It closes the gap between what people type and what the model needs, without making them learn prompting.

## When to use
- Generative tools where detail drives quality — image, video, design, code generation — and people tend to type a few words.
- First-run and casual users who don't know which details matter (style, audience, constraints).
- Products with a known prompt structure, where the rewrite can add the slots people forget.

## When not to use
- Chat with a capable assistant that can ask for missing details itself — use Clarifying Questions instead of guessing on the user's behalf.
- Short factual questions. "What's the capital of Peru?" has nothing to enhance.
- Silently, on every send. Rewriting without showing it erodes trust when the output drifts from what was asked.

## Anatomy
- Composer: the prompt field with an Enhance button (sparkle and label) and the send button.
- Working state: a shimmer across the field and an "Enhancing…" label; the text is read-only meanwhile.
- Review state: the rewritten prompt with added words highlighted.
- Review bar: "Prompt enhanced — additions are highlighted", Undo and Keep editing.
- Error line: shown when the rewrite fails, stating that the text is unchanged.

## Behavior
- Enhance is disabled until there are a few words to work from (default 8 characters), with a tooltip saying why.
- While enhancing, the field is read-only and the send button is disabled, so the rewrite can't clobber new typing.
- The rewrite replaces the prompt in place. Additions fade in from a blur onto a light highlight.
- Undo restores the exact original text and returns focus to the field. Keep editing (or clicking into the text, Enter or Escape) drops the highlights and puts the cursor at the end.
- Sending works directly from the review state; the enhanced text is what gets sent.
- On failure the original stays as typed and a short error explains it.

## Content guidelines
- Keep the user's intent and words; add specifics (style, audience, format, constraints), don't change the subject.
- Rewrite in the user's language and voice, and keep it to a paragraph — an essay-length prompt is harder to edit than the original.
- Label the button with a verb: "Enhance" or "Improve prompt". Avoid "Magic".

## Accessibility
- Enhance is a real button with a visible label; its disabled reason is available as a tooltip.
- The field carries \`aria-busy\` while enhancing; the review bar and error sit in an \`aria-live="polite"\` region so the outcome is announced.
- The review text is focusable and exposed as a read-only textbox; highlights use \`<mark>\`, so they are announced as highlighted.
- The shimmer and highlight animation are skipped when the user prefers reduced motion.

## Related patterns
- **Prompt Bar** — Use it as well; the Enhance button belongs in its toolbar.
- **Prompt Template** — Use it instead when the missing details are known slots that people can fill in themselves.
- **Clarifying Questions** — Use it instead when the assistant should ask rather than guess what the person meant.
- **Refinement Controls** — Use it instead to adjust a result after it is generated, rather than the prompt before.
`;
