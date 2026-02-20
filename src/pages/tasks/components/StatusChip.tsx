import { useState } from "react";
import { Box, Chip, Menu, MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useUpdateTaskMutation } from "@/api/tasks";
import type { TaskStatus } from "@/api/tasks/types";
import { GET_TASKS } from "@/api/tasks/constants";
import { getClientId } from "@/utils/clientId";
import { STATUS_OPTIONS } from "../constants";

interface StatusChipProps {
    status: TaskStatus;
    taskId: string;
    version: number;
    onClick?: (e: React.MouseEvent) => void;
}

const StatusChip = ({ status, taskId, version, onClick }: StatusChipProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const queryClient = useQueryClient();
    const { mutate: updateTask, isPending } = useUpdateTaskMutation();

    const currentOption = STATUS_OPTIONS.find((o) => o.value === status)!;

    const handleChange = (newStatus: TaskStatus) => {
        updateTask(
            { id: taskId, status: newStatus, version, clientId: getClientId() },
            {
                onError: (error) => {
                    if (error.response?.status === 409) {
                        toast.warning("Conflict detected — task was modified. Refreshing...");
                        queryClient.invalidateQueries({ queryKey: [GET_TASKS] });
                    } else {
                        toast.error(error.response?.data?.message || "Failed to update status");
                    }
                },
            }
        );
        setAnchorEl(null);
    };

    return (
        <>
            <Chip
                label={currentOption.label}
                size="small"
                onClick={(e) => {
                    onClick?.(e);
                    setAnchorEl(e.currentTarget);
                }}
                sx={{
                    backgroundColor: `${currentOption.color}20`,
                    color: currentOption.color,
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: `${currentOption.color}30` },
                }}
                disabled={isPending}
            />
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                {STATUS_OPTIONS.map((opt) => (
                    <MenuItem
                        key={opt.value}
                        selected={opt.value === status}
                        onClick={() => handleChange(opt.value)}
                    >
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: opt.color, mr: 1 }} />
                        {opt.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default StatusChip;
