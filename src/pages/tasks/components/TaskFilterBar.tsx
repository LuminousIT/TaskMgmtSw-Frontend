import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Popover,
    Select,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import {
    ArrowDownward,
    ArrowUpward,
    Clear,
    FilterList,
    Search,
    ViewKanban,
    ViewList,
    ViewModule,
} from "@mui/icons-material";
import type { TaskFiltersState } from "../hooks/useTaskFilters";
import type { IGetTasksParams, TaskPriority, TaskStatus } from "@/api/tasks/types";
import { PRIORITY_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from "../constants";
import TagsPicker from "@/components/TagsPicker";

export type TaskViewMode = "grid" | "list" | "board";

interface TaskFilterBarProps {
    filters: TaskFiltersState;
    activeChips: { type: string; label: string; value?: string }[];
    hasActiveFilters: boolean;
    viewMode: TaskViewMode;
    onViewModeChange: (mode: TaskViewMode) => void;
    onSearchChange: (search: string) => void;
    onStatusesChange: (statuses: TaskStatus[]) => void;
    onPrioritiesChange: (priorities: TaskPriority[]) => void;
    onDueRangeChange: (dueAfter: string, dueBefore: string) => void;
    onTagIdsChange: (tagIds: string[]) => void;
    onSortChange: (sortBy: IGetTasksParams["sortBy"], sortOrder: "asc" | "desc") => void;
    onRemoveFilter: (type: string, value?: string) => void;
    onClearAll: () => void;
}

const TaskFilterBar = ({
    filters,
    activeChips,
    hasActiveFilters,
    viewMode,
    onViewModeChange,
    onSearchChange,
    onStatusesChange,
    onPrioritiesChange,
    onDueRangeChange,
    onTagIdsChange,
    onSortChange,
    onRemoveFilter,
    onClearAll,
}: TaskFilterBarProps) => {
    const [localSearch, setLocalSearch] = useState(filters.search);
    const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
    const [priorityAnchor, setPriorityAnchor] = useState<HTMLElement | null>(null);
    const [dateAnchor, setDateAnchor] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(localSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearch, onSearchChange]);

    const toggleStatus = (status: TaskStatus) => {
        const next = filters.statuses.includes(status)
            ? filters.statuses.filter((s) => s !== status)
            : [...filters.statuses, status];
        onStatusesChange(next);
    };

    const togglePriority = (priority: TaskPriority) => {
        const next = filters.priorities.includes(priority)
            ? filters.priorities.filter((p) => p !== priority)
            : [...filters.priorities, priority];
        onPrioritiesChange(next);
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                {/* Search */}
                <TextField
                    size="small"
                    placeholder="Search tasks..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ fontSize: 20, color: "text.secondary" }} />
                                </InputAdornment>
                            ),
                            endAdornment: localSearch ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setLocalSearch("")}>
                                        <Clear sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        },
                    }}
                    sx={{ minWidth: 220 }}
                />

                {/* Status filter */}
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FilterList sx={{ fontSize: 16 }} />}
                    onClick={(e) => setStatusAnchor(e.currentTarget)}
                    sx={{ textTransform: "none" }}
                >
                    Status{filters.statuses.length > 0 && ` (${filters.statuses.length})`}
                </Button>
                <Popover
                    open={!!statusAnchor}
                    anchorEl={statusAnchor}
                    onClose={() => setStatusAnchor(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                    <List dense sx={{ minWidth: 180 }}>
                        {STATUS_OPTIONS.map((opt) => (
                            <ListItemButton key={opt.value} onClick={() => toggleStatus(opt.value)} dense>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Checkbox
                                        edge="start"
                                        checked={filters.statuses.includes(opt.value)}
                                        size="small"
                                    />
                                </ListItemIcon>
                                <ListItemText primary={opt.label} primaryTypographyProps={{ variant: "body2" }} />
                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: opt.color, ml: 1 }} />
                            </ListItemButton>
                        ))}
                    </List>
                </Popover>

                {/* Priority filter */}
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FilterList sx={{ fontSize: 16 }} />}
                    onClick={(e) => setPriorityAnchor(e.currentTarget)}
                    sx={{ textTransform: "none" }}
                >
                    Priority{filters.priorities.length > 0 && ` (${filters.priorities.length})`}
                </Button>
                <Popover
                    open={!!priorityAnchor}
                    anchorEl={priorityAnchor}
                    onClose={() => setPriorityAnchor(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                    <List dense sx={{ minWidth: 180 }}>
                        {PRIORITY_OPTIONS.map((opt) => (
                            <ListItemButton key={opt.value} onClick={() => togglePriority(opt.value)} dense>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Checkbox
                                        edge="start"
                                        checked={filters.priorities.includes(opt.value)}
                                        size="small"
                                    />
                                </ListItemIcon>
                                <ListItemText primary={opt.label} primaryTypographyProps={{ variant: "body2" }} />
                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: opt.color, ml: 1 }} />
                            </ListItemButton>
                        ))}
                    </List>
                </Popover>

                {/* Due date range */}
                <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => setDateAnchor(e.currentTarget)}
                    sx={{ textTransform: "none" }}
                >
                    Due Date
                </Button>
                <Popover
                    open={!!dateAnchor}
                    anchorEl={dateAnchor}
                    onClose={() => setDateAnchor(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5, minWidth: 200 }}>
                        <Typography variant="caption" color="text.secondary">Due date range</Typography>
                        <TextField
                            type="date"
                            size="small"
                            label="From"
                            value={filters.dueAfter}
                            onChange={(e) => onDueRangeChange(e.target.value, filters.dueBefore)}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField
                            type="date"
                            size="small"
                            label="To"
                            value={filters.dueBefore}
                            onChange={(e) => onDueRangeChange(filters.dueAfter, e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Box>
                </Popover>

                {/* Tags filter */}
                <TagsPicker
                    value={filters.tagIds}
                    onChange={onTagIdsChange}
                />

                {/* Sort + View toggle */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
                    <Select
                        size="small"
                        value={filters.sortBy}
                        onChange={(e) => onSortChange(e.target.value as IGetTasksParams["sortBy"], filters.sortOrder)}
                        sx={{ minWidth: 140, fontSize: "0.875rem" }}
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                    <IconButton
                        size="small"
                        onClick={() => onSortChange(filters.sortBy, filters.sortOrder === "asc" ? "desc" : "asc")}
                    >
                        {filters.sortOrder === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                    </IconButton>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, v) => { if (v) onViewModeChange(v); }}
                        size="small"
                    >
                        <ToggleButton value="grid" aria-label="Grid view">
                            <ViewModule fontSize="small" />
                        </ToggleButton>
                        <ToggleButton value="list" aria-label="List view">
                            <ViewList fontSize="small" />
                        </ToggleButton>
                        <ToggleButton value="board" aria-label="Board view">
                            <ViewKanban fontSize="small" />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>

            {/* Active filter chips */}
            {hasActiveFilters && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.5, flexWrap: "wrap" }}>
                    {activeChips.map((chip, i) => (
                        <Chip
                            key={`${chip.type}-${chip.value ?? i}`}
                            label={chip.label}
                            size="small"
                            onDelete={() => onRemoveFilter(chip.type, chip.value)}
                        />
                    ))}
                    <Button size="small" onClick={onClearAll} sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                        Clear all
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default TaskFilterBar;
