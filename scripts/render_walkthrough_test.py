"""Tests for skills/walkthrough/scripts/render_walkthrough.py, the walkthrough page renderer."""

import contextlib
import copy
import importlib.util
import io
import json
import re
import tempfile
import unittest
from pathlib import Path

RENDERER_PATH = Path(__file__).resolve().parent.parent / "skills" / "walkthrough" / "scripts" / "render_walkthrough.py"


def _load_renderer():
    spec = importlib.util.spec_from_file_location("render_walkthrough", RENDERER_PATH)
    assert spec is not None and spec.loader is not None, f"cannot load {RENDERER_PATH}"
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


render_walkthrough = _load_renderer()

SIMULATOR = """<div class="sim" id="sim"><div class="sim-head"><h3>Retry simulator</h3></div>
<table><tbody id="sim-rows"></tbody></table></div>
<script>window.simulatorRan = true;</script>"""

WALKTHROUGH = {
    "title": "Retry payments <safely>",
    "rail_title": "Payment retries",
    "lede": "<p>Payments retry once on a timeout.</p>",
    "orientation": "<p>The checkout service calls the payment provider.</p>",
    "problem": "<p>A timeout charged some customers twice.</p>",
    "solution": "<p>Retries carry an idempotency key.</p>",
    "intuition": {"intro": "<p>One key per order.</p>"},
    "decisions": [{
        "group": "When to retry",
        "items": [{"choice": "Retry only with a key", "instead": "instead of retrying every POST",
                   "why": "The provider drops duplicates.", "section": "retry-policy"}],
    }],
    "tradeoffs": [{"name": "One retry", "kind": "deliberate", "text": "A second timeout fails the order."}],
    "map": [
        {"type": "band", "style": "edge", "label": "Payment provider", "items": ["drops duplicate keys"]},
        {"type": "arrow"},
        {"type": "nodes", "nodes": [{"section": "retry-policy", "title": "RetryPolicy", "text": "Decides when to retry.", "emphasis": True}]},
        {"type": "band", "section": "wiring", "label": "Config", "items": ["the retry flag"]},
    ],
    "changes_intro": "<p>Read 6.1 closely.</p>",
    "sections": [
        {"id": "retry-policy", "nav": "Retry policy", "title": "Deciding which requests to retry",
         "overview": "<p>Only keyed requests retry.</p>",
         "callouts": [{"kind": "warning", "label": "Warning", "text": "Old clients send no key."}],
         "look_closer": ["The timeout is 3 s."],
         "files": [{"path": "src/http/RetryPolicy.ts", "badge": "new", "summary": "Retries requests that carry an <code>Idempotency-Key</code>.",
                    "hunk": "+export function shouldRetry(r) {\n…\n-  return true;\n   return r.key != null;"}]},
        {"id": "wiring", "nav": "Wiring", "title": "Wiring and config", "overview": "<p>A flag.</p>",
         "files": [{"path": "config/flags.json", "summary": "Adds the retry flag."}]},
    ],
    "faq": [{"question": "What if the key is missing?", "answer": "<p>The request isn't retried.</p>"}],
    "quiz": [
        {"topic": "Core concept", "question": "A timeout happens. What then? </script><script>alert(1)</script>",
         "options": ["Retried once", "Fails", "Retried forever", "Charged twice"], "correct": 0, "why": "One retry."},
        {"topic": "Edge cases", "question": "No key?", "options": ["Retried", "Not retried", "Rejected", "Queued"], "correct": 1, "why": "No key, no retry."},
    ],
}


