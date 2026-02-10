import { AxiosError } from 'axios';
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

type TError = any;

export type CustomUseMutationOptions<TRequest = unknown, TResponse = unknown> = Omit<
    UseMutationOptions<TResponse, AxiosError<TError>, TRequest>,
    'mutationFn'
>;

export type CustomUseQueryOptions<TResponse = unknown, TErr = TError> = Omit<
    UseQueryOptions<TResponse, AxiosError<TErr>, TResponse, any>,
    'queryKey' | 'queryFn'
>;