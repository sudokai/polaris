"""Behavior checks for the plugin validator.

Run: python3 -m unittest discover -s scripts -p '*_test.py'
"""

import json
from pathlib import Path
import shutil
import tempfile
import unittest

from check_plugin import check_no_bundled_agents


REPOSITORY_ROOT = Path(__file__).resolve().parent.parent


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


class SelfContainedSkillTest(unittest.TestCase):
    def setUp(self):
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.skills = Path(self.workspace.name) / "skills"
        for name in ("example", "sibling", "polaris"):
            (self.skills / name / "references").mkdir(parents=True)
            (self.skills / name / "references" / "notes.md").write_text("# Notes\n")

    def check_skill(self, name, text):
        from check_plugin import check_self_contained_skills
        (self.skills / name / "SKILL.md").write_text(text)
        return check_self_contained_skills(self.skills)

    def test_links_inside_the_skill_folder_are_accepted(self):
        self.assertEqual([], self.check_skill("example", "[Notes](references/notes.md) and `./references/notes.md`\n"))

    def test_links_into_a_sibling_skill_are_reported(self):
        for reference in ("[Notes](../sibling/references/notes.md)", "`../sibling/references/notes.md`"):
            with self.subTest(reference=reference):
                self.assertTrue(self.check_skill("example", reference + "\n"))

    def test_links_out_of_the_plugin_are_reported(self):
        self.assertTrue(self.check_skill("example", "[Install](../../README.md#install)\n"))

    def test_coordinator_may_link_into_sibling_skills(self):
        self.assertEqual([], self.check_skill("polaris", "[Notes](../sibling/references/notes.md)\n"))

    def test_paths_in_code_blocks_are_not_links(self):
        self.assertEqual([], self.check_skill("example", "```sh\ncat ../sibling/references/notes.md\n```\n"))


class GeneratedCopyTest(unittest.TestCase):
    COPIES = {"reader/references/views.md": "views/SKILL.md"}

    def setUp(self):
        from check_plugin import generated_copy_text
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.skills = Path(self.workspace.name) / "skills"
        (self.skills / "views").mkdir(parents=True)
        (self.skills / "reader" / "references").mkdir(parents=True)
        self.source = self.skills / "views" / "SKILL.md"
        self.copy = self.skills / "reader" / "references" / "views.md"
        self.source.write_text("---\nname: views\ndescription: Views.\n---\n\n# Views\n\nDraw a call tree.\n")
        self.copy.write_text(generated_copy_text(self.source.read_text()))

    def check(self):
        from check_plugin import check_generated_copies
        return check_generated_copies(self.skills, self.COPIES)

    def test_copy_matching_its_source_is_accepted(self):
        self.assertEqual([], self.check())

    def test_copy_keeps_the_body_and_drops_the_frontmatter(self):
        self.assertEqual("# Views\n\nDraw a call tree.\n", self.copy.read_text())

    def test_copy_is_reported_after_its_source_changes(self):
        self.source.write_text(self.source.read_text() + "\nDraw a data flow.\n")
        self.assertTrue(self.check())

    def test_edited_copy_is_reported(self):
        self.copy.write_text(self.copy.read_text() + "\nA local edit.\n")
        self.assertTrue(self.check())

    def test_missing_copy_is_reported(self):
        self.copy.unlink()
        self.assertTrue(self.check())

    def sync(self):
        from sync_generated_copies import sync_generated_copies
        return sync_generated_copies(self.skills, self.COPIES)

    def test_sync_rewrites_stale_and_missing_copies_until_the_check_passes(self):
        for break_copy in (lambda: self.copy.write_text("A local edit.\n"), self.copy.unlink):
            with self.subTest(break_copy=break_copy):
                break_copy()
                self.assertEqual([self.copy], self.sync())
                self.assertEqual([], self.check())

    def test_sync_leaves_current_copies_alone(self):
        self.assertEqual([], self.sync())


