import { App, FileSystemAdapter } from "obsidian";

// Renaming a file on disk keeps its mtime. Obsidian then rewrites the notes
// that link to it, and those notes get a new mtime. This module records
// mtimes before a batch and writes them back afterwards.
//
// A rewritten note can keep its byte size (space -> dash keeps the length),
// so restoring its exact old mtime could hide the edit from sync tools that
// compare mtime + size. Rewritten notes get the old mtime plus BUMP_MS.

const BUMP_MS = 3000;
const QUIET_MS = 1500;
const MAX_WAIT_MS = 60_000;
// Files whose links Obsidian may rewrite.
const LINKING_EXTENSIONS = new Set(["md", "canvas"]);

type Fs = typeof import("fs").promises;

export interface MtimeSnapshot {
	adapter: FileSystemAdapter;
	fs: Fs;
	startedAt: number;
	mtimes: Map<string, number>;
	stopWatching: () => void;
	lastEventAt: number;
}

export interface RestoreResult {
	restored: number;
	failed: number;
}

/** Returns null on mobile, where there is no filesystem access. */
export async function snapshotMtimes(app: App, extraPaths: string[]): Promise<MtimeSnapshot | null> {
	const adapter = app.vault.adapter;
	if (!(adapter instanceof FileSystemAdapter)) return null;
	// Required lazily so the plugin still loads on mobile.
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const fs = (require("fs") as typeof import("fs")).promises;

	const paths = new Set(extraPaths);
	for (const f of app.vault.getFiles()) {
		if (LINKING_EXTENSIONS.has(f.extension)) paths.add(f.path);
	}

	const mtimes = new Map<string, number>();
	await Promise.all(
		[...paths].map(async (path) => {
			try {
				const st = await fs.stat(adapter.getFullPath(path));
				mtimes.set(path, st.mtimeMs);
			} catch {
				/* file vanished; nothing to restore */
			}
		})
	);

	const snap: MtimeSnapshot = {
		adapter,
		fs,
		startedAt: Date.now(),
		mtimes,
		stopWatching: () => {},
		lastEventAt: Date.now(),
	};
	const touch = () => {
		snap.lastEventAt = Date.now();
	};
	const refs = [app.vault.on("modify", touch), app.vault.on("rename", touch)];
	snap.stopWatching = () => refs.forEach((r) => app.vault.offref(r));
	return snap;
}

/** Waits until Obsidian has stopped writing files (link rewrites can lag). */
async function waitForQuiet(snap: MtimeSnapshot): Promise<void> {
	const deadline = Date.now() + MAX_WAIT_MS;
	while (Date.now() < deadline && Date.now() - snap.lastEventAt < QUIET_MS) {
		await new Promise((r) => window.setTimeout(r, 250));
	}
}

/**
 * @param moves old path -> new path for every file renamed in the batch
 * @param bump add BUMP_MS to notes whose content was rewritten
 */
export async function restoreMtimes(
	snap: MtimeSnapshot,
	moves: Map<string, string>,
	bump: boolean
): Promise<RestoreResult> {
	await waitForQuiet(snap);
	snap.stopWatching();

	let restored = 0;
	let failed = 0;
	const { fs, adapter } = snap;

	for (const [oldPath, oldMtime] of snap.mtimes) {
		const full = adapter.getFullPath(moves.get(oldPath) ?? oldPath);
		try {
			const st = await fs.stat(full);
			if (st.mtimeMs === oldMtime) continue; // untouched, or renamed only
			if (st.mtimeMs < snap.startedAt - 1000) continue; // changed outside this batch
			const target = oldMtime + (bump ? BUMP_MS : 0);
			await fs.utimes(full, st.atime, new Date(target));
			restored++;
		} catch (err) {
			failed++;
			console.error(`Slugify CJK: could not restore mtime of "${full}"`, err);
		}
	}

	return { restored, failed };
}
