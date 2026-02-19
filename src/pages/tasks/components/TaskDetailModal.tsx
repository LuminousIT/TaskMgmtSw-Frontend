import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    CalendarToday,
    Close,
    Flag,
    RadioButtonChecked,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useUpdateTaskMutation } from "@/api/tasks";
import type { ICreateTaskFormValues, ITask, IUpdateTaskPayload } from "@/api/tasks/types";
import { getClientId } from "@/utils/clientId";
import InlineTextField from "@/components/InlineTextField";
import PopoverSelect from "@/components/PopoverSelect";
import TagsPicker from "@/components/TagsPicker";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "../constants";

interface TaskDetailModalProps {
    task: ITask;
    open: boolean;
    onClose: () => void;
}

const TaskDetailModal = ({ task, open, onClose }: TaskDetailModalProps) => {
    const { mutate: updateTask, isPending } = useUpdateTaskMutation();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isDirty },
    } = useForm<ICreateTaskFormValues>({
        defaultValues: {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ?? "",
            tags: task.tags.map((t) => t.id),
        },
    });

    const statusValue = watch("status");
    const priorityValue = watch("priority");
    const dueDateValue = watch("dueDate");
    const tagsValue = watch("tags");

    const statusLabel = STATUS_OPTIONS.find((o) => o.value === statusValue)?.label ?? "To Do";
    const priorityLabel = PRIORITY_OPTIONS.find((o) => o.value === priorityValue)?.label ?? "Medium";

    const onSubmit: SubmitHandler<ICreateTaskFormValues> = (data) => {
        const payload: IUpdateTaskPayload = {
            clientId: getClientId(),
        };

        if (data.title !== task.title) payload.title = data.title;
        if (data.description !== task.description) payload.description = data.description;
        if (data.status !== task.status) payload.status = data.status;
        if (data.priority !== task.priority) payload.priority = data.priority;

        const newDueDate = data.dueDate || null;
        if (newDueDate !== task.dueDate) payload.dueDate = newDueDate;

        const originalTagIds = task.tags.map((t) => t.id).sort().join(",");
        const newTagIds = [...data.tags].sort().join(",");
        if (originalTagIds !== newTagIds) payload.tags = data.tags;

        if (Object.keys(payload).length === 0) {
            onClose();
            return;
        }

        updateTask(
            { id: task.id, ...payload, version: task.version },
            {
                onSuccess: () => {
                    toast.success("Task updated successfully!");
                    onClose();
                },
                onError: (error) => {
                    const message = error.response?.data?.message || "Failed to update task.";
                    toast.error(message);
                },
            }
        );
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            TransitionProps={{ timeout: 300 }}
            slotProps={{
                paper: { sx: { borderRadius: 3 } },
                backdrop: { sx: { backdropFilter: "blur(4px)" } },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 2,
                }}
            >
                <Typography variant="h6" component="span" fontWeight={600}>
                    Edit Task
                </Typography>
                <IconButton onClick={handleClose} size="small" sx={{ color: "text.secondary" }}>
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                    <Stack spacing={2.5}>
                        <InlineTextField
                            placeholder="Task title here..."
                            error={!!errors.title}
                            helperText={errors.title?.message}
                            {...register("title", {
                                required: "Title is required",
                                maxLength: {
                                    value: 255,
                                    message: "Title must be at most 255 characters",
                                },
                            })}
                            sx={{
                                "& .MuiInputBase-root": {
                                    fontSize: "1.25rem",
                                    fontWeight: 600,
                                },
                                "& .MuiInputBase-input::placeholder": {
                                    fontWeight: 600,
                                },
                            }}
                        />
                        <InlineTextField
                            placeholder="Add a description..."
                            multiline
                            rows={3}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            {...register("description", {
                                required: "Description is required",
                            })}
                        />

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                                Details
                            </Typography>
                            <Stack spacing={2} direction="row" flexWrap="wrap">
                                <PopoverSelect
                                    icon={<RadioButtonChecked sx={{ fontSize: 20 }} />}
                                    label="Status"
                                    displayValue={statusLabel}
                                    options={STATUS_OPTIONS}
                                    value={statusValue}
                                    onChange={(v) => setValue("status", v as ICreateTaskFormValues["status"], { shouldDirty: true })}
                                />
                                <PopoverSelect
                                    icon={<Flag sx={{ fontSize: 20 }} />}
                                    label="Priority"
                                    displayValue={priorityLabel}
                                    options={PRIORITY_OPTIONS}
                                    value={priorityValue}
                                    onChange={(v) => setValue("priority", v as ICreateTaskFormValues["priority"], { shouldDirty: true })}
                                />
                                <PopoverSelect
                                    icon={<CalendarToday sx={{ fontSize: 20 }} />}
                                    label="Due Date"
                                    displayValue={dueDateValue || "None"}
                                    displayColor={dueDateValue ? "text.primary" : "text.disabled"}
                                >
                                    <Box sx={{ p: 2 }}>
                                        <TextField
                                            type="date"
                                            size="small"
                                            value={dueDateValue}
                                            onChange={(e) => setValue("dueDate", e.target.value, { shouldDirty: true })}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    </Box>
                                </PopoverSelect>
                            </Stack>
                            <Box sx={{ mt: 1 }}>
                                <TagsPicker
                                    value={tagsValue}
                                    onChange={(ids) => setValue("tags", ids, { shouldDirty: true })}
                                />
                            </Box>
                        </Box>

                        <Typography variant="caption" color="text.disabled">
                            Created {new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {" · "}
                            Updated {new Date(task.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        borderTop: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disableElevation
                        loading={isPending}
                        disabled={isPending || !isDirty}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default TaskDetailModal;
