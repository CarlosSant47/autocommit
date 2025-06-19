/* eslint-disable @typescript-eslint/no-unused-vars */

import { defineCommand } from "citty"
import clipboardy from "clipboardy"
import consola from "consola"
import { spawnSync } from "node:child_process"

import { readAppConfig } from "./config"
import {setupCopilotToken, setupGitHubToken} from "./lib/token"
import {
  createChatCompletions,
  type ChatCompletionResponse,
  type ChatCompletionsPayload,
} from "./services/copilot/create-chat-completions"
import { exit } from "node:process"

export interface AutocommitOptions {
  directory: string
  systemPrompt: string
}

export async function runAutocommit(options: AutocommitOptions): Promise<void> {
  await setupGitHubToken()
  await setupCopilotToken()
  const stagedChanges = spawnSync("git", ["diff", "--cached", "--quiet"])
  if (stagedChanges.status === 0) {
    consola.error("No staged files to commit.")
    exit(1)
  }
  const commitVerbose = spawnSync("git", ["commit", "-v", "--dry-run"], {})
  const { stdout, stderr } = commitVerbose
  const appConfig = await readAppConfig()
  const request: ChatCompletionsPayload = {
    messages: [
      {
        role: "system",
        content: appConfig.systemPrompt,
      },
      {
        role: "user",
        content: stdout.toString(),
      },
    ],
    temperature: appConfig.temperature || 0.7,
    model: appConfig.model || "gpt-3.5-turbo",
    stream: false,
  }
  const result: ChatCompletionResponse = (await createChatCompletions(
    request,
  )) as ChatCompletionResponse
  if (result.choices.length === 1) {
    const commitMessage = result.choices[0].message.content.trim()
    consola.info("Generated commit message:\n", commitMessage)
    const options = [
      { label: "Apply commit message", value: "apply" },
      { label: "Copy commit message", value: "copy" },
    ]
    const selectedOption = await consola.prompt("Select an option", {
      type: "select",
      options,
      message: "What do you want to do with the commit message?",
    })
    executeAutocommitOptions(selectedOption, commitMessage)
  }
  exit(0)
}

export function executeAutocommitOptions(
  selectedOption: string,
  response: string,
): void {
  switch (selectedOption) {
    case "copy": {
      copyToClipboard(response)
      break
    }
    default: {
      consola.error("Invalid option selected.")
    }
  }
}

// Generate Copy to Clipboard Function
export function copyToClipboard(text: string): void {
  try {
    clipboardy.writeSync(text)
  } catch (error) {
    consola.error("Failed to copy to clipboard:", error)
  }
}

export const commit = defineCommand({
  meta: {
    name: "commit",
    description: "Run autocommit",
  },
  args: {
    directory: {
      alias: "d",
      type: "string",
      default: ".",
      description: "Directory to watch for changes",
    },
    systemPrompt: {
      alias: "s",
      type: "string",
      default:
        "You are a useful assistant that helps the user to generate sde commit message based on the conventional git commit standard. ",
      description: "System prompt for the assistant",
    },
  },
  run({ args }) {
    const { directory, systemPrompt } = args
    return runAutocommit({ directory, systemPrompt })
  },
})
