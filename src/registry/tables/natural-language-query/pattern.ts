export const pattern = `# Natural Language Query

## Summary
A table's query bar that speaks SQL by default but also accepts plain language. While the input reads as a \`WHERE\` clause over known columns, it behaves like a SQL console: syntax-highlighted, and Enter runs it. As soon as the input reads as plain language, the mode badge switches from \`WHERE\` to "✦ Ask", and Enter translates the request into SQL. The translated query is typed into the same bar, where the user can read and edit it, and then runs. The result is always a real query the user can see, not a hidden interpretation.

## When to use
- Data tools whose users include both SQL-fluent people and people who aren't: admin consoles, analytics, logs, internal tables.
- When users need to learn or check the query language — seeing their sentence become SQL teaches the syntax.
- Requests that need values the user doesn't know by heart ("video call gear" → \`product IN ('Noise-cancelling headset', 'Webcam', …)\`).

## When not to use
- Audiences who should never see SQL. Use Describe Filters, which turns a description into filter chips instead.
- Write queries (UPDATE, DELETE). Translation is for reading; never run a generated statement that changes data without a separate confirmation.
- Small tables where a search box and a couple of filters are enough.

## Anatomy
- **Mode badge** — at the start of the bar: \`WHERE\` (monospace, muted) in SQL mode, "✦ Ask" in plain-language mode. The ✦ spins while translating.
- **Query input** — a single monospace line. SQL is syntax-highlighted: keywords, strings, numbers and operators each have their own color.
- **Submit key** — "Run ↵" in SQL mode, "Translate ↵" in Ask mode.
- **Context line** — under the bar. Shows examples when empty, what Enter will do while typing, "Writing the query…" while translating, and "✦ Translated from "…" · Edit request" after a translation.
- **Result status** — row count and time ("4 rows · 251 ms"), or the query error in place.
- **Results table** — column headers use the SQL column names, so they match what the user writes.

## Behavior
- Mode is detected live: input counts as SQL when it starts with \`SELECT\`/\`WHERE\`, contains a known column followed by an operator (\`=\`, \`>\`, \`IN\`, \`LIKE\`, \`IS NULL\`…), or compares any identifier to a literal (\`colour = 'red'\`) — that one runs and fails with a clear unknown-column error rather than being translated. Anything else is plain language. An empty bar is SQL mode and runs as "all rows".
- Detection is keyed to the table's real column names, so "status is shipped" stays plain language while \`status = 'Shipped'\` is SQL.
- Enter in SQL mode runs the query as typed.
- Enter in Ask mode translates. The bar becomes read-only, the badge spins and the context line says "Writing the query…". The SQL is then typed into the bar quickly (well under a second; shown in full immediately with \`prefers-reduced-motion\`) and runs automatically.
- After a translation, the context line quotes the original request with an "Edit request" action that puts the plain text back in the bar, ready to rephrase. It doesn't re-run anything.
- Editing the generated SQL by hand clears the "Translated from" line: the query is now the user's own.
- SQL errors (unknown column, bad operator) show in the result status in plain words and name valid columns where possible. The table keeps the last good rows until the next successful run.
- If the request can't be translated, say so and suggest naming a column or value. Never run an empty or guessed query.

## Content guidelines
- The placeholder shows both modes at once: a real example clause plus "— or just describe it".
- Examples are plain language and use the table's own vocabulary ("returned orders from the app"), including at least one that needs values the user wouldn't know ("video call gear").
- Generated SQL uses the exact values in the data ('Mobile app', not 'mobile') and ISO dates, so it can be copied elsewhere.
- Keep generated queries short and readable: one condition per idea, joined with AND, no unnecessary parentheses.

## Accessibility
- The input has a full label: "Query orders: write a SQL WHERE clause, or describe what you want in plain language". The context line is linked with \`aria-describedby\` and is a polite live region, so mode changes and "Translated from…" are announced.
- Syntax highlighting is a visual layer behind the real input. The input keeps the actual text, so screen readers, selection and copy work normally.
- The result status is a \`role="status"\` region; errors are announced there too.
- Color is not the only signal of mode — the badge text changes ("WHERE" / "Ask"), and so does the submit label.
- Focus stays in the bar through translation and running, so the user can refine straight away.

## Related patterns
- Describe Filters — the same idea for people who shouldn't see SQL: the request becomes filter chips.
- Command Palette — keyword jumping, not querying.
- Refinement Controls — a similar plain-instruction → reviewable-result loop for text.
`;
