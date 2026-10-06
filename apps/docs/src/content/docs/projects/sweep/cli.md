---
title: Sweep CLI
description: Every Sweep command, argument and output field in one place.
tagline: Every command, argument and output field, in one place.
label: cli reference
order: 1.1
sub: true
group: projects
status: active
meta:
  - reference
source: https://github.com/RaioViajante/sweep
summary: commands, arguments and output
---

## Synopsis

```shell title="usage"
sweep <command> <directory>
```

## Commands

`sweep preview <directory>` scans and classifies the files, calculates their destinations, and reports the planned organization. It does not move files.

`sweep run <directory>` performs the organization. It creates category directories as needed and moves files to their calculated destinations.

| Behavior | Preview | Run |
| --- | --- | --- |
| scans and classifies files | yes | yes |
| reports calculated destinations | yes | yes |
| creates category directories | no | yes |
| moves files | no | yes |
| move-time conflict check | no | yes |
| reports moved and skipped counts | no | yes |

## Arguments

`directory` is required. It is the directory to organize. User-home notation such as `~` is expanded. The path must exist and be a directory. Only files directly inside it are considered; subdirectories are ignored.

:::note
The guide documents no flags. Options get their own table here once they exist.
:::

## Output

For each file, Sweep prints:

| Field | Value |
| --- | --- |
| name | file name |
| category | Images, Documents, Archives or Other |
| suffix | lowercased final suffix |
| size | file size |
| destination | calculated target path |

After the files it prints a summary:

| Field | Printed by |
| --- | --- |
| totals | preview and run |
| category counts | preview and run |
| moved | run only |
| skipped | run only |
