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
import { useCreateTaskMutation } from "@/api/tasks";
import type { ICreateTaskFormValues, ICreateTaskPayload } from "@/api/tasks/types";
import InlineTextField from "@/components/InlineTextField";
import PopoverSelect from "@/components/PopoverSelect";
import TagsPicker from "@/components/TagsPicker";

interface CreateTaskModalProps {
    open: boolean;
    onClose: () => void;
}

const STATUS_OPTIONS = [
    { value: "todo", label: "To Do" },
    { value: "in-progress", label: "In Progress" },
    { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
];

const CreateTaskModal = ({ open, onClose }: CreateTaskModalProps) => {
    const { mutate: createTask, isPending } = useCreateTaskMutation();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ICreateTaskFormValues>({
        defaultValues: {
            title: "",
            description: "",
            status: "todo",
            priority: "medium",
            dueDate: "",
            tags: [],
        },
    });

    const statusValue = watch("status");
    const priorityValue = watch("priority");
    const dueDateValue = watch("dueDate");
    const tagsValue = watch("tags");

    const statusLabel = STATUS_OPTIONS.find((o) => o.value === statusValue)?.label ?? "To Do";
    const priorityLabel = PRIORITY_OPTIONS.find((o) => o.value === priorityValue)?.label ?? "Medium";

    const onSubmit: SubmitHandler<ICreateTaskFormValues> = (data) => {
        const payload: ICreateTaskPayload = {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            clientId: crypto.randomUUID(),
            ...(data.dueDate && { dueDate: data.dueDate }),
            ...(data.tags.length > 0 && { tags: data.tags }),
        };

        createTask(payload, {
            onSuccess: () => {
                toast.success("Task created successfully!");
                reset();
                onClose();
            },
            onError: (error) => {
                const message =
                    error.response?.data?.message || "Failed to create task.";
                toast.error(message);
            },
        });
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
                paper: {
                    sx: { borderRadius: 3 },
                },
                backdrop: {
                    sx: { backdropFilter: "blur(4px)" },
                },
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
                    Create Task
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
                                    onChange={(v) => setValue("status", v as ICreateTaskFormValues["status"])}
                                />
                                <PopoverSelect
                                    icon={<Flag sx={{ fontSize: 20 }} />}
                                    label="Priority"
                                    displayValue={priorityLabel}
                                    options={PRIORITY_OPTIONS}
                                    value={priorityValue}
                                    onChange={(v) => setValue("priority", v as ICreateTaskFormValues["priority"])}
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
                                            onChange={(e) => setValue("dueDate", e.target.value)}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    </Box>
                                </PopoverSelect>
                            </Stack>
                            <Box sx={{ mt: 1 }}>
                                <TagsPicker
                                    value={tagsValue}
                                    onChange={(ids) => setValue("tags", ids)}
                                />
                            </Box>
                        </Box>
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
                        disabled={isPending}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default CreateTaskModal;
