export default {
	commandName: "Rename files to slug-case (whole vault)",
	ribbonTooltip: "Slugify CJK: rename files to slug-case (whole vault)",
	scopeVault: "the whole vault",
	menuFolder: "Slugify CJK: rename files in this folder",
	menuFile: "Slugify CJK: rename this file",
	menuSelection: (n: number) => `Slugify CJK: rename selection (${n} items)`,
	scopeFolder: (name: string) => `folder "${name}"`,
	scopeFile: (name: string) => `"${name}"`,
	scopeSelection: (n: number) => `the selection (${n} items)`,
	noticeNothingToRename: (scope: string) => `Nothing to rename in ${scope}: already in slug-case.`,
	modalHeading: (n: number, scope: string) => `Slugify CJK: ${n} file(s) in ${scope}`,
	modalDescription:
		"The following files will be renamed, and any links pointing to them will be updated automatically:",
	modalEditHint: "You can edit any proposed name below before confirming.",
	buttonCancel: "Cancel",
	buttonApply: (n: number) => `Rename ${n} file(s)`,
	noticeDoneWithSkipped: (done: number, skipped: number) =>
		`${done} file(s) renamed, ${skipped} skipped (see console).`,
	noticeDone: (done: number) => `${done} file(s) renamed successfully.`,
	collisionNote: (n: number) =>
		`${n} item(s) skipped due to a name collision with an existing or another renamed file.`,
	collisionLabel: "collision, will be skipped",
	settingsExcludedFoldersName: "Excluded folders",
	settingsExcludedFoldersDesc:
		"Files inside these folders (and their subfolders) are never included, no matter how they're triggered. One folder path per line.",
	settingsExcludedFoldersPlaceholder: "templates\nattachments/inbox",
	settingsSeparatorName: "Separator",
	settingsSeparatorDesc: "Character used to replace spaces and other non-alphanumeric characters in slugified names.",
	settingsIncludeAttachmentsName: "Include attachments",
	settingsIncludeAttachmentsDesc:
		"Also rename non-markdown files (images, PDFs, etc.), not just notes. Links/embeds pointing to them are updated too.",
	undoCommandName: "Undo last slugify",
	noticeNothingToUndo: "Nothing to undo: no slugify batch since Obsidian was opened.",
	noticeUndoDone: (n: number) => `${n} file(s) restored to their previous name.`,
	noticeUndoDoneWithSkipped: (done: number, skipped: number) =>
		`${done} file(s) restored, ${skipped} skipped (see console).`,
	noticeRestoringMtimes: "Slugify CJK: restoring modified dates…",
	noticeMtimesRestored: (n: number, failed: number) =>
		failed > 0
			? `Modified dates restored on ${n} file(s), ${failed} failed (see console).`
			: `Modified dates restored on ${n} file(s).`,
	settingsPreserveMtimeName: "Keep modified dates",
	settingsPreserveMtimeDesc:
		"Renamed files keep their modified date. Notes whose links get rewritten have their old modified date put back afterwards. Desktop only.",
	settingsBumpMtimeName: "Nudge rewritten notes by 3 seconds",
	settingsBumpMtimeDesc:
		"Notes whose links were rewritten get their old modified date plus 3 seconds, so sync tools that compare date and size still see the edit. Turn off to restore the exact old date.",
	noticeBusy: "Slugify CJK: still finishing the previous batch. Try again in a moment.",
};
