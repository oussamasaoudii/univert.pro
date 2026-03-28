# Agent Logging Rules

This repository keeps a per-site plain-text work log for any meaningful change made by an AI coding assistant.

## Required behavior

When you change code, content, configuration, deployment files, docs, or operational scripts for this site:

1. Ensure the site log exists at:
   `ai-change-logs/<site-slug>-worklog.txt`
2. If it does not exist, create it before or alongside your first change.
3. Append a short entry after finishing the task.
4. Never delete or overwrite previous entries.

## Site slug

- First choice: read `ai-change-logs/PROJECT-SLUG.txt`
- If missing: derive the slug from the repository or site/domain name
- For this repository, the slug is `univert-pro`

## Entry format

Each appended entry should include:

- UTC date/time
- actor name, such as `Codex` or `Claude Code`
- short summary of what changed
- key files touched
- optional notes if the change also affected server/runtime state outside Git

## Helper script

Prefer using:

`bash scripts/append-agent-log.sh "<actor>" "<summary>" [file1 file2 ...]`

The script will:

- create the `ai-change-logs` directory if needed
- create the site log automatically if missing
- append a timestamped entry

## New sites created later

If this project is duplicated or used as the base for a new site:

1. update `ai-change-logs/PROJECT-SLUG.txt`
2. let the helper script create the new site log automatically
3. keep using the same logging convention

## Scope

Log meaningful tasks only. Do not spam the log with tiny read-only inspections unless they materially changed decisions or implementation.
