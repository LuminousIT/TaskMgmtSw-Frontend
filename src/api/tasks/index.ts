import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../index";
import type { CustomUseMutationOptions, CustomUseQueryOptions } from "../types";
import type {
    ICreateTagPayload,
    ICreateTagResponse,
    ICreateTaskPayload,
    ICreateTaskResponse,
    IGetTagsResponse,
    ITag,
    TCreateTagRequest,
    TCreateTaskRequest,
    TGetTagsRequest,
} from "./types";
import { GET_TAGS } from "./constants";

export const createTaskRequest: TCreateTaskRequest = async (payload) =>
    (await axios.post("/api/v1/tasks", payload)).data;

export const getTagsRequest: TGetTagsRequest = async () =>
    (await axios.get("/api/v1/tags")).data;

export const useCreateTaskMutation = (
    options?: CustomUseMutationOptions<ICreateTaskPayload, ICreateTaskResponse>
) => {
    return useMutation({
        ...options,
        mutationFn: (payload: ICreateTaskPayload) => createTaskRequest(payload),
        onSuccess: (...args) => {
            options?.onSuccess?.(...args);
        },
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
