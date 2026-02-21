import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../index";
import type { CustomUseMutationOptions, CustomUseQueryOptions } from "../types";
import type {
    ICreateTagPayload,
    ICreateTagResponse,
    ICreateTaskPayload,
    ICreateTaskResponse,
    IDeleteTagResponse,
    IDeleteTaskResponse,
    IGetTasksParams,
    IGetTasksResponse,
    ITag,
    IUpdateTagPayload,
    IUpdateTagResponse,
    IUpdateTaskPayload,
    IUpdateTaskResponse,
    TCreateTagRequest,
    TCreateTaskRequest,
    TDeleteTagRequest,
    TDeleteTaskRequest,
    TGetTasksRequest,
    TGetTagsRequest,
    IResolveConflictPayload,
    IResolveConflictResponse,
    TResolveConflictRequest,
    TUpdateTagRequest,
    TUpdateTaskRequest,
} from "./types";
import { GET_TAGS, GET_TASKS } from "./constants";

export const createTaskRequest: TCreateTaskRequest = async (payload) =>
    (await axios.post("/api/v1/tasks", payload)).data;

export const getTagsRequest: TGetTagsRequest = async () =>
    (await axios.get("/api/v1/tags")).data;

export const getTasksRequest: TGetTasksRequest = async (params) =>
    (await axios.get("/api/v1/tasks", { params })).data;

export const useCreateTaskMutation = (
    options?: CustomUseMutationOptions<ICreateTaskPayload, ICreateTaskResponse>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        ...options,
        mutationFn: (payload: ICreateTaskPayload) => createTaskRequest(payload),
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: [GET_TASKS] });
            options?.onSuccess?.(...args);
        },
    });
};

export const useGetTasksQuery = (
    params?: IGetTasksParams,
    options?: CustomUseQueryOptions<IGetTasksResponse>
) => {
    return useQuery({
        ...options,
        refetchOnWindowFocus: false,
        queryKey: [GET_TASKS, params],
        queryFn: () => getTasksRequest(params),
    });
};

export const createTagRequest: TCreateTagRequest = async (payload) =>
    (await axios.post("/api/v1/tags", payload)).data;

export const useGetTagsQuery = (options?: CustomUseQueryOptions<ITag[]>) => {
    return useQuery({
        ...options,
        queryKey: [GET_TAGS],
        queryFn: async () => {
            const response = await getTagsRequest();
            return response.tags;
        },
    });
};

export const useCreateTagMutation = (
    options?: CustomUseMutationOptions<ICreateTagPayload, ICreateTagResponse>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        ...options,
        mutationFn: (payload: ICreateTagPayload) => createTagRequest(payload),
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: [GET_TAGS] });
            options?.onSuccess?.(...args);
        },
    });
};

export const updateTagRequest: TUpdateTagRequest = async (id, payload) =>
    (await axios.patch(`/api/v1/tags/${id}`, payload)).data;

export const deleteTagRequest: TDeleteTagRequest = async (id) =>
    (await axios.delete(`/api/v1/tags/${id}`)).data;

export const useUpdateTagMutation = (
    options?: CustomUseMutationOptions<{ id: string } & IUpdateTagPayload, IUpdateTagResponse>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        ...options,
        mutationFn: ({ id, ...payload }: { id: string } & IUpdateTagPayload) =>
            updateTagRequest(id, payload),
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: [GET_TAGS] });
            options?.onSuccess?.(...args);
        },
    });
};

export const useDeleteTagMutation = (
    options?: CustomUseMutationOptions<string, IDeleteTagResponse>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        ...options,
        mutationFn: (id: string) => deleteTagRequest(id),
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: [GET_TAGS] });
            options?.onSuccess?.(...args);
        },
    });
};

export const updateTaskRequest: TUpdateTaskRequest = async (id, payload) =>
    (await axios.patch(`/api/v1/tasks/${id}`, payload)).data;

export const deleteTaskRequest: TDeleteTaskRequest = async (id, data) =>
    (await axios.delete(`/api/v1/tasks/${id}`, { data })).data;

export const useUpdateTaskMutation = (
    options?: CustomUseMutationOptions<{ id: string } & IUpdateTaskPayload, IUpdateTaskResponse>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        ...options,
        mutationFn: ({ id, ...payload }: { id: string } & IUpdateTaskPayload) =>
            updateTaskRequest(id, payload),
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: [GET_TASKS] });
            options?.onSuccess?.(...args);
        },
    });
};

export const useDeleteTaskMutation = (
    options?: CustomUseMutationOptions<{ id: string; version: number }, IDeleteTaskResponse>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        ...options,
        mutationFn: ({ id, version }: { id: string; version: number }) =>
            deleteTaskRequest(id, { version }),
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: [GET_TASKS] });
            options?.onSuccess?.(...args);
        },
    });
};

export const resolveConflictRequest: TResolveConflictRequest = async (payload) =>
    (await axios.post("/api/v1/sync/resolve", payload)).data;

export const useResolveConflictMutation = (
    options?: CustomUseMutationOptions<IResolveConflictPayload, IResolveConflictResponse>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        ...options,
        mutationFn: (payload: IResolveConflictPayload) => resolveConflictRequest(payload),
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: [GET_TASKS] });
            options?.onSuccess?.(...args);
        },
    });
};
