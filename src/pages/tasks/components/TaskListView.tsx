import { useState } from "react";
import {
    Box,
    Chip,
    IconButton,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { CalendarToday, MoreVert } from "@mui/icons-material";
import type { ITask } from "@/api/tasks/types";
import { formatDueDate, isOverdue } from "../utils";
import StatusChip from "./StatusChip";
import PriorityIndicator from "./PriorityIndicator";
import TaskContextMenu from "./TaskContextMenu";
import TaskListSkeleton from "./TaskListSkeleton";
import TaskEmptyState from "./TaskEmptyState";

interface TaskListViewProps {
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
}

const TaskListRow = ({ task, onTaskClick }: { task: ITask; onTaskClick: (task: ITask) => void }) => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    return (
        <>
            <TableRow
                hover
                onClick={() => onTaskClick(task)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY });
                }}
                sx={{ cursor: "pointer", "& td": { py: 1.5 } }}
            >
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <StatusChip status={task.status} taskId={task.id} version={task.version} />
                </TableCell>
                <TableCell>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 300 }}>
                        {task.title}
                    </Typography>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <PriorityIndicator priority={task.priority} taskId={task.id} version={task.version} />
                </TableCell>
                <TableCell>
                    {task.dueDate ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
                            <Typography
                                variant="caption"
                                color={isOverdue(task.dueDate) ? "error" : "text.secondary"}
                            >
                                {formatDueDate(task.dueDate)}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                </TableCell>
                <TableCell>
                    {task.tags.length > 0 ? (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                            {task.tags.slice(0, 2).map((tag) => (
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
                            {task.tags.length > 2 && (
                                <Chip
                                    label={`+${task.tags.length - 2}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 22 }}
                                />
                            )}
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <IconButton
                        size="small"
                        onClick={(e) => setContextMenu({ x: e.clientX, y: e.clientY })}
                        sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}
                    >
                        <MoreVert fontSize="small" />
                    </IconButton>
                </TableCell>
            </TableRow>

            <TaskContextMenu
                anchorPosition={contextMenu}
                onClose={() => setContextMenu(null)}
                task={task}
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
    onTaskClick,
}: TaskListViewProps) => {
    if (!isLoading && tasks.length === 0) {
        return <TaskEmptyState />;
    }

    return (
        <>
            <TableContainer sx={{ opacity: isFetching && !isLoading ? 0.6 : 1, transition: "opacity 0.2s" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, width: 120 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: 120 }}>Priority</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: 130 }}>Due Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: 180 }}>Tags</TableCell>
                            <TableCell sx={{ width: 48 }} />
                        </TableRow>
                    </TableHead>
                    {isLoading ? (
                        <TaskListSkeleton />
                    ) : (
                        <TableBody>
                            {tasks.map((task) => (
                                <TaskListRow key={task.id} task={task} onTaskClick={onTaskClick} />
                            ))}
                        </TableBody>
                    )}
                </Table>
            </TableContainer>
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

export default TaskListView;
