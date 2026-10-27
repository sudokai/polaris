// Amp directory-plugin entry for polaris. The install copies the repository to
// `~/.config/amp/plugins/polaris/` and this file to that directory's `index.ts`, so
// `import.meta.dir` is the plugin root. Amp rejects skill paths that resolve outside
// the plugin directory, including through symbolic links, so the copy must be real.
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { PluginAPI } from '@ampcode/plugin'

export const description = 'polaris: a router skill, engineering principles, and playbooks. Registers each skill as polaris:<skill>.'

// Amp loads a plugin through its default export.
export default async function registerPolarisSkills(amp: PluginAPI) {
	const skillsDirectory = join(import.meta.dir, 'skills')
	const skillNames = readdirSync(skillsDirectory).filter((name) =>
		existsSync(join(skillsDirectory, name, 'SKILL.md')),
	)
	for (const skillName of skillNames) {
		await amp.registerSkill({ path: `skills/${skillName}` })
	}
}
