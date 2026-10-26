// Stands in for Lantern's scenes/index.ts when the player is built for this skill.
// The player shows the one scene embedded in its page as JSON, in the
// <script id="lantern-doc"> element that scripts/render-lantern-doc.mts fills in.
import { sceneFromDoc } from '../src/index.ts';
import type { Doc, SceneClass } from '../src/index.ts';

export interface SceneEntry { label: string; Scene: SceneClass }

const doc = JSON.parse(document.getElementById('lantern-doc')!.textContent!) as Doc;

export const SCENES: Record<string, SceneEntry> = {
  scene: { label: doc.title ?? 'Scene', Scene: sceneFromDoc(doc) },
};
