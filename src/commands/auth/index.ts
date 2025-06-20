
import { defineCommand } from "citty"
import consola from "consola"
import { githubConstants } from "~/const/githubConstants"
import { readGithubToken, getGithubUser, getDeviceCode, getAccesToken, writeGithubToken } from "~/services/github"
import { polling } from "~/utils/polling"
import type { RunAuthCommandOptions } from "./authCommandTypes"



const command = async(force?: boolean) => {
  const githubTokenExists = await readGithubToken()

  //If token exists only gen the user
  if(githubTokenExists && !force) {
    const getGithubUserResult = await getGithubUser()
    if(getGithubUserResult.isErr()){
      consola.error(getGithubUserResult.error.message)
      process.exit(-1)
    }
    return
  }


  const getDeviceResult = await getDeviceCode({
    client_id: githubConstants.GITHUB_CLIENT_ID,
    scope: githubConstants.GITHUB_APP_SCOPES
  })

  if(getDeviceResult.isErr()) {
    consola.error(getDeviceResult.error.message)
    process.exit(-1)
  }

  const getAccessTokenResult = await polling({
    task: () => getAccesToken({
      client_id: githubConstants.GITHUB_CLIENT_ID,
      device_code: getDeviceResult.value.device_code,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code"
    }),
    validate: (result) => {
      if(result.isOk()) return true
      return true
    },
    intervalMS: getDeviceResult.value.interval,
    timeoutMs: 3000
  })


  if(getAccessTokenResult.isErr()) {
    consola.error(getAccessTokenResult.error.message)
    process.exit(-1)
  }
  await writeGithubToken(getAccessTokenResult.value.access_token)
}


const runCommand = async ({verbose}: RunAuthCommandOptions) => {
    if(verbose) {
        consola.level = 5
        consola.info("Verbose loggin  enabled")
    }
    await command()
}


export const auth = defineCommand({
    meta: {
        name: "auth",
        description: "Run a Github auth"
    },
     args: {
    verbose: {
      alias: "v",
      type: "boolean",
      default: false,
      description: "Enable verbose logging",
    },
  },
  run: ({args}) => runCommand({verbose: args.verbose})
})