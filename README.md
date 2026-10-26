# Badge activity report

This repository runs one daily read-only report. The old automatic badge hunters remain inactive. They generated repeated workflow runs, empty PR activity, repository log commits, and misleading achievement notifications.

## Current behavior

- **Scheduled runs per day: 1**, at **08:00 IST / 02:30 UTC**. GitHub may delay scheduled starts. There are no push, pull-request, or chained workflow triggers.
- **Manual report:** Actions → Badge activity report (daily) → Run workflow → explicitly check `acknowledge_runner_usage`.
- One read-only Ubuntu runner, with a 3-minute timeout and concurrency cancellation. The daily schedule runs without manual input. Extra manual reports require the checkbox; leaving it unchecked skips the manual job before a runner is allocated.
- The report shows repository stars, merged PRs, and closed issues. It does **not** claim these counts are verified achievement awards.
- No PAT, Telegram token, write permission, synthetic PRs, automatic merges, issues, reactions, or repository log commits are required by the active workflow.

The nine original hunters are preserved in `.github/disabled-workflows/` for reference. GitHub does not execute workflow files from that directory. Root-level YAML copies and the old ZIP are also inactive reference files; do not copy them back into `.github/workflows/` unless you intentionally want to restore their behavior.

## Why the earlier setup failed

The master invoked hunters that also had their own schedules. Pull Shark expanded to five runner jobs and Pair Extraordinaire to ten, including jobs that only checked whether they should skip. The master continued after failures with `always()`. Its `run_all` and `send_report` inputs did not gate the jobs. Even after its goal checks passed, future cron runs still allocated runners.

README claims of guaranteed automatic badges and a universally free cost were inaccurate. GitHub awards Achievements; this repository cannot award them or verify them by counting PRs or issues. Standard Ubuntu runners in public repositories are free, but private-repository usage and account-wide billing restrictions are separate concerns.

See [ACTIONS_AUDIT.md](ACTIONS_AUDIT.md) for evidence, the old configured run frequency, the observed run frequency, and billing limitations.

## Validate locally

```shell
python -m unittest discover -s tests -v
```

Do not rerun old failed hunts to test this change: rerunning an old execution uses its old workflow definition. The active report is optional; it is not necessary to run Actions to validate the safety changes locally.
