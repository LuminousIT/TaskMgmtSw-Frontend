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

export type TCreateTaskRequest = (data: ICreateTaskPayload) => Promise<ICreateTaskResponse>;
export type TGetTagsRequest = () => Promise<IGetTagsResponse>;
export type TCreateTagRequest = (data: ICreateTagPayload) => Promise<ICreateTagResponse>;
export type TUpdateTagRequest = (id: string, data: IUpdateTagPayload) => Promise<IUpdateTagResponse>;
export type TDeleteTagRequest = (id: string) => Promise<IDeleteTagResponse>;
