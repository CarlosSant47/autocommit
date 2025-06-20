import type { Result } from "neverthrow"

/**
 * Github Api Service Responses
 */
export type GetUserReponse = {
    login: string
}

export type GetDeviceCodeResponse = {
    device_code: string
    user_code: string
    verification_uri: string
    expires_in: number
    interval: number
}

export type GetAccessTokenResponse = {
    access_token: string
    token_type: string
    scope: string
}


/**
 * Github Api Service Request
 */
export type GetDeviceCodeRequest = {
    client_id: string
    scope: string
}

export type GetAccessTokenRequest = {
    client_id: string,
    device_code: string,
    grant_type: string
}


/**
 * Github Api Service Results
 */
export type GetUserResult = Result<GetUserReponse, Error>
export type GetDeviceCodeResult = Result<GetDeviceCodeResponse, Error>
export type GetAccessTokenResult = Result<GetAccessTokenResponse, Error>