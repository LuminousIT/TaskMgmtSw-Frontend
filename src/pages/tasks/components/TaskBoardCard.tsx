import { useState } from "react";
import { Box, Card, CardContent, Chip, IconButton, Typography } from "@mui/material";
import { CalendarToday, MoreVert } from "@mui/icons-material";
import { useSortable } from "@dnd-kit/react/sortable";
import type { ITask, TaskStatus } from "@/api/tasks/types";
import type { ConflictData } from "@/components/ConflictResolutionDialog";
import { formatDueDate, isOverdue } from "../utils";
import PriorityIndicator from "./PriorityIndicator";
import TaskContextMenu from "./TaskContextMenu";

interface TaskBoardCardProps {
    task: ITask;
    column: TaskStatus;
    index: number;
    onClick: () => void;
    onConflict?: (data: ConflictData) => void;
}

const TaskBoardCard = ({ task, column, index, onClick, onConflict }: TaskBoardCardProps) => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const { ref, isDragging } = useSortable({
        id: task.id,
        group: column,
        index,
        data: { task, column },
    });

    return (
        <>
            <Card
                ref={ref}
                onClick={() => { if (!isDragging) onClick(); }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY });
                }}
                sx={{
                    cursor: "grab",
                    borderRadius: 2,
                    opacity: isDragging ? 0.5 : 1,
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: 3 },
                }}
            >
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1, mr: 0.5 }}>
                            {task.title}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setContextMenu({ x: e.clientX, y: e.clientY });
                            }}
                            sx={{ opacity: 0.5, "&:hover": { opacity: 1 }, p: 0.25 }}
                        >
                            <MoreVert sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Box onClick={(e) => e.stopPropagation()}>
                            <PriorityIndicator
                                priority={task.priority}
                                taskId={task.id}
                                version={task.version}
                            />
                        </Box>

                        {task.dueDate && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 12, color: "text.secondary" }} />
                                <Typography
                                    variant="caption"
                                    sx={{ fontSize: "0.7rem" }}
                                    color={isOverdue(task.dueDate) ? "error" : "text.secondary"}
                                >
                                    {formatDueDate(task.dueDate)}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {task.tags.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                            {task.tags.slice(0, 2).map((tag) => (
                                <Chip
                                    key={tag.id}
                                    label={tag.name}
                                    size="small"
                                    sx={{
                                        backgroundColor: tag.color,
                                        color: "#fff",
                                        fontSize: "0.65rem",
                                        height: 20,
                                    }}
                                />
                            ))}
                            {task.tags.length > 2 && (
                                <Chip
                                    label={`+${task.tags.length - 2}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: "0.65rem" }}
                                />
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            <TaskContextMenu
                anchorPosition={contextMenu}
                onClose={() => setContextMenu(null)}
                task={task}
                onConflict={onConflict}
            />
        </>
    );
};

export default TaskBoardCard;
