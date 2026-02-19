export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface ITag {
    id: string;
    name: string;
    color: string;
}

export interface ITask {
    id: string;
    userId: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string | null;
    version: number;
    lastSyncedAt: string | null;
    clientId: string;
    tags: ITag[];
}

export interface ICreateTaskPayload {
    title: string;
    description: string;
    clientId: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    tags?: string[];
    tempId?: string;
}

export interface ICreateTaskResponse {
    task: ITask;
    tempId?: string;
}

export interface IGetTagsResponse {
    tags: ITag[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ICreateTaskFormValues {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    tags: string[];
}

export interface ICreateTagPayload {
    name: string;
    color?: string;
}

export interface ICreateTagResponse {
    tag: ITag;
}

export interface IUpdateTagPayload {
    name?: string;
    color?: string;
}

export interface IUpdateTagResponse {
    tag: ITag;
}

export interface IDeleteTagResponse {
    success: boolean;
    message: string;
    deletedAt: string;
}

export interface IGetTasksParams {
    page?: number;
    limit?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueAfter?: string;
    dueBefore?: string;
    search?: string;
    tags?: string;
    sortBy?: "createdAt" | "updatedAt" | "dueDate" | "priority" | "title" | "status";
    sortOrder?: "asc" | "desc";
}

export interface IGetTasksResponse {
    tasks: ITask[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
    filters: { applied: string[] };
    syncMetadata: { latestVersion: number; serverTime: string };
}

export interface IUpdateTaskPayload {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    tags?: string[];
    version?: number;
}

export interface IDeleteTaskPayload {
    version: number;
}

export interface IUpdateTaskResponse {
    task: ITask;
}

export interface IDeleteTaskResponse {
    success: boolean;
    message: string;
}

export type TCreateTaskRequest = (data: ICreateTaskPayload) => Promise<ICreateTaskResponse>;
export type TGetTasksRequest = (params?: IGetTasksParams) => Promise<IGetTasksResponse>;
export type TGetTagsRequest = () => Promise<IGetTagsResponse>;
export type TCreateTagRequest = (data: ICreateTagPayload) => Promise<ICreateTagResponse>;
export type TUpdateTagRequest = (id: string, data: IUpdateTagPayload) => Promise<IUpdateTagResponse>;
export type TDeleteTagRequest = (id: string) => Promise<IDeleteTagResponse>;
export type TUpdateTaskRequest = (id: string, data: IUpdateTaskPayload) => Promise<IUpdateTaskResponse>;
export type TDeleteTaskRequest = (id: string, data: IDeleteTaskPayload) => Promise<IDeleteTaskResponse>;
