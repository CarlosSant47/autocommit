import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

const APP_DIR = path.join(os.homedir(), ".local", "share", "copilot-api")

const GITHUB_TOKEN_PATH = path.join(APP_DIR, "github_token")
const APP_CONFIG_PATH = path.join(APP_DIR, "app_config.json")

export const PATHS = {
  APP_DIR,
  GITHUB_TOKEN_PATH,
  APP_CONFIG_PATH,
}

export async function ensurePaths(): Promise<void> {
  await fs.mkdir(PATHS.APP_DIR, { recursive: true })
  await ensureFile(PATHS.GITHUB_TOKEN_PATH)
  await ensureFile(
    PATHS.APP_CONFIG_PATH,
    JSON.stringify({
      url: "https://api.github.com",
      token: "",
      model: "",
      systemPrompt: "",
      maxTokens: 0,
      temperature: 0.2,
    }),
  )
}

async function ensureFile(
  filePath: string,
  initalContent: string = "",
): Promise<void> {
  try {
    if (await fileExists(filePath)) {
      return
    }
    await fs.writeFile(filePath, initalContent, { flag: "a" })
  } catch (error) {
    console.warn(`File ${filePath} does not exist, creating it...`)
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
