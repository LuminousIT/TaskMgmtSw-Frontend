export interface IRegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface IAuthResponse {
    "user": TUser,
    "accessToken": string,
    "expiresIn": number
}

export type TUser = {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

export type TRegisterRequest = (data: IRegisterPayload) => Promise<IAuthResponse>

export interface ILoginPayload {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export type TLoginRequest = (data: ILoginPayload) => Promise<IAuthResponse>

export type TGetUserRequest = () => Promise<TUser>