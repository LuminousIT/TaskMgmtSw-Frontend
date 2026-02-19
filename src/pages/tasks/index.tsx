import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useGetTasksQuery } from "@/api/tasks";
import type { ITask } from "@/api/tasks/types";
import { useTaskFilters } from "./hooks/useTaskFilters";
import CreateTaskModal from "./components/CreateTaskModal";
import TaskFilterBar from "./components/TaskFilterBar";
import TaskGrid from "./components/TaskGrid";
import TaskDetailModal from "./components/TaskDetailModal";

const Tasks = () => {
    const [createOpen, setCreateOpen] = useState(false);
    const [detailTask, setDetailTask] = useState<ITask | null>(null);

    const {
        filters,
        apiParams,
        activeFilterChips,
        hasActiveFilters,
        setSearch,
        setStatuses,
        setPriorities,
        setDueRange,
        setTagIds,
        setSort,
        setPage,
        clearAll,
        removeFilter,
    } = useTaskFilters();

    const { data, isLoading, isFetching } = useGetTasksQuery(apiParams);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                    Tasks
                </Typography>
                <Button
                    variant="contained"
                    disableElevation
                    startIcon={<Add />}
                    onClick={() => setCreateOpen(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Create Task
                </Button>
            </Box>

            <TaskFilterBar
                filters={filters}
                activeChips={activeFilterChips}
                hasActiveFilters={hasActiveFilters}
                onSearchChange={setSearch}
                onStatusesChange={setStatuses}
                onPrioritiesChange={setPriorities}
                onDueRangeChange={setDueRange}
                onTagIdsChange={setTagIds}
                onSortChange={setSort}
                onRemoveFilter={removeFilter}
                onClearAll={clearAll}
            />

            <TaskGrid
                tasks={data?.tasks ?? []}
                pagination={data?.pagination}
                isLoading={isLoading}
                isFetching={isFetching}
                page={filters.page}
                onPageChange={setPage}
                onTaskClick={setDetailTask}
            />

            <CreateTaskModal open={createOpen} onClose={() => setCreateOpen(false)} />
            {detailTask && (
                <TaskDetailModal
                    task={detailTask}
                    open={!!detailTask}
                    onClose={() => setDetailTask(null)}
                />
            )}
        </Box>
    );
};

export default Tasks;
