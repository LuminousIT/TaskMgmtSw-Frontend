import { useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useGetTasksQuery } from "@/api/tasks";
import type { ITask } from "@/api/tasks/types";
import { useTaskFilters } from "./hooks/useTaskFilters";
import CreateTaskModal from "./components/CreateTaskModal";
import TaskFilterBar from "./components/TaskFilterBar";
import type { TaskViewMode } from "./components/TaskFilterBar";
import TaskGrid from "./components/TaskGrid";
import TaskListView from "./components/TaskListView";
import TaskBoardView from "./components/TaskBoardView";
import TaskDetailModal from "./components/TaskDetailModal";
import ConflictResolutionDialog from "@/components/ConflictResolutionDialog";
import type { ConflictData } from "@/components/ConflictResolutionDialog";

const VIEW_STORAGE_KEY = "tms_task_view";

const Tasks = () => {
    const [createOpen, setCreateOpen] = useState(false);
    const [detailTask, setDetailTask] = useState<ITask | null>(null);
    const [conflictData, setConflictData] = useState<ConflictData | null>(null);
    const [viewMode, setViewMode] = useState<TaskViewMode>(
        () => (localStorage.getItem(VIEW_STORAGE_KEY) as TaskViewMode) || "grid"
    );

    const handleViewModeChange = (mode: TaskViewMode) => {
        setViewMode(mode);
        localStorage.setItem(VIEW_STORAGE_KEY, mode);
    };

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

    const queryParams = useMemo(
        () => viewMode === "board" ? { ...apiParams, limit: 100 } : apiParams,
        [apiParams, viewMode]
    );

    const { data, isLoading, isFetching } = useGetTasksQuery(queryParams);

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
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onSearchChange={setSearch}
                onStatusesChange={setStatuses}
                onPrioritiesChange={setPriorities}
                onDueRangeChange={setDueRange}
                onTagIdsChange={setTagIds}
                onSortChange={setSort}
                onRemoveFilter={removeFilter}
                onClearAll={clearAll}
            />

            {viewMode === "board" ? (
                <TaskBoardView
                    tasks={data?.tasks ?? []}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    onTaskClick={setDetailTask}
                />
            ) : viewMode === "list" ? (
                <TaskListView
                    tasks={data?.tasks ?? []}
                    pagination={data?.pagination}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    page={filters.page}
                    onPageChange={setPage}
                    onTaskClick={setDetailTask}
                />
            ) : (
                <TaskGrid
                    tasks={data?.tasks ?? []}
                    pagination={data?.pagination}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    page={filters.page}
                    onPageChange={setPage}
                    onTaskClick={setDetailTask}
                />
            )}

            <CreateTaskModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onConflict={setConflictData}
            />
            {detailTask && (
                <TaskDetailModal
                    task={detailTask}
                    open={!!detailTask}
                    onClose={() => setDetailTask(null)}
                    onConflict={(data) => {
                        setDetailTask(null);
                        setConflictData(data);
                    }}
                />
            )}

            {conflictData && (
                <ConflictResolutionDialog
                    open={!!conflictData}
                    onClose={() => setConflictData(null)}
                    conflictData={conflictData}
                />
            )}
        </Box>
    );
};

export default Tasks;
