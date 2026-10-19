"""Behavior checks for incomplete model profiles and undiscoverable pair agents.

Run: python3 -m unittest discover -s scripts -p '*_test.py'
"""

import json
from pathlib import Path
import shutil
import tempfile
import unittest

from check_plugin import check_model_agents, check_model_profiles


REPOSITORY_ROOT = Path(__file__).resolve().parent.parent


class ModelBudgetValidationTest(unittest.TestCase):
    def setUp(self):
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.root = Path(self.workspace.name)
        self.skills = self.root / "skills"
        self.profiles = self.skills / "polaris" / "references" / "model-profiles"
        shutil.copytree(REPOSITORY_ROOT / "skills/polaris/references/model-profiles", self.profiles)
        for directory in ("agents", "com.anthropic.claude-code", ".claude-plugin"):
            shutil.copytree(REPOSITORY_ROOT / directory, self.root / directory)
        shutil.copy(REPOSITORY_ROOT / "plugin.json", self.root / "plugin.json")

    def test_complete_profiles_and_discoverable_agents_are_accepted(self):
        self.assertEqual([], check_model_profiles(self.skills))
        self.assertEqual([], check_model_agents(self.root))

    def test_assignment_without_all_budget_allocations_is_rejected(self):
        profile = self.profiles / "gpt.md"
        lines = profile.read_text().splitlines()
        profile.write_text("\n".join(line for line in lines if not line.startswith("| `execution` | `complex`")))
        self.assertTrue(check_model_profiles(self.skills))

    def test_unsupported_kind_level_combination_is_rejected(self):
        profile = self.profiles / "gpt.md"
        profile.write_text(profile.read_text().replace("`execution` | `complex`", "`execution` | `very_hard`"))
        self.assertTrue(check_model_profiles(self.skills))

    def test_duplicate_assignment_is_rejected(self):
        profile = self.profiles / "gpt.md"
        profile.write_text(profile.read_text().replace("`execution` | `complex`", "`execution` | `regular`"))
        self.assertTrue(check_model_profiles(self.skills))

    def test_missing_budget_pair_is_rejected(self):
        profile = self.profiles / "gpt.md"
        lines = profile.read_text().splitlines()
        row = next(line for line in lines if line.startswith("| `execution` | `complex`"))
        profile.write_text(profile.read_text().replace(row, row.rsplit("|", 2)[0] + " |"))
        self.assertTrue(check_model_profiles(self.skills))

    def test_missing_unclassified_allocation_is_rejected(self):
        profile = self.profiles / "gpt.md"
        lines = profile.read_text().splitlines()
        profile.write_text("\n".join(line for line in lines if not line.startswith("| `unclassified`")))
        self.assertTrue(check_model_profiles(self.skills))

    def test_incomplete_grok_only_allocations_are_rejected(self):
        profile = self.profiles / "xai.md"
        text = profile.read_text()
        row_start = text.rindex("| `execution` | `complex`")
        row_end = text.index("\n", row_start)
        profile.write_text(text[:row_start] + text[row_end + 1:])
        self.assertTrue(check_model_profiles(self.skills))

    def test_missing_profile_is_rejected(self):
        (self.profiles / "glm.md").unlink()
        self.assertTrue(check_model_profiles(self.skills))

    def test_glm_low_allocation_is_rejected(self):
        profile = self.profiles / "glm.md"
        profile.write_text(profile.read_text().replace("Flash high", "Flash low", 1))
        self.assertTrue(check_model_profiles(self.skills))

    def test_max_is_rejected_where_xhigh_is_available(self):
        profile = self.profiles / "gpt.md"
        profile.write_text(profile.read_text().replace("Sol xhigh", "Sol max", 1))
        self.assertTrue(check_model_profiles(self.skills))

    def test_profile_wording_does_not_affect_validation(self):
        profile = self.profiles / "gpt.md"
        profile.write_text("An additional explanation of cost.\n\n" + profile.read_text())
        self.assertEqual([], check_model_profiles(self.skills))

    def test_unregistered_claude_agent_is_rejected(self):
        manifest = self.root / ".claude-plugin/plugin.json"
        config = json.loads(manifest.read_text())
        config["agents"].pop()
        manifest.write_text(json.dumps(config))
        self.assertTrue(check_model_agents(self.root))

    def test_reasoning_agent_without_effort_is_rejected(self):
        agent = self.root / "agents/grok-high.md"
        agent.write_text(agent.read_text().replace("effort: high\n", ""))
        self.assertTrue(check_model_agents(self.root))

    def test_agent_body_wording_does_not_affect_validation(self):
        agent = self.root / "agents/grok-high.md"
        agent.write_text(agent.read_text() + "\nReturn concise findings.\n")
        self.assertEqual([], check_model_agents(self.root))

    def test_portable_manifest_cannot_register_harness_agents(self):
        manifest = self.root / "plugin.json"
        config = json.loads(manifest.read_text())
        config["agents"] = ["./agents/grok-high.md"]
        manifest.write_text(json.dumps(config))
        self.assertTrue(check_model_agents(self.root))


if __name__ == "__main__":
    unittest.main()
