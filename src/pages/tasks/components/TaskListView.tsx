import { useMemo, useState } from "react";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import { CalendarToday, MoreVert } from "@mui/icons-material";
import {
    DataGrid,
    type GridColDef,
    type GridPaginationModel,
    type GridRenderCellParams,
    type GridSortModel,
} from "@mui/x-data-grid";
import type { ITask } from "@/api/tasks/types";
import type { IGetTasksParams, IGetTasksResponse } from "@/api/tasks/types";
import type { ConflictData } from "@/components/ConflictResolutionDialog";
import { formatDueDate, isOverdue } from "../utils";
import { DEFAULT_PAGE_SIZE } from "../constants";
import StatusChip from "./StatusChip";
import PriorityIndicator from "./PriorityIndicator";
import TaskContextMenu from "./TaskContextMenu";
import TaskEmptyState from "./TaskEmptyState";

interface TaskListViewProps {
    tasks: ITask[];
    pagination?: IGetTasksResponse["pagination"];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    onPageChange: (page: number) => void;
    sortBy: NonNullable<IGetTasksParams["sortBy"]>;
    sortOrder: NonNullable<IGetTasksParams["sortOrder"]>;
    onSortChange: (sortBy: NonNullable<IGetTasksParams["sortBy"]>, sortOrder: NonNullable<IGetTasksParams["sortOrder"]>) => void;
    onTaskClick: (task: ITask) => void;
    onConflict?: (data: ConflictData) => void;
}

const TaskActionsCell = ({ task, onConflict }: { task: ITask; onConflict?: (data: ConflictData) => void }) => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    return (
        <>
            <Box onClick={(e) => e.stopPropagation()}>
                <IconButton
                    size="small"
                    onClick={(e) => setContextMenu({ x: e.clientX, y: e.clientY })}
                    sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}
                >
                    <MoreVert fontSize="small" />
                </IconButton>
            </Box>

            <TaskContextMenu
                anchorPosition={contextMenu}
                onClose={() => setContextMenu(null)}
                task={task}
                onConflict={onConflict}
            />
        </>
    );
};

const TaskListView = ({
    tasks,
    pagination,
    isLoading,
    isFetching,
    page,
    onPageChange,
    sortBy,
    sortOrder,
    onSortChange,
    onTaskClick,
    onConflict,
}: TaskListViewProps) => {
    if (!isLoading && tasks.length === 0) {
        return <TaskEmptyState />;
    }

    const columns = useMemo<GridColDef<ITask>[]>(
        () => [
            {
                field: "status",
                headerName: "Status",
                width: 130,
                sortable: true,
                renderCell: (params: GridRenderCellParams<ITask, ITask["status"]>) => (
                    <Box onClick={(e) => e.stopPropagation()}>
                        <StatusChip
                            status={params.row.status}
                            taskId={params.row.id}
                            version={params.row.version}
                        />
                    </Box>
                ),
            },
            {
                field: "title",
                headerName: "Title",
                flex: 1,
                minWidth: 260,
                sortable: true,
                renderCell: (params: GridRenderCellParams<ITask, ITask["title"]>) => (
                    <Typography variant="body2" fontWeight={600} noWrap>
                        {params.row.title}
                    </Typography>
                ),
            },
            {
                field: "priority",
                headerName: "Priority",
                width: 140,
                sortable: true,
                renderCell: (params: GridRenderCellParams<ITask, ITask["priority"]>) => (
                    <Box onClick={(e) => e.stopPropagation()}>
                        <PriorityIndicator
                            priority={params.row.priority}
                            taskId={params.row.id}
                            version={params.row.version}
                        />
                    </Box>
                ),
            },
            {
                field: "dueDate",
                headerName: "Due Date",
                width: 150,
                sortable: true,
                renderCell: (params: GridRenderCellParams<ITask, ITask["dueDate"]>) => (
                    params.row.dueDate ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, }}>
                            <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
                            <Typography
                                variant="caption"
                                color={isOverdue(params.row.dueDate) ? "error" : "text.secondary"}
                            >
                                {formatDueDate(params.row.dueDate)}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                    )
                ),
            },
            {
                field: "tags",
                headerName: "Tags",
                width: 220,
                sortable: false,
                renderCell: (params: GridRenderCellParams<ITask, ITask["tags"]>) => (
                    params.row.tags.length > 0 ? (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                            {params.row.tags.slice(0, 2).map((tag) => (
                                <Chip
                                    key={tag.id}
                                    label={tag.name}
                                    size="small"
                                    sx={{
                                        backgroundColor: tag.color,
                                        color: "#fff",
                                        fontSize: "0.7rem",
                                        height: 22,
                                    }}
                                />
                            ))}
                            {params.row.tags.length > 2 && (
                                <Chip
                                    label={`+${params.row.tags.length - 2}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 22 }}
                                />
                            )}
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                    )
                ),
            },
            {
                field: "actions",
                headerName: "",
                width: 56,
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                renderCell: (params: GridRenderCellParams<ITask>) => (
                    <TaskActionsCell task={params.row} onConflict={onConflict} />
                ),
            },
        ],
        [onConflict]
    );

    const sortModel: GridSortModel = [{ field: sortBy, sort: sortOrder }];
    const paginationModel: GridPaginationModel = {
        page: Math.max(page - 1, 0),
        pageSize: DEFAULT_PAGE_SIZE,
    };

    return (
        <Box sx={{ height: 620, opacity: isFetching && !isLoading ? 0.6 : 1, transition: "opacity 0.2s" }}>
            <DataGrid
                rows={tasks}
                columns={columns}
                getRowId={(row) => row.id}
                disableRowSelectionOnClick
                loading={isLoading}
                pagination
                paginationMode="server"
                paginationModel={paginationModel}
                pageSizeOptions={[DEFAULT_PAGE_SIZE]}
                rowCount={pagination?.total ?? 0}
                onPaginationModelChange={(model) => {
                    if (model.page !== paginationModel.page) {
                        onPageChange(model.page + 1);
                    }
                }}
                sortingMode="server"
                sortModel={sortModel}
                onSortModelChange={(model) => {
                    const nextSort = model[0];
                    if (!nextSort?.field || !nextSort?.sort) return;
                    onSortChange(
                        nextSort.field as NonNullable<IGetTasksParams["sortBy"]>,
                        nextSort.sort as NonNullable<IGetTasksParams["sortOrder"]>
                    );
                }}
                onRowClick={(params) => onTaskClick(params.row)}
                sx={{
                    border: 0,
                    "& .MuiDataGrid-cell": {
                        display: "flex",
                        alignItems: "center",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "background.paper",
                    },
                }}
            />
        </Box>
    );
};

export default TaskListView;
