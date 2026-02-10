import { useMutation, useQuery } from '@tanstack/react-query';
import axios from '../index'
import type { CustomUseMutationOptions, CustomUseQueryOptions } from '../types';
import type { IAuthResponse, ILoginPayload, IRegisterPayload, TGetUserRequest, TLoginRequest, TRegisterRequest, TUser } from "./types";
import { GET_USER } from './constants';


export const registerRequest: TRegisterRequest = async (payload) => await axios.post("/api/v1/auth/register", payload)

export const loginRequest: TLoginRequest = async (payload) => ((await axios.post("/api/v1/auth/login", payload)).data)

export const getUserRequest: TGetUserRequest = async () => await axios.get("/api/v1/auth/me")

export const useRegisterMutation = (options?: CustomUseMutationOptions<IRegisterPayload, IAuthResponse>) => {
    return useMutation({
        ...options,
        mutationFn: (payload: IRegisterPayload) => registerRequest(payload),
        onSuccess: (...args) => {
            options?.onSuccess?.(...args)
        }
    })
}

export const useLoginMutation = (options?: CustomUseMutationOptions<ILoginPayload, IAuthResponse>) => {
    return useMutation({
        ...options,
        mutationFn: (payload: ILoginPayload) => loginRequest(payload),
        onSuccess: (...args) => {
            options?.onSuccess?.(...args)
        }
    })
}

export const useGetUserQuery = (options?: CustomUseQueryOptions<TUser>) => {
    return useQuery({
        ...options,
        queryKey: [GET_USER],
        queryFn: () => getUserRequest(),
    })
}