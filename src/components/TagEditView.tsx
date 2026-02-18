import { useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { ArrowBack, Check } from "@mui/icons-material";
import InlineTextField from "@/components/InlineTextField";
import { TAG_PRESET_COLORS } from "@/constants/colors";
import type { ITag } from "@/api/tasks/types";

interface TagEditViewProps {
    tag: ITag;
    onSave: (payload: { name: string; color: string }) => void;
    onCancel: () => void;
    isSaving: boolean;
}

const TagEditView = ({ tag, onSave, onCancel, isSaving }: TagEditViewProps) => {
    const [name, setName] = useState(tag.name);
    const [color, setColor] = useState(tag.color);

    const canSave = name.trim().length > 0 && (name !== tag.name || color !== tag.color);

    return (
        <Box sx={{ width: 260, p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <IconButton size="small" onClick={onCancel}>
                    <ArrowBack fontSize="small" />
                </IconButton>
                <Typography variant="subtitle2">Edit Tag</Typography>
            </Box>

            <InlineTextField
                size="small"
                placeholder="Tag name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                sx={{ mb: 2 }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                Color
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {TAG_PRESET_COLORS.map((c) => (
                    <Box
                        key={c}
                        onClick={() => setColor(c)}
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            backgroundColor: c,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid",
                            borderColor: color === c ? "text.primary" : "transparent",
                        }}
                    >
                        {color === c && <Check sx={{ fontSize: 14, color: "#fff" }} />}
                    </Box>
                ))}
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: "action.hover",
                }}
            >
                <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                <Typography variant="body2">{name || "Tag name"}</Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button size="small" onClick={onCancel} disabled={isSaving}>
                    Cancel
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    onClick={() => onSave({ name: name.trim(), color })}
                    disabled={!canSave || isSaving}
                    loading={isSaving}
                >
                    Save
                </Button>
            </Box>
        </Box>
    );
};

export default TagEditView;
