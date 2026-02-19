import { useState } from "react";
import { Box, Chip, Menu, MenuItem } from "@mui/material";
import { toast } from "react-toastify";
import { useUpdateTaskMutation } from "@/api/tasks";
import type { TaskStatus } from "@/api/tasks/types";
import { STATUS_OPTIONS } from "../constants";

interface StatusChipProps {
    status: TaskStatus;
    taskId: string;
    onClick?: (e: React.MouseEvent) => void;
}

const StatusChip = ({ status, taskId, onClick }: StatusChipProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const { mutate: updateTask, isPending } = useUpdateTaskMutation();

    const currentOption = STATUS_OPTIONS.find((o) => o.value === status)!;

    const handleChange = (newStatus: TaskStatus) => {
        updateTask(
            { id: taskId, status: newStatus },
            {
                onError: (error) => {
                    toast.error(error.response?.data?.message || "Failed to update status");
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
