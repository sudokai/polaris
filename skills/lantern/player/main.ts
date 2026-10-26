// Entry point of the player built for this skill: Lantern's player without its guide.
// scripts/build-lantern-bundle.sh copies this file into Lantern's app/ directory, next to player.ts.
import { mountPlayer } from './player.ts';

mountPlayer(document.querySelector('main')!);
