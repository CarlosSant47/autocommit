import { defineCommand, runMain } from "citty"

import { auth } from "./auth"
import { commit } from "./autocommit"
import { config } from "./config"
import { ensurePaths } from "./lib/paths"
import { cacheVSCodeVersion } from "./lib/vscode-version"

export async function bootstrap(): Promise<void> {
  await ensurePaths()
  await cacheVSCodeVersion()
}

const main = defineCommand({
  meta: {
    name: "autocommit",
    description:
      "Generate commit messages using AI Providers(GitHub Copilot, OpenAI, etc.)",
  },
  subCommands: { auth, commit, config },
})
await bootstrap()

await runMain(main)
