import axios from "axios";
import { githubConstants } from "~/const/githubConstants";

/**
 * Create a instance for Github api service
 */
export const githubApi = axios.create({
    baseURL: githubConstants.GITHUB_URL,
    headers: {
        "content-type": "application/json",
        "editor-plugin-version": "copilot-chat/0.24.1",
        "user-agent": "GitHubCopilotChat/0.24.1",
        "x-github-api-version": "2024-12-15",
        "x-vscode-user-agent-library-version": "electron-fetch",
    }
})