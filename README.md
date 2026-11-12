# Slugify CJK

A fork of [Slugify](https://github.com/ansango/obsidian-slugify) by ansango. It renames files, and everything that links to them, to slug-case without losing Chinese, Japanese or Korean characters, and it keeps modified dates.

## What's different from Slugify

| | Slugify | Slugify CJK |
|---|---|---|
| `關於低解析度視訊超分` | skipped (empty slug) | kept as is |
| `日本 2024 旅行` | `2024` | `日本-2024-旅行` |
| `がぎぐ パピプ` | skipped | `がぎぐ-パピプ` (voiced marks kept) |
| `Йошкар` | `` (skipped) | `йошкар` |
| `Café notes` | `cafe-notes` | `cafe-notes` |
| Modified dates | links rewritten by the rename get a new date | old dates put back (see below) |

The conversion lowercases, strips accents from Latin letters only, recombines to NFC, and replaces every run of characters that are not a letter, mark or digit (in any script) with the separator. Underscores, dots and emoji become separators too.

## Modified dates

Renaming a file keeps its modified date. Obsidian then rewrites links in the notes that point to it, which gives those notes a new date. With **Keep modified dates** on (default), the plugin records dates before a batch, waits for Obsidian to finish writing, and puts the old dates back. Undo does the same.

A rewritten note often keeps the same size (`Linux migration` → `linux-migration` has the same length). Sync tools such as Syncthing and MEGA compare date and size, so putting back the exact old date could hide the edit from them, and other devices would keep stale links. **Nudge rewritten notes by 3 seconds** (default on) restores the old date plus 3 seconds instead. Renamed files that were not rewritten keep their exact date.

This needs filesystem access, so it only runs on desktop. On mobile the rename still works and dates are left alone.

## Features

- Rename a single file, an entire folder (recursively), or a multi-selection from the file explorer context menu.
- Vault-wide command from the command palette.
- Preview modal listing every `old path → new path`; each name is editable and collisions are recomputed as you edit.
- Collisions (against an existing file, or two renames targeting the same path) are flagged and skipped.
- "Undo last slugify" reverts the most recent batch (in memory, single level, lost on reload).
- English and Spanish UI.

For large vaults, run it one folder at a time: the preview draws one row per file.

## Install

Not on the Community Plugins list. Either:

- Build it (`bun install && bun run build`) and copy `main.js`, `manifest.json` and `styles.css` into `<your-vault>/.obsidian/plugins/slugify-cjk/`, or
- Install with [BRAT](https://github.com/TfTHacker/obsidian42-brat) from `nostam/obsidian-slugify-cjk` once a release exists.

Then reload Obsidian and enable **Slugify CJK** under Settings → Community plugins. It uses its own plugin ID, so it can sit next to the original Slugify.

## Usage

- **Ribbon icon** or **command palette** → "Rename files to slug-case (whole vault)".
- **Command palette** → "Undo last slugify".
- **Right-click a folder** → "Slugify CJK: rename files in this folder".
- **Right-click a file** → "Slugify CJK: rename this file".
- **Select multiple files/folders**, right-click → "Slugify CJK: rename selection (N items)".

## Settings

- **Excluded folders** — one path per line; files inside them (and their subfolders) are always skipped, everywhere.
- **Separator** — `-` or `_`, used in place of spaces and other non-alphanumeric characters.
- **Include attachments** — off by default. When enabled, non-markdown files (images, PDFs, etc.) become eligible for renaming too, and the file/folder/selection context menu items apply to them as well.
- **Keep modified dates** — on by default, desktop only. See above.
- **Nudge rewritten notes by 3 seconds** — on by default. See above.

## Permissions

The plugin calls `vault.getFiles()` / `vault.getMarkdownFiles()` to enumerate files in the vault. This is required for its core function (finding which files to rename). To keep modified dates it reads file dates and sets them with Node's `fs.stat` / `fs.utimes` on desktop. It never reads file contents or sends anything over the network.

## Development

Uses [Bun](https://bun.sh) for both package management and running scripts. Bundling still goes through esbuild (the approach recommended by Obsidian's plugin docs).

```bash
bun install
bun run dev     # watch mode, rebuilds main.js on change
bun run build   # type-check + production build (minified, no sourcemap)
bun test        # run the test suite
```

The plugin is plain TypeScript + the Obsidian API — no UI framework, structured under `src/`:

- `src/core/` — the Plugin entry point, the confirmation modal, the settings tab, vault file-tree helpers, and `mtime.ts` (keeping modified dates).
- `src/utils/` — pure logic (slugify, collision detection) decoupled from Obsidian's types so it's unit-testable with `bun:test` (colocated as `logic.test.ts`), plus the English/Spanish translations.
- `src/styles/` — the plugin's CSS, copied to the plugin root on every build.

## License

MIT. Original work © 2026 ansango; see `LICENSE`.
