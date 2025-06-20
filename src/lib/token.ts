import consola from "consola"
import fs from "node:fs/promises"

import { PATHS } from "~/lib/paths"
import { getCopilotToken } from "~/services/github/get-copilot-token"
import { getDeviceCode } from "~/services/github/get-device-code"
import { getGitHubUser } from "~/services/github/get-user"
import { pollAccessToken } from "~/services/github/poll-access-token"

import { HTTPError } from "./http-error"
import { state } from "./state"
import { readAppConfig, writeAppConfig, type Token } from "~/config"
import { config, exit } from 'node:process';

export const readGithubToken = () =>
  fs.readFile(PATHS.GITHUB_TOKEN_PATH, "utf8")

const writeGithubToken = (token: string) =>
  fs.writeFile(PATHS.GITHUB_TOKEN_PATH, token)



export const setupCopilotToken = async () => {
  const appConfig = await readAppConfig()
  if(await validateGitHubToken(appConfig.token)) {
    const { accessToken } = appConfig.token ?? {}
    state.copilotToken = accessToken
    return
  }
  const { token, expires_at, refresh_in } = await getCopilotToken()
  if (!token) {
    consola.error("Failed to get GitHub Copilot token")
    exit(1)
  }
  state.copilotToken = token
  appConfig.token = {
    accessToken: token,
    refreshToken: refresh_in,
    expiresIn: expires_at,
  }
  await writeAppConfig(appConfig)
  return 
}


export const validateGitHubToken = async (token?: Token): Promise<boolean> => {
  if (!token) {
    return false
  }
  const { expiresIn } = token
  if((Date.now() / 1000) > (expiresIn || 0)) {
    consola.warn("GitHub token has expired, re-authenticating...")
    return false
  }
  return true
}

interface SetupGitHubTokenOptions {
  force?: boolean
}

export async function setupGitHubToken(
  options?: SetupGitHubTokenOptions,
): Promise<void> {
  try {
    const githubToken = await readGithubToken()

    if (githubToken && !options?.force) {
      state.githubToken = githubToken
      await logUser()
      return
    }

    consola.info("Not logged in, getting new access token")
    const response = await getDeviceCode()
    consola.debug("Device code response:", response)

    consola.info(
      `Please enter the code "${response.user_code}" in ${response.verification_uri}`,
    )

    const token = await pollAccessToken(response)
    await writeGithubToken(token)
    state.githubToken = token

    await logUser()
  } catch (error) {
    if (error instanceof HTTPError) {
      consola.error("Failed to get GitHub token:", await error.response.json())
      throw error
    }

    consola.error("Failed to get GitHub token:", error)
    throw error
  }
}

async function logUser() {
  const user = await getGitHubUser()
  consola.info(`Logged in as ${user.login}`)
}
