import { useState } from "react";
import { Box, Card, CardContent, Chip, IconButton, Typography } from "@mui/material";
import { CalendarToday, MoreVert } from "@mui/icons-material";
import type { ITask } from "@/api/tasks/types";
import { formatDueDate, isOverdue } from "../utils";
import StatusChip from "./StatusChip";
import PriorityIndicator from "./PriorityIndicator";
import TaskContextMenu from "./TaskContextMenu";

interface TaskCardProps {
    task: ITask;
    onClick: () => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    return (
        <>
            <Card
                onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY });
                }}
                onClick={onClick}
                sx={{
                    cursor: "pointer",
                    borderRadius: 2,
                    transition: "box-shadow 0.2s, transform 0.15s",
                    "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <CardContent sx={{ flex: 1, pb: "12px !important" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <StatusChip
                            status={task.status}
                            taskId={task.id}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setContextMenu({ x: e.clientX, y: e.clientY });
                            }}
                            sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}
                        >
                            <MoreVert fontSize="small" />
                        </IconButton>
                    </Box>

                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {task.title}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mb: 1.5,
                            minHeight: "2.5em",
                        }}
                    >
                        {task.description}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <PriorityIndicator
                            priority={task.priority}
                            taskId={task.id}
                            onClick={(e) => e.stopPropagation()}
                        />

                        {task.dueDate && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
                                <Typography
                                    variant="caption"
                                    color={isOverdue(task.dueDate) ? "error" : "text.secondary"}
                                >
                                    {formatDueDate(task.dueDate)}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {task.tags.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1.5 }}>
                            {task.tags.slice(0, 3).map((tag) => (
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
                            {task.tags.length > 3 && (
                                <Chip
                                    label={`+${task.tags.length - 3}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 22 }}
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
            />
        </>
    );
};

export default TaskCard;
