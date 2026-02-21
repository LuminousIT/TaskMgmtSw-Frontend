import { useState } from "react";
import { ButtonBase, Menu, MenuItem, Typography } from "@mui/material";
import { Flag } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useUpdateTaskMutation } from "@/api/tasks";
import type { TaskPriority } from "@/api/tasks/types";
import { GET_TASKS } from "@/api/tasks/constants";
import { getClientId } from "@/utils/clientId";
import { PRIORITY_OPTIONS } from "../constants";

interface PriorityIndicatorProps {
    priority: TaskPriority;
    taskId: string;
    version: number;
    onClick?: (e: React.MouseEvent) => void;
}

const PriorityIndicator = ({ priority, taskId, version, onClick }: PriorityIndicatorProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const queryClient = useQueryClient();
    const { mutate: updateTask, isPending } = useUpdateTaskMutation();

    const currentOption = PRIORITY_OPTIONS.find((o) => o.value === priority)!;

    const handleChange = (newPriority: TaskPriority) => {
        updateTask(
            { id: taskId, priority: newPriority, version, clientId: getClientId() },
            {
                onError: (error) => {
                    if (error.response?.status === 409) {
                        toast.warning("Conflict detected — task was modified. Refreshing...");
                        queryClient.invalidateQueries({ queryKey: [GET_TASKS] });
                    } else {
                        toast.error(error.response?.data?.message || "Failed to update priority");
                    }
                },
            }
        );
        setAnchorEl(null);
    };

    return (
        <>
            <ButtonBase
                onClick={(e) => {
                    onClick?.(e);
                    setAnchorEl(e.currentTarget);
                }}
                disabled={isPending}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    borderRadius: 1,
                    px: 0.75,
                    py: 0.25,
                    "&:hover": { backgroundColor: "action.hover" },
                }}
            >
                <Flag sx={{ fontSize: 16, color: currentOption.color }} />
                <Typography variant="caption" sx={{ color: currentOption.color, fontWeight: 600 }}>
                    {currentOption.label}
                </Typography>
            </ButtonBase>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                {PRIORITY_OPTIONS.map((opt) => (
                    <MenuItem
                        key={opt.value}
                        selected={opt.value === priority}
                        onClick={() => handleChange(opt.value)}
                    >
                        <Flag sx={{ fontSize: 16, color: opt.color, mr: 1 }} />
                        {opt.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default PriorityIndicator;