class RenderWalkthroughTest(unittest.TestCase):
    def setUp(self):
        self.data = copy.deepcopy(WALKTHROUGH)

    def problems_for(self, data):
        with self.assertRaises(render_walkthrough.WalkthroughError) as caught:
            render_walkthrough.validate_walkthrough(data)
        return caught.exception.problems

    def test_valid_walkthrough_renders_a_complete_page(self):
        page = render_walkthrough.render_walkthrough(self.data, SIMULATOR)

        self.assertNotIn("<!-- walkthrough:", page)
        self.assertIn("<title>Retry payments &lt;safely&gt;</title>", page)
        self.assertIn('<a href="#retry-policy"><span class="n">6.1</span><span>Retry policy</span></a>', page)
        self.assertIn('<a href="#retry-policy">See 6.1</a>', page)
        self.assertIn('<span class="s">6.1</span>', page)
        self.assertIn('href="#wiring"><span class="k">Config · 6.2</span>', page)
        self.assertIn('<span class="a">+export function shouldRetry(r) {</span>', page)
        self.assertIn('<span class="r">-  return true;</span>', page)
        self.assertIn('<span class="g">…</span>', page)
        self.assertIn('<div class="file nohunk">', page)
        self.assertIn('<span class="dir">src/http/</span><span class="file-name">RetryPolicy.ts</span>', page)
        self.assertIn('<span class="sum">Retries requests that carry an <code>Idempotency-Key</code>.</span>', page)
        self.assertIn('<a class="node emphasis" href="#retry-policy">', page)

    def test_decision_without_a_section_renders_without_a_link(self):
        del self.data["decisions"][0]["items"][0]["section"]

        page = render_walkthrough.render_walkthrough(self.data, SIMULATOR)

        decisions = page.split('class="decisions"')[1].split("</dl>")[0]
        self.assertIn("Retry only with a key", decisions)
        self.assertNotIn('class="where"', decisions)

    def test_page_renders_without_a_simulator(self):
        page = render_walkthrough.render_walkthrough(self.data)

        self.assertNotIn('class="sim"', page)
        self.assertIn('id="intuition"', page)

    def test_simulator_markup_sits_in_core_intuition_and_its_script_runs_last(self):
        page = render_walkthrough.render_walkthrough(self.data, SIMULATOR)

        intuition = page.split('id="intuition"')[1].split('id="map"')[0]
        self.assertIn('<div class="sim" id="sim">', intuition)
        self.assertNotIn("simulatorRan", intuition)
        self.assertGreater(page.index("window.simulatorRan"), page.index("window.walkthrough = {"))

    def test_simulator_style_block_stays_with_its_markup(self):
        fragment = '<div class="sim" id="sim"><style>.sk-pay { color: red; }</style><button class="sk-pay">Pay</button></div>'

        page = render_walkthrough.render_walkthrough(self.data, fragment)

        intuition = page.split('id="intuition"')[1].split('id="map"')[0]
        self.assertIn("<style>.sk-pay { color: red; }</style>", intuition)

    def test_quiz_text_cannot_close_its_script_element(self):
        page = render_walkthrough.render_walkthrough(self.data, SIMULATOR)

        quiz_block = re.search(r'<script type="application/json" id="walkthrough-quiz">(.*?)</script>', page, re.DOTALL)
        self.assertIsNotNone(quiz_block)
        quiz = json.loads(quiz_block.group(1) if quiz_block else "{}")
        self.assertEqual(quiz["questions"][0]["question"], WALKTHROUGH["quiz"][0]["question"])
        self.assertEqual(quiz["key"], "retry-payments-safely")

    def test_reports_every_problem_with_its_json_path(self):
        self.data["decisions"][0]["items"][0]["section"] = "missing-section"
        self.data["map"][2]["nodes"].append({"section": "retry-policy", "title": "Again", "text": "x"})
        self.data["sections"][1]["id"] = "faq"
        self.data["faq"][0]["answer"] = "<script>alert(1)</script>"
        self.data["tradeoffs"][0]["kind"] = "accidental"

        problems = self.problems_for(self.data)

        self.assertIn('decisions[0].items[0].section: must be the id of a section, got "missing-section"', problems)
        self.assertIn('map[2].nodes[1].section: "retry-policy" already has a map box; use one box per section', problems)
        self.assertIn('sections[1].id: "faq" is reserved; choose another id', problems)
        self.assertIn("faq[0].answer: must not contain <script>; put simulator code in the simulator file", problems)
        self.assertIn("tradeoffs[0].kind: must be one of deliberate, implicit", problems)

    def test_rejects_a_quiz_whose_right_answers_share_one_position(self):
        self.data["quiz"] = [
            {"topic": "t", "question": f"q{i}", "options": ["a", "b", "c", "d"], "correct": 0, "why": "w"} for i in range(3)
        ]

        self.assertIn("quiz: every right answer is in the same position; vary it between questions", self.problems_for(self.data))

    def test_rejects_a_question_without_four_options(self):
        self.data["quiz"][0]["options"] = ["Retried once", "Fails"]

        self.assertIn("quiz[0].options: must have 4 options: the right answer and three wrong ones", self.problems_for(self.data))

    def test_rejects_a_right_answer_outside_the_options(self):
        self.data["quiz"][1]["correct"] = 4

        self.assertIn("quiz[1].correct: must be the index of the right option", self.problems_for(self.data))

    def test_command_line_writes_nothing_and_prefixes_errors_when_input_is_invalid(self):
        self.data["title"] = ""
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "walkthrough.json"
            out = Path(folder) / "walkthrough.html"
            source.write_text(json.dumps(self.data))

            stderr = io.StringIO()
            with contextlib.redirect_stderr(stderr):
                code = render_walkthrough.main([str(source), "--out", str(out)])

            self.assertEqual(code, 1)
            self.assertFalse(out.exists())
            self.assertIn("walkthrough-render: title: must be a non-empty string", stderr.getvalue())

    def test_command_line_writes_the_page_when_input_is_valid(self):
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "walkthrough.json"
            simulator = Path(folder) / "simulator.html"
            out = Path(folder) / "walkthrough.html"
            source.write_text(json.dumps(self.data))
            simulator.write_text(SIMULATOR)

            with contextlib.redirect_stdout(io.StringIO()):
                code = render_walkthrough.main([str(source), "--simulator", str(simulator), "--out", str(out)])

            self.assertEqual(code, 0)
            self.assertIn("Deciding which requests to retry", out.read_text())



if __name__ == "__main__":
    unittest.main()
