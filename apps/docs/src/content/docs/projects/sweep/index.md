---
title: Sweep
description: A Python command-line tool for organizing files in a selected directory.
---

Sweep is a small Python command-line tool that organizes files in a selected directory. It scans files directly inside that directory, classifies them by their final extension, and calculates a category destination. `preview` reports those destinations without moving files; `run` performs the moves.

## What Sweep currently does

For a selected directory, Sweep:

1. expands user-home notation such as `~`;
2. checks that the path exists and is a directory;
3. scans files directly inside the directory;
4. ignores subdirectories;
5. classifies each file by its lowercased final suffix;
6. calculates a destination in this form:

   ```text
   <directory>/<category>/<filename>
   ```

With `preview`, Sweep reports the classification and calculated destination. With `run`, it moves each file to that destination. A destination directory is created when a move needs it.

The command prints information for each file, including its name, category, suffix, size, and destination. It also prints totals and category counts. `run` additionally reports how many files were moved and how many were skipped.

## Classification

Classification uses the lowercased final `Path.suffix` value. The current categories are:

| Category | Extensions |
| --- | --- |
| Images | `.jpg`, `.png`, `.jpeg`, `.gif`, `.webp` |
| Documents | `.docx`, `.pdf`, `.md`, `.txt` |
| Archives | `.zip`, `.rar`, `.7z`, `.tar`, `.gz` |
| Other | Every other final suffix, including no suffix |

For example:

```text
photo.png     → Images
REPORT.PDF    → Documents
archive.tar.gz → Archives
README        → Other
.hidden       → Other
```

`archive.tar.gz` is classified as an archive because `.gz` is its final suffix. `.hidden` has no suffix according to Python's `Path.suffix` behavior.

## Preview and run

### Preview

```bash
sweep preview ~/Downloads
```

`preview` scans and classifies the files, calculates their destinations, and reports the planned organization. It does not move files. Preview does not perform the move-time destination conflict check.

### Run

```bash
sweep run ~/Downloads
```

`run` performs the organization. It creates category directories as needed and moves files to their calculated destinations.

## Conflict behavior

Sweep does not overwrite an existing destination file. When the destination already exists, the move is skipped and the source file is left in place.

There is no automatic rename, overwrite option, conflict-resolution strategy, transaction, or rollback.

## Current limitations

The current implementation does not provide:

- recursive scanning;
- file watching or background automation;
- scheduling;
- configurable classification rules;
- content-based file detection;
- automatic renaming on conflicts;
- overwrite handling;
- rollback;
- broad whole-filesystem organization.

The target directory is supplied by the user. Downloads is only an example; it is not hardcoded.

[Source repository](https://github.com/RaioViajante/sweep)
