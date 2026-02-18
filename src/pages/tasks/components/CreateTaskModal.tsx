import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useCreateTaskMutation, useGetTagsQuery } from "@/api/tasks";
import type { ICreateTaskFormValues, ICreateTaskPayload } from "@/api/tasks/types";

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
    const { data: tags = [] } = useGetTagsQuery();
    const { mutate: createTask, isPending } = useCreateTaskMutation();

    const {
        register,
        handleSubmit,
        control,
        reset,
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
                        <TextField
                            // label="Title"
                            variant="filled"
                            placeholder="Task title here..."
                            fullWidth
                            error={!!errors.title}
                            helperText={errors.title?.message}
                            {...register("title", {
                                required: "Title is required",
                                maxLength: {
                                    value: 255,
                                    message: "Title must be at most 255 characters",
                                },
                            })}
                        />
                        <TextField
                            label="Description"
                            variant="filled"
                            fullWidth
                            multiline
                            rows={3}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            {...register("description", {
                                required: "Description is required",
                            })}
                        />

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                                Details
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <TextField
                                    label="Status"
                                    variant="filled"
                                    fullWidth
                                    select
                                    defaultValue="todo"
                                    error={!!errors.status}
                                    helperText={errors.status?.message}
                                    {...register("status")}
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Priority"
                                    variant="filled"
                                    fullWidth
                                    select
                                    defaultValue="medium"
                                    error={!!errors.priority}
                                    helperText={errors.priority?.message}
                                    {...register("priority")}
                                >
                                    {PRIORITY_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Box>

                        <TextField
                            label="Due Date"
                            type="date"
                            variant="filled"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            {...register("dueDate")}
                        />

                        <Controller
                            name="tags"
                            control={control}
                            rules={{
                                validate: (v) =>
                                    v.length <= 20 || "Maximum 20 tags allowed",
                            }}
                            render={({ field }) => (
                                <Autocomplete
                                    multiple
                                    options={tags}
                                    getOptionLabel={(option) => option.name}
                                    value={tags.filter((t) =>
                                        field.value.includes(t.id)
                                    )}
                                    onChange={(_, newValue) =>
                                        field.onChange(newValue.map((t) => t.id))
                                    }
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                label={option.name}
                                                size="small"
                                                {...getTagProps({ index })}
                                                key={option.id}
                                                sx={{
                                                    backgroundColor: option.color,
                                                    color: "#fff",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Tags"
                                            variant="filled"
                                            error={!!errors.tags}
                                            helperText={errors.tags?.message}
                                        />
                                    )}
                                />
                            )}
                        />
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
