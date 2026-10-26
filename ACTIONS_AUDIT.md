# Actions investigation — 26 October 2026

## Scope and evidence

Inspected `Diganta18-noob/badge` and `Diganta18-noob/GitHub-Badge-Hunter`, including their default-branch workflow files, 300 recent workflow runs per repository, failed-job annotations, a failed job log, and workflow permission/secret-name metadata. No secret values were read.

Both repositories were public when inspected and all file-defined runners were `ubuntu-latest`. Standard GitHub-hosted runners in public repositories do not consume the account's included private-repository minutes. Therefore these workflows' current public configuration does not establish that they caused the 3,000-minute balance in the account email. Past visibility changes or other/historical account usage require the account billing breakdown. The billing API returned 404 to the available sign-in, so an exact allocation of those 3,000 minutes was not verified.

## Configured automatic frequency before the fix

The same schedule existed in both repositories:

| Top-level workflow | Cron / interval (UTC) | Runs per day, per repository |
| --- | --- | ---: |
| Pull Shark + YOLO | `*/30 * * * *` | 48 |
| Badge Bot Master | `0 */6 * * *` | 4 |
| Open Sourcerer | `45 */4 * * *` | 6 |
| Pair Extraordinaire | `0 14 * * *` | 1 |
| Galaxy Brain | `0 12 * * *` | 1 |
| Heart On Your Sleeve | `0 8 * * *` | 1 |
| Starstruck | `30 6 * * *` | 1 |
| Public Sponsor | `0 9 * * 1` | 1 extra on Mondays |
| Developer Program | `0 10 * * 1` | 1 extra on Mondays |
| Quickdraw | Called by master; no independent schedule | 0 independent |
| **Total** | | **62 per day; 64 on Mondays** |

Across both repositories this was nominally 124 top-level executions per day, or 128 on Mondays. This is a configured frequency, not a claim that GitHub delivered every scheduled event.

Pull Shark expanded each invocation to five matrix jobs. Pair Extraordinaire expanded to ten. The master expanded to 20 runner jobs: start notification, Quickdraw, five Pull Shark jobs, ten Pair jobs, Open Sourcerer, Heart, and the final report. Counting these produces up to 339 job allocations per repository on an ordinary day if all scheduled events are delivered; failed/cancelled/skipped execution changes actual runner use. Job counts are not billed-minute measurements.

The 300-run samples showed **19 actual top-level runs in each repository on 25 October (UTC)**, 38 combined. GitHub scheduling is not an exact delivery guarantee, and the current cron declaration alone cannot be used as a historical run count.

## Confirmed failures and waste

1. **Account-level runner block in `badge`.** [Run 40276053088](https://github.com/Diganta18-noob/badge/actions/runs/40276053088) allocated five jobs; the failing job had no runner and no executed steps. Its annotation cited failed account payments or a spending-limit restriction. This is a runner-start/billing restriction, rather than an error in the badge shell script.
2. **PR permissions in `GitHub-Badge-Hunter`.** [Run 40286411138](https://github.com/Diganta18-noob/GitHub-Badge-Hunter/actions/runs/40286411138) failed in Create PR. The job log said GitHub Actions was not permitted to create or approve pull requests. Repository metadata showed no Actions secrets and PR creation/approval disabled. The fallback Actions token could push its generated branch, but could not complete its PR operation.
3. **A master failure still launched later work.** [Run 40266959587](https://github.com/Diganta18-noob/GitHub-Badge-Hunter/actions/runs/40266959587) contained 20 jobs. Both PR hunters failed, while later helpers and the final report still ran because of `always()`.
4. **Runner-level waste survived step skips.** The iteration-count and goal checks were inside matrix job steps. They did not prevent allocating all five or ten matrix jobs or stop future schedules.
5. **Duplicate orchestration.** Several hunters had both their own cron triggers and master calls. There was no cross-workflow concurrency protection.
6. **Misleading award claims.** The master treated generic merged-PR/closed-issue counts as proof of awarded Achievements. Pair progress searched PR text rather than verifying co-authorship and an award. Merge retry loops could exhaust without reliably failing the step. These reports were not a source of truth for actual profile Achievements.
7. **Documentation drift.** The old README said hourly and free without qualifying public/private billing; the workflow actually declared half-hourly Pull Shark runs. Master inputs `run_all` and `send_report` were declared but did not control the relevant jobs.

## Prepared remediation

Application status: source changes are validated locally and proposed for review. The default-branch schedules have not yet been changed, and no live workflow has been disabled. Applying the fixes and any cancellation of active runs awaits the owner's approval.

- Preserve nine old hunters outside `.github/workflows/`, where GitHub cannot execute them.
- Replace the master with one manual-only, read-only report; require explicit runner-use acknowledgement before its sole job can start.
- Remove all automatic triggers, matrices, reusable workflow calls, write permissions, PAT use, messaging, PR creation/merging, and git pushes from active automation.
- Bound the report to three minutes and cancel overlapping reports through one concurrency group.
- Keep actual GitHub Achievement verification separate from repository activity counts.
- Disable the legacy workflow records through GitHub's API and cancel any outstanding legacy runs. Enable only the new manual report after publishing the source fix.
- Validate locally without dispatching a paid or badge-generating test run.

These changes prevent new scheduled badge runs. They do not refund used minutes, reset the account quota, repair a failed payment, change a spending limit, or prove which historical usage consumed the quota.

## References

- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [Viewing job execution time and billable minutes](https://docs.github.com/en/actions/how-tos/monitor-workflows/view-job-execution-time)
- [Disabling and enabling workflows](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows)
- [GitHub profile Achievements](https://docs.github.com/en/account-and-profile/reference/profile-reference#earning-achievements)
