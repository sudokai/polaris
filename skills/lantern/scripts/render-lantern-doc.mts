// Turn a Lantern doc scene (vendor/DOC-FORMAT.md) into a player page, plus frames to check it with.
//   node render-lantern-doc.mts <doc.json> <out-dir>
// Writes player.html: the animation, playable offline in a browser. For checks, it also writes,
// for each step, <step>.svg (the frame the step leaves on screen) and <step>.txt (the same frame
// as text, plus the state the step changed), trace.json, and motion.txt. Exits 1 on motion problems.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [docPath, outDir] = process.argv.slice(2);
if (!docPath || !outDir) {
  console.error('usage: node render-lantern-doc.mts <doc.json> <out-dir>');
  process.exit(2);
}
const vendor = new URL('../vendor/', import.meta.url);
const lantern = await import(new URL('lantern.mjs', vendor).href);
const { sceneFromDoc, traceScene, renderAt, renderText, toSvgString, MotionSink, analyzeMotion, summarizeMotion } = lantern;

const doc = JSON.parse(readFileSync(docPath, 'utf8'));
const Scene = sceneFromDoc(doc);
const trace = await traceScene(Scene);
mkdirSync(outDir, { recursive: true });

const escapeHtml = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
// "<" as < keeps the JSON from closing its <script> element early.
const docJson = JSON.stringify(doc).replace(/</g, '\\u003c');
const player = readFileSync(new URL('player.html', vendor), 'utf8')
  .replace('__LANTERN_TITLE__', () => escapeHtml(doc.title ?? 'Lantern scene'))
  .replace('__LANTERN_DOC__', () => docJson);
writeFileSync(join(outDir, 'player.html'), player);

writeFileSync(join(outDir, 'trace.json'), JSON.stringify(trace, null, 2));
for (const step of trace.steps) {
  const t = Math.max(step.t0, (step.t1 ?? trace.duration) - 0.001);
  const scene = await renderAt(Scene, t, { async frame() {} });
  const changed = Object.keys({ ...step.before, ...step.after })
    .filter((k) => JSON.stringify(step.before?.[k]) !== JSON.stringify(step.after?.[k]))
    .map((k) => `${k}: ${JSON.stringify(step.before?.[k])} → ${JSON.stringify(step.after?.[k])}`);
  const file = step.step.replace(/[^\w.-]/g, '_');
  writeFileSync(join(outDir, `${file}.svg`), toSvgString(scene));
  writeFileSync(join(outDir, `${file}.txt`), `${renderText(scene)}\n\nstep ${step.step} · t=${t.toFixed(2)}s\n${changed.join('\n')}\n`);
}

const sink = new MotionSink();
await new Scene(sink).run();
const events = analyzeMotion(sink);
const report = summarizeMotion(events)
  .map((g: { t: number; kind: string; count: number; step?: string; examples: string[] }) => `${g.t.toFixed(2)}s ${g.kind} ×${g.count} [${g.step ?? '-'}] ${g.examples[0]}`);
writeFileSync(join(outDir, 'motion.txt'), report.join('\n') + '\n');

console.log(`${trace.steps.length} steps, ${trace.duration}s: ${trace.steps.map((s: { step: string }) => s.step).join(', ')}`);
console.log(events.length ? `motion: ${events.length} problems, see motion.txt\n${report.join('\n')}` : 'motion: clean');
console.log(`wrote ${join(outDir, 'player.html')}`);
process.exitCode = events.length ? 1 : 0;
