import consola from "consola"

import { getModels } from "~/services/copilot/get-models"

import { state } from "./state"
import { setupCopilotToken } from "./token"

export async function cacheModels(): Promise<void> {
  await setupCopilotToken()
  const models = await getModels()
  state.models = models

  consola.info(
    `Available models: \n${models.data.map((model) => `- ${model.id}`).join("\n")}`,
  )
}
