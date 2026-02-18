import { useState } from "react";
import {
    Box,
    Checkbox,
    Chip,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import { Add, Delete, Edit, LocalOffer, MoreVert } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
    useCreateTagMutation,
    useDeleteTagMutation,
    useGetTagsQuery,
    useUpdateTagMutation,
} from "@/api/tasks";
import type { ITag } from "@/api/tasks/types";
import PopoverSelect from "@/components/PopoverSelect";
import TagEditView from "@/components/TagEditView";

interface TagsPickerProps {
    value: string[];
    onChange: (tagIds: string[]) => void;
    maxTags?: number;
}

const TagsPicker = ({ value, onChange, maxTags = 20 }: TagsPickerProps) => {
    const { data: tags = [] } = useGetTagsQuery();
    const { mutate: createTag } = useCreateTagMutation();
    const { mutate: updateTag, isPending: isUpdating } = useUpdateTagMutation();
    const { mutate: deleteTag } = useDeleteTagMutation();

    const [tagSearch, setTagSearch] = useState("");
    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
    const [activeTag, setActiveTag] = useState<ITag | null>(null);
    const [editingTag, setEditingTag] = useState<ITag | null>(null);

    const selectedTags = tags.filter((t) => value.includes(t.id));
    const filteredTags = tags.filter((t) =>
        t.name.toLowerCase().includes(tagSearch.toLowerCase())
    );
    const canCreateTag =
        tagSearch.trim().length > 0 &&
        !tags.some((t) => t.name.toLowerCase() === tagSearch.trim().toLowerCase());

    const toggleTag = (tagId: string) => {
        if (value.includes(tagId)) {
            onChange(value.filter((id) => id !== tagId));
        } else {
            if (value.length >= maxTags) {
                toast.error(`Maximum ${maxTags} tags allowed`);
                return;
            }
            onChange([...value, tagId]);
        }
    };

    const handleCreateTag = () => {
        const name = tagSearch.trim();
        if (!name) return;
        createTag(
            { name },
            {
                onSuccess: (data) => {
                    onChange([...value, data.tag.id]);
                    setTagSearch("");
                },
                onError: (error) => {
                    const message = error.response?.data?.message || "Failed to create tag.";
                    toast.error(message);
                },
            }
        );
    };

    const handleDeleteTag = (tagId: string) => {
        deleteTag(tagId, {
            onSuccess: () => {
                if (value.includes(tagId)) {
                    onChange(value.filter((id) => id !== tagId));
                }
                toast.success("Tag deleted");
            },
            onError: (error) => {
                const message = error.response?.data?.message || "Failed to delete tag.";
                toast.error(message);
            },
        });
    };

    const handleUpdateTag = (payload: { name: string; color: string }) => {
        if (!editingTag) return;
        updateTag(
            { id: editingTag.id, ...payload },
            {
                onSuccess: () => {
                    setEditingTag(null);
                    toast.success("Tag updated");
                },
                onError: (error) => {
                    const message = error.response?.data?.message || "Failed to update tag.";
                    toast.error(message);
                },
            }
        );
    };

    const handlePopoverClose = () => {
        setEditingTag(null);
        setActiveTag(null);
    };

    const displayValue = (() => {
        if (selectedTags.length === 0) return "None";
        if (selectedTags.length <= 2) return selectedTags.map((t) => t.name).join(", ");
        return `${selectedTags[0].name}, ${selectedTags[1].name} +${selectedTags.length - 2} more`;
    })();

    return (
        <>
            <PopoverSelect
                icon={<LocalOffer sx={{ fontSize: 20 }} />}
                label="Tags"
                displayValue={displayValue}
                displayColor={selectedTags.length > 0 ? "text.primary" : "text.disabled"}
                onClose={handlePopoverClose}
            >
                {editingTag ? (
                    <TagEditView
                        tag={editingTag}
                        onSave={handleUpdateTag}
                        onCancel={() => setEditingTag(null)}
                        isSaving={isUpdating}
                    />
                ) : (
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
                                            checked={value.includes(tag.id)}
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
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveTag(tag);
                                            setMenuAnchorEl(e.currentTarget);
                                        }}
                                        sx={{ ml: 0.5, p: 0.25, opacity: 0.5, "&:hover": { opacity: 1 } }}
                                    >
                                        <MoreVert sx={{ fontSize: 16 }} />
                                    </IconButton>
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
                )}
            </PopoverSelect>

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={() => {
                    setMenuAnchorEl(null);
                    setActiveTag(null);
                }}
            >
                <MenuItem
                    onClick={() => {
                        setEditingTag(activeTag);
                        setMenuAnchorEl(null);
                    }}
                >
                    <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (activeTag) handleDeleteTag(activeTag.id);
                        setMenuAnchorEl(null);
                        setActiveTag(null);
                    }}
                >
                    <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>
        </>
    );
};

export default TagsPicker;
