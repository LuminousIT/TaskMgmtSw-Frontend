import { useMemo } from "react";
import { Box, Card, Skeleton, Stack, Typography } from "@mui/material";
import { DragDropProvider } from "@dnd-kit/react";
import { useDroppable } from "@dnd-kit/react";
import type { DragEndEvent } from "@dnd-kit/react";
import { toast } from "react-toastify";
import type { ITask, TaskStatus } from "@/api/tasks/types";
import { useUpdateTaskMutation } from "@/api/tasks";
import { getClientId } from "@/utils/clientId";
import { STATUS_OPTIONS } from "../constants";
import TaskBoardCard from "./TaskBoardCard";
import TaskEmptyState from "./TaskEmptyState";

interface TaskBoardViewProps {
    tasks: ITask[];
    isLoading: boolean;
    isFetching: boolean;
    onTaskClick: (task: ITask) => void;
}

interface ColumnProps {
    status: TaskStatus;
    label: string;
    color: string;
    tasks: ITask[];
    onTaskClick: (task: ITask) => void;
}

const BoardColumn = ({ status, label, color, tasks, onTaskClick }: ColumnProps) => {
    const { ref, isDropTarget } = useDroppable({ id: status });

    return (
        <Box
            ref={ref}
            sx={{
                flex: 1,
                minWidth: 280,
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                backgroundColor: isDropTarget ? "action.hover" : "background.default",
                border: "1px solid",
                borderColor: isDropTarget ? "primary.main" : "divider",
                transition: "border-color 0.2s, background-color 0.2s",
                // overflowY: "scroll"
            }}
        >
            <Box sx={{ p: 2, pb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
                <Typography variant="subtitle2" fontWeight={600}>
                    {label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                    {tasks.length}
                </Typography>
            </Box>
            <Stack
                spacing={1}
                sx={{
                    p: 1.5,
                    pt: 0.5,
                    flex: 1,
                    overflowY: "auto",
                    maxHeight: "calc(100vh - 300px)",
                    minHeight: 100,
                }}
            >
                {tasks.length === 0 ? (
                    <Typography variant="caption" color="text.disabled" sx={{ textAlign: "center", py: 3 }}>
                        No tasks
                    </Typography>
                ) : (
                    tasks.map((task, index) => (
                        <TaskBoardCard
                            key={task.id}
                            task={task}
                            column={status}
                            index={index}
                            onClick={() => onTaskClick(task)}
                        />
                    ))
                )}
            </Stack>
        </Box>
    );
};

const BoardSkeleton = () => (
    <Box sx={{ display: "flex", gap: 2 }}>
        {Array.from({ length: 3 }).map((_, col) => (
            <Box key={col} sx={{ flex: 1, minWidth: 280 }}>
                <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Skeleton variant="circular" width={10} height={10} />
                    <Skeleton variant="text" width={80} />
                </Box>
                <Stack spacing={1} sx={{ px: 1.5 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} sx={{ borderRadius: 2 }}>
                            <Box sx={{ p: 1.5 }}>
                                <Skeleton variant="text" width="80%" height={22} />
                                <Skeleton variant="rounded" width={60} height={18} sx={{ mt: 0.5 }} />
                            </Box>
                        </Card>
                    ))}
                </Stack>
            </Box>
        ))}
    </Box>
);

const TaskBoardView = ({ tasks, isLoading, isFetching, onTaskClick }: TaskBoardViewProps) => {
    const { mutate: updateTask } = useUpdateTaskMutation();

    const grouped = useMemo(() => {
        const groups: Record<TaskStatus, ITask[]> = {
            todo: [],
            "in-progress": [],
            done: [],
        };
        for (const task of tasks) {
            groups[task.status]?.push(task);
        }
        return groups;
    }, [tasks]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { source, target } = event.operation;
        if (!source || !target) return;

        const taskData = source.data as { task: ITask; column: TaskStatus } | undefined;
        if (!taskData?.task) return;

        // target can be a sortable card (has data.column) or the droppable column itself (id = status)
        console.log({ target: target.data })
        const targetData = target.data as { column?: TaskStatus } | undefined;
        const newStatus = targetData?.column ?? target.id as TaskStatus;
        if (taskData.column === newStatus) return;

        updateTask(
            {
                id: taskData.task.id,
                status: newStatus,
                version: taskData.task.version,
                clientId: getClientId(),
            },
            {
                onError: (error) => {
                    toast.error(error.response?.data?.message || "Failed to update status");
                },
            }
        );
    };

    if (isLoading) {
        return <BoardSkeleton />;
    }

    if (tasks.length === 0) {
        return <TaskEmptyState />;
    }

    return (
        <DragDropProvider onDragEnd={handleDragEnd}>
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    opacity: isFetching ? 0.6 : 1,
                    transition: "opacity 0.2s",
                }}
            >
                {STATUS_OPTIONS.map((opt) => (
                    <BoardColumn
                        key={opt.value}
                        status={opt.value}
                        label={opt.label}
                        color={opt.color}
                        tasks={grouped[opt.value]}
                        onTaskClick={onTaskClick}
                    />
                ))}
            </Box>
        </DragDropProvider>
    );
};

export default TaskBoardView;