class SkillNameTest(unittest.TestCase):
    def setUp(self):
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.root = Path(self.workspace.name)
        for base, name in (("skills", "why"), (".agents/skills", "sync-pstack")):
            (self.root / base / name).mkdir(parents=True)
            (self.root / base / name / "SKILL.md").write_text(f"---\nname: {name}\n---\n")

    def check(self, text):
        from check_plugin import check_skill_names
        (self.root / "skills" / "why" / "guide.md").write_text(text)
        return check_skill_names(self.root)

    def test_existing_bundled_and_maintainer_skills_are_accepted(self):
        self.assertEqual([], self.check(
            "Use the `why` skill, then `polaris:why`. Run the `sync-pstack` skill.\n- **Asked why** → `why`.\n"))

    def test_slash_commands_for_existing_skills_and_the_harness_are_accepted(self):
        self.assertEqual([], self.check("Run `/why` or `/why <question>`, then `/model`.\n"))

    def test_missing_skill_is_reported_in_each_phrasing(self):
        for text in ("Use the `tdd` skill.", "Run `polaris:tdd`.", "- **A bug** → `tdd`.",
                     "Point at `/tdd`.", "Run `/tdd <claim>`."):
            with self.subTest(text=text):
                self.assertTrue(self.check(text + "\n"))

    def test_bare_backticked_words_are_not_skill_names(self):
        self.assertEqual([], self.check("Show it as a `diff` block with `git`.\n"))

    def test_names_in_code_blocks_are_ignored(self):
        self.assertEqual([], self.check("```text\nthe `tdd` skill\n```\n"))


class SkillInventoryTest(unittest.TestCase):
    NAMES = ("why", "prove-it", "diagnose", "deslop", "show-me")

    def setUp(self):
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.root = Path(self.workspace.name)
        for name in self.NAMES + ("polaris", "engineering-principles"):
            (self.root / "skills" / name).mkdir(parents=True)
            (self.root / "skills" / name / "SKILL.md").write_text(f"---\nname: {name}\n---\n")

    def check(self, text, path="README.md"):
        from check_plugin import check_skill_inventories
        (self.root / path).write_text(text)
        return check_skill_inventories(self.root)

    def test_counts_of_skills_principles_and_playbooks_are_rejected(self):
        for text in ("Read the 24 engineering principles.", "Seventeen skills start on their own.",
                     "It ships twenty-two skills.", "Use one of 5 playbooks."):
            with self.subTest(text=text):
                self.assertTrue(self.check(text + "\n"))

    def test_small_counts_in_ordinary_prose_are_accepted(self):
        self.assertEqual([], self.check("A dependency between two skills is a named result.\n"))

    def test_a_line_naming_four_skills_is_rejected(self):
        self.assertTrue(self.check("Use `why`, `prove-it`, `diagnose`, and `deslop`.\n"))

    def test_a_short_sequence_of_skills_is_accepted(self):
        self.assertEqual([], self.check("Run `deslop`, then `why`, then `/prove-it`.\n"))

    def test_router_and_principles_index_may_list_skills(self):
        listing = "Use `why`, `prove-it`, `diagnose`, and `deslop`. It indexes 24 principles.\n"
        for path in ("skills/polaris/SKILL.md", "skills/engineering-principles/SKILL.md"):
            with self.subTest(path=path):
                self.assertEqual([], self.check(listing, path))

    def test_lists_in_code_blocks_are_ignored(self):
        self.assertEqual([], self.check("```text\n`why` `prove-it` `diagnose` `deslop`\n```\n"))


class InvocationSettingTest(unittest.TestCase):
    def setUp(self):
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.skills = Path(self.workspace.name) / "skills"
        self.skill = self.skills / "example"
        (self.skill / "agents").mkdir(parents=True)

    def check(self, hidden, sidecar=None):
        from check_plugin import check_invocation
        flag = "disable-model-invocation: true\n" if hidden else ""
        (self.skill / "SKILL.md").write_text(f"---\nname: example\ndescription: Example.\n{flag}---\n")
        sidecar_file = self.skill / "agents" / "openai.yaml"
        if sidecar is None:
            sidecar_file.unlink(missing_ok=True)
        else:
            sidecar_file.write_text(f"policy:\n  allow_implicit_invocation: {sidecar}\n")
        return check_invocation(self.skills)

    def test_matching_settings_are_accepted(self):
        self.assertEqual([], self.check(hidden=True, sidecar="false"))
        self.assertEqual([], self.check(hidden=False, sidecar="true"))

    def test_visible_skill_needs_no_sidecar(self):
        self.assertEqual([], self.check(hidden=False))

    def test_hidden_skill_must_also_be_hidden_from_codex(self):
        self.assertTrue(self.check(hidden=True))
        self.assertTrue(self.check(hidden=True, sidecar="true"))

    def test_visible_skill_must_not_be_hidden_from_codex(self):
        self.assertTrue(self.check(hidden=False, sidecar="false"))


if __name__ == "__main__":
    unittest.main()
