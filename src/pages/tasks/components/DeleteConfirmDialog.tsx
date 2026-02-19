import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { useDeleteTaskMutation } from "@/api/tasks";
import type { ITask } from "@/api/tasks/types";

interface DeleteConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    task: ITask;
}

const DeleteConfirmDialog = ({ open, onClose, task }: DeleteConfirmDialogProps) => {
    const { mutate: deleteTask, isPending } = useDeleteTaskMutation();

    const handleDelete = () => {
        deleteTask({ id: task.id, version: task.version }, {
            onSuccess: () => {
                toast.success("Task deleted");
                onClose();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Failed to delete task");
            },
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: { sx: { borderRadius: 3 } },
                backdrop: { sx: { backdropFilter: "blur(4px)" } },
            }}
        >
            <DialogTitle>Delete Task</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button
                    color="error"
                    variant="contained"
                    disableElevation
                    onClick={handleDelete}
                    loading={isPending}
                    disabled={isPending}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmDialog;
