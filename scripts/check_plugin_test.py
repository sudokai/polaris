"""Behavior checks for incomplete model profiles and bundled pair agents.

Run: python3 -m unittest discover -s scripts -p '*_test.py'
"""

import json
from pathlib import Path
import shutil
import tempfile
import unittest

from check_plugin import check_model_profiles, check_no_bundled_agents


REPOSITORY_ROOT = Path(__file__).resolve().parent.parent


class ModelBudgetValidationTest(unittest.TestCase):
    def setUp(self):
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.root = Path(self.workspace.name)
        self.skills = self.root / "skills"
        self.profiles = self.skills / "polaris" / "references" / "model-profiles"
        shutil.copytree(REPOSITORY_ROOT / "skills/polaris/references/model-profiles", self.profiles)

    def test_complete_profiles_are_accepted(self):
        self.assertEqual([], check_model_profiles(self.skills))

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



class BundledAgentValidationTest(unittest.TestCase):
    def setUp(self):
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.root = Path(self.workspace.name)
        shutil.copy(REPOSITORY_ROOT / "plugin.json", self.root / "plugin.json")
        for directory in (".claude-plugin", ".factory-plugin"):
            shutil.copytree(REPOSITORY_ROOT / directory, self.root / directory)

    def test_clean_tree_is_accepted(self):
        self.assertEqual([], check_no_bundled_agents(self.root))

    def test_bundled_agent_folder_is_rejected(self):
        for name in ("agents", "droids", "com.anthropic.claude-code"):
            with self.subTest(folder=name):
                folder = self.root / name
                folder.mkdir()
                self.assertTrue(check_no_bundled_agents(self.root))
                folder.rmdir()

    def test_manifest_agents_field_is_rejected(self):
        for name in ("plugin.json", ".claude-plugin/plugin.json", ".factory-plugin/plugin.json"):
            with self.subTest(manifest=name):
                manifest = self.root / name
                original = manifest.read_text()
                config = json.loads(original)
                config["agents"] = ["./agents/example.md"]
                manifest.write_text(json.dumps(config))
                self.assertTrue(check_no_bundled_agents(self.root))
                manifest.write_text(original)


class DocumentReferenceValidationTest(unittest.TestCase):
    def setUp(self):
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.skills = Path(self.workspace.name) / "skills"
        self.skill = self.skills / "example"
        self.references = self.skill / "references"
        self.references.mkdir(parents=True)
        (self.references / "models.md").write_text("# Models\n\n## Agent definitions\n")

    def check_document(self, text):
        from check_plugin import check_links
        (self.references / "caller.md").write_text(text)
        return check_links(self.skills)

    def test_document_relative_links_and_existing_headings_are_accepted(self):
        self.assertEqual([], self.check_document(
            "[Definitions](models.md#agent-definitions)\n`models.md#agent-definitions`\n"))

    def test_missing_heading_is_rejected_in_links_and_code_spans(self):
        for reference in ("[Definitions](models.md#missing)", "`models.md#missing`"):
            with self.subTest(reference=reference):
                self.assertTrue(self.check_document(reference))

    def test_skill_root_fallback_is_rejected(self):
        self.assertTrue(self.check_document("`references/models.md`"))

    def test_bare_filename_in_another_directory_is_rejected(self):
        (self.skill / "other.md").write_text("# Other\n")
        self.assertTrue(self.check_document("Read `other.md`."))

    def test_link_labels_and_output_filenames_are_not_references(self):
        self.assertEqual([], self.check_document(
            "Read [`definitions.md`](models.md). Write `NOTES.md`. Use a `SKILL.md` file.\n"))


if __name__ == "__main__":
    unittest.main()
