import type { TaskStatus, TaskPriority } from "@/api/tasks/types";

export const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
    { value: "todo", label: "To Do", color: "#6b7280" },
    { value: "in-progress", label: "In Progress", color: "#3b82f6" },
    { value: "done", label: "Done", color: "#22c55e" },
];

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
    { value: "low", label: "Low", color: "#6b7280" },
    { value: "medium", label: "Medium", color: "#3b82f6" },
    { value: "high", label: "High", color: "#f97316" },
    { value: "urgent", label: "Urgent", color: "#ef4444" },
];

export const SORT_OPTIONS = [
    { value: "createdAt", label: "Created Date" },
    { value: "updatedAt", label: "Updated Date" },
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "title", label: "Title" },
    { value: "status", label: "Status" },
];

export const DEFAULT_PAGE_SIZE = 12;
