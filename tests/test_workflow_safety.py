import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class WorkflowSafetyTests(unittest.TestCase):
    def test_only_daily_report_is_active(self):
        active = sorted(p.name for p in (ROOT / '.github/workflows').glob('*.y*ml'))
        self.assertEqual(active, ['badge-bot.yml'])

    def test_exactly_one_daily_schedule_and_no_child_triggers(self):
        source = (ROOT / '.github/workflows/badge-bot.yml').read_text(encoding='utf-8-sig')
        self.assertIn('workflow_dispatch:', source)
        self.assertEqual(re.findall(r"cron:\s*'([^']+)'", source), ['30 2 * * *'])
        self.assertIn("github.event_name == 'schedule' || (github.event_name == 'workflow_dispatch' && inputs.acknowledge_runner_usage)", source)
        self.assertNotRegex(source, r'(?m)^  (push|pull_request|workflow_call|workflow_run|repository_dispatch):')
        self.assertNotIn('uses: ./.github/workflows/', source)
        self.assertNotRegex(source, r'(?m)^\s+matrix:')

    def test_report_is_read_only_bounded_and_requires_consent(self):
        source = (ROOT / '.github/workflows/badge-bot.yml').read_text(encoding='utf-8-sig')
        self.assertIn('acknowledge_runner_usage', source)
        self.assertIn('default: false', source)
        self.assertRegex(source, r'if:.*inputs\.acknowledge_runner_usage')
        self.assertIn('timeout-minutes: 3', source)
        self.assertIn('concurrency:', source)
        self.assertIn('contents: read', source)
        self.assertNotRegex(source, r'(?m)^\s+[\w-]+: write\s*$')
        for operation in ('gh pr create', 'gh pr merge', 'gh issue create', 'git push', '--admin', 'secrets.GH_PAT', 'curl '):
            self.assertNotIn(operation, source)
        self.assertEqual(len(re.findall(r'(?m)^    runs-on:', source)), 1)

    def test_legacy_hunters_are_preserved_outside_active_directory(self):
        archived = list((ROOT / '.github/disabled-workflows').glob('*.yml'))
        self.assertEqual(len(archived), 9)

if __name__ == '__main__':
    unittest.main()
