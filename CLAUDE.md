# Claude Code Repository Instructions

For every meaningful repository change, Claude Code must maintain the plain-text site work log.

## Log path

`ai-change-logs/<site-slug>-worklog.txt`

Use `ai-change-logs/PROJECT-SLUG.txt` when present to determine the current site slug.

For this repository, the slug is `univert-pro`.

## Required workflow

1. Make the requested repository change.
2. Ensure the site log exists.
3. Append a concise timestamped entry describing:
   - what changed
   - which files were touched
   - whether any related server/runtime action happened outside Git

## Preferred command

`bash scripts/append-agent-log.sh "Claude Code" "<summary>" [file1 file2 ...]`

If the script cannot be used, update the log file manually in the same format.

## Important

- Do not remove earlier entries.
- Use plain text, not markdown tables.
- If this repo becomes the base for another site, update `ai-change-logs/PROJECT-SLUG.txt` and continue the same pattern.
