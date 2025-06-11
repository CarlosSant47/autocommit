import { defineCommand } from "citty"
import consola from "consola"
import { exec } from "node:child_process"
import fs from "node:fs/promises"

import { ensurePaths, PATHS } from "~/lib/paths"

import { getModels } from "./services/copilot/get-models"

export interface AppConfig {
  url: string
  token: string
  model: string
  systemPrompt: string
  maxTokens: number
  temperature: number
}

export const readAppConfig = async (): Promise<AppConfig> => {
  try {
    await ensurePaths()
    const appConfigContent = (await fs.readFile(
      PATHS.APP_CONFIG_PATH,
    )) as unknown as string
    return JSON.parse(appConfigContent) as AppConfig
  } catch (error) {
    consola.error("Failed to read app config:", error)
    throw error
  }
}

export const writeAppConfig = async (config: AppConfig): Promise<void> => {
  await fs.writeFile(
    PATHS.APP_CONFIG_PATH,
    JSON.stringify(config, null, 2),
    "utf8",
  )
}

export async function runConfig(): Promise<void> {}
export function openGlobalConfig(): void {
  const absolutePath = PATHS.APP_DIR
  let command
  switch (process.platform) {
    case "darwin": {
      // macOS
      command = `open "${absolutePath}"`
      break
    }
    case "win32": {
      // Windows
      command = `start "" "${absolutePath}"`
      break
    }
    case "linux": {
      // Linux
      command = `xdg-open "${absolutePath}"`
      break
    }
    default: {
      throw new Error("Unsupported platform")
    }
  }

  exec(command, (error) => {
    if (error) {
      console.error("Error opening folder:", error)
    }
  })
}

export async function selectModel(model: string): Promise<void> {
  if (!model) {
    consola.info(`Selecting default model`)
    const models = await getModels()

    const options = models.data.map((m) => ({
      value: m.id,
      label: m.id,
    }))
    const selectedModel = await consola.prompt("Available Models", {
      type: "select",
      options,
      message: "Select a model for autocommit",
    })

    if (!selectedModel) {
      consola.error("No model selected")
      return
    }
    const config = await readAppConfig()
    config.model = selectedModel
    await writeAppConfig(config)
    consola.ready(`Selected model: ${selectedModel}`)
  }
}

export const globalConfigCommand = defineCommand({
  meta: {
    name: "global",
    description: "Open global autocommit configuration",
  },
  run() {
    openGlobalConfig()
  },
})

export const selectModelCommand = defineCommand({
  meta: {
    name: "model",
    description: "Select a model for autocommit",
  },
  args: {
    model: {
      type: "string",
      description: "Model to select for autocommit",
      required: false,
    },
  },
  run({ args }) {
    const model = args.model || ""
    return selectModel(model)
  },
})

export const config = defineCommand({
  meta: {
    name: "config",
    description: "Manage autocommit configuration",
  },

  subCommands: {
    global: globalConfigCommand,
    model: selectModelCommand,
  },
  run({ args }) {
    if (args._.length === 0) {
      consola.info("No subcommand provided")
      return
    }
    return runConfig()
  },
})
