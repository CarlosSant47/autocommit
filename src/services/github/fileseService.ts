import fs from 'fs/promises'
import { PATHS } from '~/lib/paths'

export const readGithubToken = async ()  => {
    const result = await fs.readFile(PATHS.GITHUB_TOKEN_PATH, "utf8")
    return result
}

export const writeGithubToken = async(token: string) => {
    await fs.writeFile(PATHS.GITHUB_TOKEN_PATH, token)
}