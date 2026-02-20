import { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import type { ITask } from "@/api/tasks/types";
import type { ConflictData } from "@/components/ConflictResolutionDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import TaskDetailModal from "./TaskDetailModal";

interface TaskContextMenuProps {
    anchorPosition: { x: number; y: number } | null;
    onClose: () => void;
    task: ITask;
    onConflict?: (data: ConflictData) => void;
}

const TaskContextMenu = ({ anchorPosition, onClose, task, onConflict }: TaskContextMenuProps) => {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);

    return (
        <>
            <Menu
                open={!!anchorPosition}
                onClose={onClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    anchorPosition ? { top: anchorPosition.y, left: anchorPosition.x } : undefined
                }
            >
                <MenuItem
                    onClick={() => {
                        setDetailOpen(true);
                        onClose();
                    }}
                >
                    <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setDeleteOpen(true);
                        onClose();
                    }}
                    sx={{ color: "error.main" }}
                >
                    <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>

            <DeleteConfirmDialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                task={task}
            />
            {detailOpen && (
                <TaskDetailModal
                    task={task}
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    onConflict={onConflict}
                />
            )}
        </>
    );
};

export default TaskContextMenu;
