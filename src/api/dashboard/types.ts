export interface IDashboardResponse {
    tasksByStatus: {
        todo: number;
        "in-progress": number;
        done: number;
    };
    tasksByPriority: {
        low: number;
        medium: number;
        high: number;
        urgent: number;
    };
    overdue: number;
    dueToday: number;
    dueThisWeek: number;
    totalTasks: number;
    completionRate: number;
}
