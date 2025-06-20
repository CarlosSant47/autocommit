import { githubApi } from "~/api";
import { err, ok } from "neverthrow";
import type { 
    GetUserReponse, 
    GetUserResult, 
    GetDeviceCodeResponse,
    GetDeviceCodeRequest, 
    GetDeviceCodeResult,
    GetAccessTokenRequest, 
    GetAccessTokenResult
} from "./types";


/**
 * Get the user from Github
 */
export const getGithubUser = async(): Promise<GetUserResult> => {
    try{
        const {data} = await githubApi.get<GetUserReponse>('/user')
       return ok(data)
    }catch(error) {
        return err(error as Error)
    }
}

/**
 * Get device code from Github
 */
export const getDeviceCode = async({client_id, scope}: GetDeviceCodeRequest): Promise<GetDeviceCodeResult> => {
    try {
        const {data} = await githubApi.post<GetDeviceCodeResponse>('/login/device/code', {
            client_id,
            scope,    
        })
        return ok(data)
    }catch(error) {
        return err(error as Error)
    }
}

/**
 * Get access token from Github
 */
export const getAccesToken = async({client_id, device_code, grant_type}: GetAccessTokenRequest): Promise<GetAccessTokenResult> => {
    try {
        const {data} = await githubApi.post('/login/oauth/access_token', {
            device_code,
            client_id,
            grant_type
        })
        return ok(data)
    }catch(error) {
        return err(error as Error)
    }
}