import {
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    Add,
    CalendarToday,
    Close,
    Flag,
    LocalOffer,
    RadioButtonChecked,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateTaskMutation, useCreateTagMutation, useGetTagsQuery } from "@/api/tasks";
import type { ICreateTaskFormValues, ICreateTaskPayload } from "@/api/tasks/types";
import InlineTextField from "@/components/InlineTextField";
import PopoverSelect from "@/components/PopoverSelect";

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
    const { mutate: createTag } = useCreateTagMutation();
    const [tagSearch, setTagSearch] = useState("");

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

    const selectedTags = tags.filter((t) => tagsValue.includes(t.id));
    const filteredTags = tags.filter((t) =>
        t.name.toLowerCase().includes(tagSearch.toLowerCase())
    );
    const canCreateTag =
        tagSearch.trim().length > 0 &&
        !tags.some((t) => t.name.toLowerCase() === tagSearch.trim().toLowerCase());

    const toggleTag = (tagId: string) => {
        const current = tagsValue;
        if (current.includes(tagId)) {
            setValue("tags", current.filter((id) => id !== tagId));
        } else {
            if (current.length >= 20) {
                toast.error("Maximum 20 tags allowed");
                return;
            }
            setValue("tags", [...current, tagId]);
        }
    };

    const handleCreateTag = () => {
        const name = tagSearch.trim();
        if (!name) return;
        createTag(
            { name },
            {
                onSuccess: (data) => {
                    const newTagId = data.tag.id;
                    setValue("tags", [...tagsValue, newTagId]);
                    setTagSearch("");
                },
                onError: (error) => {
                    const message = error.response?.data?.message || "Failed to create tag.";
                    toast.error(message);
                },
            }
        );
    };

    const tagsDisplayValue = (() => {
        if (selectedTags.length === 0) return "None";
        if (selectedTags.length <= 2) return selectedTags.map((t) => t.name).join(", ");
        return `${selectedTags[0].name}, ${selectedTags[1].name} +${selectedTags.length - 2} more`;
    })();

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
                setTagSearch("");
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
        setTagSearch("");
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
                            <Box>
                                <PopoverSelect
                                    icon={<LocalOffer sx={{ fontSize: 20 }} />}
                                    label="Tags"
                                    displayValue={tagsDisplayValue}
                                    displayColor={selectedTags.length > 0 ? "text.primary" : "text.disabled"}
                                >
                                    <Box sx={{ width: 260 }}>
                                        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                                            <TextField
                                                variant="standard"
                                                size="small"
                                                placeholder="Search or create tag..."
                                                fullWidth
                                                value={tagSearch}
                                                onChange={(e) => setTagSearch(e.target.value)}
                                                autoFocus
                                            />
                                        </Box>
                                        {selectedTags.length > 0 && (
                                            <Box sx={{ px: 2, pb: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                                {selectedTags.map((tag) => (
                                                    <Chip
                                                        key={tag.id}
                                                        label={tag.name}
                                                        size="small"
                                                        onDelete={() => toggleTag(tag.id)}
                                                        sx={{
                                                            backgroundColor: tag.color,
                                                            color: "#fff",
                                                            borderRadius: "8px",
                                                            "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.7)" },
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                        <List dense sx={{ maxHeight: 200, overflow: "auto" }}>
                                            {filteredTags.map((tag) => (
                                                <ListItemButton key={tag.id} onClick={() => toggleTag(tag.id)} dense>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <Checkbox
                                                            edge="start"
                                                            checked={tagsValue.includes(tag.id)}
                                                            size="small"
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={tag.name}
                                                        primaryTypographyProps={{ variant: "body2" }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: "50%",
                                                            backgroundColor: tag.color,
                                                            ml: 1,
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                </ListItemButton>
                                            ))}
                                            {filteredTags.length === 0 && !canCreateTag && (
                                                <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
                                                    No tags found
                                                </Typography>
                                            )}
                                        </List>
                                        {canCreateTag && (
                                            <ListItemButton onClick={handleCreateTag} dense sx={{ borderTop: "1px solid", borderColor: "divider" }}>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <Add fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={`Create "${tagSearch.trim()}"`}
                                                    primaryTypographyProps={{ variant: "body2" }}
                                                />
                                            </ListItemButton>
                                        )}
                                    </Box>
                                </PopoverSelect>
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
