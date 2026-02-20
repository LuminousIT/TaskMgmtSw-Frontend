import { Box, Grid, Pagination } from "@mui/material";
import type { ITask } from "@/api/tasks/types";
import type { ConflictData } from "@/components/ConflictResolutionDialog";
import TaskCard from "./TaskCard";
import TaskCardSkeleton from "./TaskCardSkeleton";
import TaskEmptyState from "./TaskEmptyState";

interface TaskGridProps {
    tasks: ITask[];
    pagination?: {
        page: number;
        totalPages: number;
    };
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    onPageChange: (page: number) => void;
    onTaskClick: (task: ITask) => void;
    onConflict?: (data: ConflictData) => void;
}

const TaskGrid = ({
    tasks,
    pagination,
    isLoading,
    isFetching,
    page,
    onPageChange,
    onTaskClick,
    onConflict,
}: TaskGridProps) => {
    if (isLoading) {
        return (
            <Grid container spacing={2}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                        <TaskCardSkeleton />
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (tasks.length === 0) {
        return <TaskEmptyState />;
    }

    return (
        <>
            <Grid
                container
                spacing={2}
                sx={{ opacity: isFetching ? 0.6 : 1, transition: "opacity 0.2s" }}
            >
                {tasks.map((task) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
                        <TaskCard task={task} onClick={() => onTaskClick(task)} onConflict={onConflict} />
                    </Grid>
                ))}
            </Grid>
            {pagination && pagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                        count={pagination.totalPages}
                        page={page}
                        onChange={(_, p) => onPageChange(p)}
                        color="primary"
                    />
                </Box>
            )}
        </>
    );
};

export default TaskGrid;
